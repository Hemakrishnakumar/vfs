import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import path from "path";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";

export const uploadFile = async (req, res, next) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId;
  try {
    let parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    });

    // Check if parent directory exists
    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = req.headers.filename || "untitled";
    const size = Number(req.headers.filesize);
    if(!size) return res.send(400, 'Bad Request')
    if(size > 1024 * 1024 ) {
       res.header('Connection', 'close')
       return res.end();
    }
    const extension = path.extname(filename);

    const insertedFile = await File.insertOne({
      extension,
      name: filename,
      parentDirId: parentDirData._id,
      userId: req.user._id,
      size
    });

    const fileId = insertedFile.id;

    const fullFileName = `${fileId}${extension}`;

    const filePath = `./storage/${fullFileName}`;
    const writeStream = createWriteStream(filePath);
    
    let totalFileSize = 0;
    let abort = false;

    req.on('data', async(chunk)=>{
      if(abort) return;
      totalFileSize += chunk.length;
      if(totalFileSize > size) {
        abort = true;
        writeStream.close();
        await rm(filePath);
        await insertedFile.deleteOne();
        return res.destroy();
      }
      writeStream.write(chunk)
    })
   

    req.on("end", async () => {
      parentDirData.fileCount += 1;
      parentDirData.size += totalFileSize;
      await parentDirData.save();
      while(parentDirData?.parentDirId) {
        parentDirData = await Directory.findOneAndUpdate(
          { _id: parentDirData.parentDirId },
          { $inc: { size: totalFileSize } },
          { new: true } 
        );
      }
      writeStream.close();
      return res.status(201).json({ message: "File Uploaded" });
    });

    req.on("error", async () => {
      await File.deleteOne({ _id: insertedFile.insertedId });
      await rm(filePath);
      return res.status(404).json({ message: "Could not Upload File" });
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const getFile = async (req, res) => {
  const { id } = req.params;
  const fileData = await File.findOne({
    _id: id,
    userId: req.user._id,
  }).lean();
  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  // If "download" is requested, set the appropriate headers
  const filePath = `${process.cwd()}/storage/${id}${fileData.extension}`;

  if (req.query.action === "download") {
    return res.download(filePath, fileData.name);
  }

  // Send file
  return res.sendFile(filePath, (err) => {
    if (!res.headersSent && err) {
      return res.status(404).json({ error: "File not found!" });
    }
  });
};

export const renameFile = async (req, res, next) => {
  const { id } = req.params;
  const file = await File.findOne({
    _id: id,
    userId: req.user._id,
  });

  // Check if file exists
  if (!file) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    file.name = req.body.newFilename;
    await file.save();
    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    console.log(err);
    err.status = 500;
    next(err);
  }
};

export const deleteFile = async (req, res, next) => {
  const { id } = req.params;
  const file = await File.findOne({
    _id: id,
    userId: req.user._id,
  }).select("extension parentDirId size");

  if (!file) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    await rm(`./storage/${id}${file.extension}`);
    await file.deleteOne();
    let parentDirData = await Directory.findOneAndUpdate(
          { _id: file.parentDirId },
          { $inc: { fileCount: -1, size: -file.size }, },
          { new: true } 
        );  
    while(parentDirData?.parentDirId) {
        parentDirData = await Directory.findOneAndUpdate(
          { _id: parentDirData.parentDirId },
          { $inc: { size: -file.size }, },
          { new: true } 
        );
      }
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
};
