import { ObjectId } from "mongodb";
import { directories, files } from "../config/database.js";
import {createWriteStream} from "fs";
import path from "path";

export const uploadFile = async (req, res, next) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId;
  const parentDirData = await directories.findOne({_id: new ObjectId(parentDirId), userId: req.user._id.toString()});

  // Check if parent directory exists
  if (!parentDirData) {
    return res.status(404).json({ error: "Parent directory not found!" });
  }  

  // Check if the directory belongs to the user
  if (parentDirData.userId !== req.user._id.toString()) {
    return res.status(403).json({
      error: "You do not have permission to upload to this directory.",
    });
  }

  const filename = req.headers.filename || "untitled";  
  const extension = path.extname(filename);
  let insertedFile = await files.insertOne({     
      extension,
      name: filename,
      parentDirId,
      userId: req.user._id.toString()
  });   
  const fullFileName = `${insertedFile.insertedId.toString()}${extension}`;
  const writeStream = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeStream);
  req.on('end', ()=>{
    return res.status(201).json({ message: "File Uploaded" });  
  })  
}

export const getFile = async (req, res) => {
  const { id } = req.params;
  const fileData = await files.findOne({_id: new ObjectId(id)});

  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }
  // Check ownership  
  if (fileData.userId !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ error: "You don't have access to this file." });
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
}

export const updateFile = async (req, res, next) => {
  const { id } = req.params;
  const {newFilename} = req.body;
  if(!id || !newFilename)
    return res.status(400).json({message: 'Invaid request'});
  const fileData = await files.findOneAndUpdate({_id: new ObjectId(id), userId: req.user._id.toString()}, {$set : {name: newFilename}});
  if (!fileData)
    return res.status(404).json({message: 'File not found'})
  return res.status(200).json({ message: "Renamed" });  
}

export const deleteFile = async (req, res, next) => {
  const { id } = req.params;  
  const file = await files.findOneAndDelete({_id: new ObjectId(id), userId: req.user._id.toString()});
  if (!file)
    return res.status(400).json({message: 'Either file not found or you do not have access to delete'});  
  return res.status(200).json({ message: "File Deleted Successfully" });  
}