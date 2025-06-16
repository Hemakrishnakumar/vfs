import { ObjectId } from "mongodb";
import User from "../models/userModel.js";
import Directory from "../models/directoryModel.js";
import mongoose from "mongoose";



export const login = async (req, res, next) => {
  const { email, password } = req.body;  
  const user = await User.findOne({email});  
  if (!user || user.password !== password) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }
  res.cookie("uid", user._id.toString(), {
    httpOnly: true,
    maxAge: 60 * 1000 * 60 * 24 * 7,
  });
  res.json({ name: user.name, email: user.email, message: "logged in" });
}

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  const foundUser = await User.findOne({ email });
  if (foundUser) {
    return res.status(409).json({
      error: "User already exists",
      message:
        "A user with this email address already exists. Please try logging in or use a different email.",
    });
  }
  const userId = new ObjectId();
  const rootDirId = new ObjectId();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await User.insertOne({
      _id: userId,
      name,
      email,
      password,
      rootDirId: rootDirId
    }, { session });

    await Directory.insertOne({
      _id: rootDirId,
      name: `root-${email}`,
      userId: userId,
      parentDirId: null
    }, { session });
  } catch (err) {
    session.abortTransaction()
    next(err);
  }
  await session.commitTransaction();
  res.status(201).json({ message: "User Registered" });
}

export const getUser = (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
}

export const logout = (req, res) => {
  res.clearCookie("uid");
  res.status(204).end();
}