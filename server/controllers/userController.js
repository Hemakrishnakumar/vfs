import { ObjectId } from "mongodb";
import User from "../models/userModel.js";
import Directory from "../models/directoryModel.js";
import mongoose from "mongoose";
import Session from "../models/sessionModel.js";


export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password, user.password))) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }
  const allSessions = await Session.find({user: user.id});
  if(allSessions?.length >= 1) {
    await allSessions[0].deleteOne();
  }
  const session = await Session.create({user: user._id});
  res.cookie("sid", session.id, {
    httpOnly: true,
    maxAge: 24 *  60 * 60 * 1000,
    signed: true
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

export const logout = async (req, res) => {
  await Session.deleteOne({_id: req.signedCookies.sid})
  res.clearCookie("sid");
  res.status(204).end();
}