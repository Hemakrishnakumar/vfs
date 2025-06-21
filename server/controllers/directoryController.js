import { rm } from 'fs/promises';
import path from "path";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";


async function deleteDirectoryData(id) {
  //delete all the files in the directory.
  const filesList = await File.find({ parentDirId: id }, { extension: 1 }).lean();
  for (let i = 0; i < filesList.length; i++) {
    const { _id, extension } = filesList[i];
    await rm(path.join(`${process.cwd()}/storage/`, `${_id.toString()}${extension}`));
    await File.deleteOne({ _id });
  }
  // Get All the directories in it.
  const list = await Directory.find({ parentDirId: id }, { projection: { _id: 1 } }).lean();
  //delete that directory
  await Directory.deleteOne({ _id: id });
  //delete all the child directories along with it's data.
  for (let i = 0; i < list.length; i++) {
    await deleteDirectoryData(list[i]._id);
  }
}

export const getDirectories = async (req, res) => {
  const user = req.user;
  const id = req.params?.id || user.rootDirId;
  // Find the directory and verify ownership
  const directoryData = await Directory.findOne({ _id: id, userId: user._id }).select({ name: 1 }).lean();
  if (!directoryData) {
    return res
      .status(404)
      .json({ error: "Directory not found or you do not have access to it!" });
  }
  const filesData = await File.find({ parentDirId: id }).select({ name: 1, parentDirId: 1, extension: 1 }).lean();
  const directories = await Directory.find({ parentDirId: id }).select({ name: 1, parentDirId: 1 }).lean();
  const result = { id: directoryData._id, ...directoryData, directories: directories.map(dir => ({ ...dir, id: dir._id })), files: filesData.map(file => ({ id: file._id, ...file })) };

  return res.status(200).json(result);
}

export const createDirectory = async (req, res, next) => {
  const user = req.user;
  const parentDirId = req.params.parentDirId || user.rootDirId;
  const dirname = req.headers.dirname || "New Folder";
  const parentDir = await Directory.findOne({ _id: parentDirId, userId: user._id });
  if (!parentDir)
    return res
      .status(404)
      .json({ message: "Parent Directory Does not exist!" });
  await Directory.insertOne({
    name: dirname,
    parentDirId,
    userId: user._id
  });
  return res.status(200).json({ message: "Directory Created!" });
}

export const updateDirectory = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const { newDirName } = req.body;

  const dirData = await Directory.findOneAndUpdate({ _id: id, userId: user._id }, { $set: { name: newDirName } });
  if (!dirData)
    return res.status(404).json({ message: "Directory not found!" });
  res.status(200).json({ message: "Directory Renamed!" });
}

export const deleteDirectory = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const directory = await Directory.findOne({ _id: id, userId: user._id });
  if (!directory)
    return res.status(404).json({ message: 'No Such directory exists' });
  await deleteDirectoryData(id);
  return res.status(200).json({ message: 'deleted successfully' })
}