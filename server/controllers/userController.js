import Directory from "../models/directoryModel.js";
import User from "../models/userModel.js";
import mongoose, { Types } from "mongoose";
import OTP from "../models/otpModel.js";
import { createSession } from "./authController.js";
import redisClient from '../config/redis.js'

export const createUserAndDirectory = async(data) => {
  const session = await mongoose.startSession(); 
    const rootDirId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    session.startTransaction();

    await Directory.insertOne(
      {
        _id: rootDirId,
        name: `root-${data.email}`,
        parentDirId: null,
        userId,
      },
      { session }
    );

    const user = await User.insertOne(
      {
        _id: userId,
        ...data,
        rootDirId,
      },
      { session }
    );
    session.commitTransaction();
    return user;
};

export const register = async (req, res, next) => {
  const { name, email, password, otp } = req.body;
  const otpRecord = await OTP.findOne({ email, otp });

  if (!otpRecord) {
    return res.status(400).json({ error: "Invalid or Expired OTP!" });
  }

  await otpRecord.deleteOne(); 

  try {    
    await createUserAndDirectory({email, password, name});
    res.status(201).json({ message: "User Registered" });
  } catch (err) {   
    console.log(err);
    if (err.code === 121) {
      res
        .status(400)
        .json({ error: "Invalid input, please enter valid details" });
    } else if (err.code === 11000) {
      if (err.keyValue.email) {
        return res.status(409).json({
          error: "This email already exists",
          message:
            "A user with this email address already exists. Please try logging in or use a different email.",
        });
      }
    } else {
      next(err);
    }
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }  
  const sessionId = await createSession(user._id, user.rootDirId);

  res.cookie("sid", sessionId, {
    httpOnly: true,
    signed: true,
    maxAge: 60 * 1000 * 60 * 24 * 7,
  });
  res.json({ message: "logged in", user: { email: user.email, name: user.name, picture: user.picture, role:user.role} });
};

export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    name: user.name,
    email: user.email,
    picture: user.picture,
    role: user.role
  });
};

export const logout = async (req, res) => {
  const { sid } = req.signedCookies;
  await redisClient.del(`sessions:${sid}`);
  res.clearCookie("sid");
  res.status(204).end();
};

export const logoutAll = async (req, res) => {
  const { sid } = req.signedCookies;
  // const session = await Session.findById(sid);
  // await Session.deleteMany({ user: session.user });
  res.clearCookie("sid");
  res.status(204).end();
};

export const getAllUsers = async (req, res, next) => {
  // try{const allUsers = await User.find({}).select('email name').lean();
  // // const allSessions = await Session.find({}).lean();
  // // const allLoggedInUsers = new Set(allSessions.map(session => session.user.toString()));
  // const data = allUsers.map(user => {
  //   return {
  //   ...user,
  //   id: user._id,
  //   isLoggedIn: allLoggedInUsers.has(user._id.toString())
  // }});
  // return res.json(data);
  // }
  // catch(err){
  //   next(err);
  // }
}

export const logoutUserByAdmin = async (req, res, next) => {
  // const {id} = req.params;  
  // try {
  // const response = await Session.deleteMany({user: id});
  // console.log(response);
  // return res.status(204).json({message:'deleted successfully'})
  // }
  // catch(err) {
  //   next(err);
  // }
}
