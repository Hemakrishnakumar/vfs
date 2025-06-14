import { ObjectId } from "mongodb";
import { directories, files } from "../config/database.js";
import {rm} from 'fs/promises'
import path from "path";

 async function deleteDirectoryData (id) {
    //delete all the files in the directory.
    const filesList = await files.find({parentDirId: id}, {projection:{_id:1, extension: 1}}).toArray();
    for(let i = 0; i<filesList.length; i++){
      const {_id, extension} = filesList[i];
      await files.deleteOne({_id});
      await rm(path.join(`${process.cwd()}/storage/`, `${_id.toString()}${extension}`));
    }
    // Get All the directories in it.
    const list = await directories.find({parentDirId: id},{projection: {_id: 1}}).toArray();
    //delete that directory
    await directories.deleteOne({_id: id});
    //delete all the child directories along with it's data.
    for(let i = 0; i< list.length; i++) {
      await deleteDirectoryData(list[i]._id);
    }
}

export const getDirectories = async (req, res) => {
  const user = req.user;
  const id = req.params?.id && new ObjectId(req.params?.id) || user.rootDirId;

  // Find the directory and verify ownership
  const directoryData = await directories.findOne(
    {_id : id}
  );
  if (!directoryData) {
    return res
      .status(404)
      .json({ error: "Directory not found or you do not have access to it!" });
  }   
  const filesData = await files.find({parentDirId: id}).toArray();
  const result = await directories.find({parentDirId: id}).toArray();

  return res.status(200).json({ ...directoryData, files: filesData.map((file)=> ({...file, id: file._id})), directories: result.map((dir)=> ({...dir, id:dir._id})) });
}

export const createDirectory = async (req, res, next) => {
  const user = req.user;
  const parentDirId = req.params.parentDirId && new ObjectId(req.params.parentDirId) || user.rootDirId;
  const dirname = req.headers.dirname || "New Folder";  
  const parentDir = await directories.findOne({_id : parentDirId, userId: user._id });
  if (!parentDir)
    return res
      .status(404)
      .json({ message: "Parent Directory Does not exist!" });  
  await directories.insertOne({    
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

  const dirData =await directories.findOneAndUpdate({_id: new ObjectId(id), userId: user._id}, { $set :{ name: newDirName}});
  if (!dirData)
    return res.status(404).json({ message: "Directory not found!" });
    res.status(200).json({ message: "Directory Renamed!" }); 
}

export const deleteDirectory = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;    
  const directory = await directories.findOne({_id: new ObjectId(id), userId: user._id});
  if(!directory)
     return res.status(404).json({message: 'No Such directory exists'}); 
  await deleteDirectoryData(directory._id);  
  return res.status(200).json({message:'deleted successfully'})
}