import { ObjectId } from "mongodb";
import Directory from "../models/directoryModel.js"
import File from "../models/fileModel.js";
import {createWriteStream} from "fs";
import { rm } from "fs/promises";
import path from "path";
import mime from 'mime'

export const uploadFile = async (req, res, next) => {
  const parentDirId = req.params?.parentDirId && new ObjectId(req.params?.parentDirId)  || req.user.rootDirId;
  const parentDirData = await Directory.findOne({_id: parentDirId, userId: req.user._id});
  // Check if parent directory exists
  if (!parentDirData) {
    return res.status(404).json({ error: "Parent directory not found!" });
  }
  // Check if the directory belongs to the user
  if (parentDirData.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      error: "You do not have permission to upload to this directory.",
    });
  }
  const filename = req.headers.filename || "untitled";  
  const extension = path.extname(filename);
  let insertedFile = await File.insertOne({     
      extension,
      name: filename,
      parentDirId,
      userId: req.user._id
  });   
  const fullFileName = `${insertedFile.insertedId.toString()}${extension}`;
  const writeStream = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeStream);
  req.on('error', async (error)=>{    
    await File.findOneAndDelete({_id: insertedFile.insertedId});
    return res.status(404).json({message:'something went wrong while uploading the file'})
  })
  req.on('end', ()=>{
    return res.status(201).json({ message: "File Uploaded" });  
  })  
}

export const getFile = async (req, res) => {
  const { id } = req.params;
  const fileData = await File.findOne({_id: new ObjectId(id)});
  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }
  // Check ownership  
  if (fileData.userId.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ error: "You don't have access to this file." });
  }
  const filePath = `${process.cwd()}/storage/${id}${fileData.extension}`;
  // If "download" is requested, set the appropriate headers
  if (req.query.action === "download") {
    return res.download(filePath, fileData.name);
  } 
  const mimeType = mime.getType(filePath);
  res.setHeader("Content-Type", mimeType);
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
  const fileData = await File.findOneAndUpdate({_id: new ObjectId(id), userId: req.user._id}, {$set : {name: newFilename}});
  if (!fileData)
    return res.status(404).json({message: 'File not found'})
  return res.status(200).json({ message: "Renamed" });  
}

export const deleteFile = async (req, res, next) => {
  const { id } = req.params;  
  const file = await File.findOneAndDelete({_id: new ObjectId(id), userId: req.user._id});
  if (!file)
    return res.status(400).json({message: 'Either file not found or you do not have access to delete'}); 
  await rm(path.join(`${process.cwd()}/storage/`, `${id}${file.extension}`)); 
  return res.status(200).json({ message: "File Deleted Successfully" });  
}