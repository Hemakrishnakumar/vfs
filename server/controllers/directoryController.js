import { ObjectId } from "mongodb";
import { directories, files } from "../config/database.js";

export const getDirectories = async (req, res) => {
  const user = req.user;
  const id = req.params.id || user.rootDirId;

  // Find the directory and verify ownership
  const directoryData = await directories.findOne(
    {_id : new ObjectId(id)}
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
  const parentDirId = req.params.parentDirId || user.rootDirId;
  const dirname = req.headers.dirname || "New Folder";  
  const parentDir = await directories.findOne({_id :new ObjectId(parentDirId), userId: user._id.toString() });
  if (!parentDir)
    return res
      .status(404)
      .json({ message: "Parent Directory Does not exist!" });  
  await directories.insertOne({    
    name: dirname,
    parentDirId,   
    userId: user._id.toString()   
  });
  return res.status(200).json({ message: "Directory Created!" });  
}

export const updateDirectory = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const { newDirName } = req.body;

  const dirData =await directories.findOneAndUpdate({_id: new ObjectId(id), userId: user._id.toString()}, { $set :{ name: newDirName}});
  if (!dirData)
    return res.status(404).json({ message: "Directory not found!" });
    res.status(200).json({ message: "Directory Renamed!" }); 
}

export const deleteDirectory = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
    
  const directory = await directories.findOne({_id: new ObjectId(id)});
  if(!directory)
     return res.status(404).json({message: 'No Such directory exists'});    
  if(directory.userId !== user._id.toString()) 
    return res.status(403).json({message: 'You are not authorized to delete this resource'})
    //Delete all associated files
    await files.deleteMany({parentDirId: new ObjectId(id)});
    // Delete all child directories
    await directories.deleteMany({parentDirId: new ObjectId(id)});
    //delete the directory
    await directories.deleteOne({_id: directory._id})  
    return res.status(200).json({message:'deleted successfully'})
}