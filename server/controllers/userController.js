import { ObjectId } from "mongodb";
import User from "../models/userModel.js";
import Directory from "../models/directoryModel.js";
import mongoose from "mongoose";
import jwt from "../utils/jwt.js";


const getJWTToken = user => jwt.sign({ id: user._id }, process.env.JWT_SECRET)

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password, user.password))) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }
  res.cookie("jwt", getJWTToken(user), {
    httpOnly: true,
    maxAge: 60 * 60 * 1000
  });
  res.json({ name: user.name, email: user.email, message: "logged in" });
}

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;
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
    session.abortTransaction();
    if (err.code === 11000)
      return res.status(409).json({ error: 'An user with this email already exists' });
    return next(err);
  }
  await session.commitTransaction();
  res.status(201).json({ message: "User Registered" });
}

export const getUser = (req, res) => {
  res.status(200).json({
    name: req.user?.name,
    email: req.user?.email,
  });
}

export const logout = (req, res) => {
  res.clearCookie("jwt");
  res.status(204).end();
}