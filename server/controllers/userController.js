import Directory from "../models/directoryModel.js";
import User from "../models/userModel.js";
import mongoose, { Types } from "mongoose";
import OTP from "../models/otpModel.js";
import { createSession } from "./authController.js";
import redisClient from '../config/redis.js'
import { loginSchema, registerSchema } from "../validators/authSchema.js";

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
  const {success, data, error} = registerSchema.safeParse(req.body);
  if(!success) {
    return res
        .status(400)
        .json({ error: "Invalid input, please enter valid details" });
  }
    
  const { name, email, password, otp } = data;
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
  const {success, data, error} = loginSchema.safeParse(req.body);
  if(!success) {
    return res
        .status(400)
        .json({ error: error.issues });
  }
  const { email, password } = data;
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }  
  const sessionId = await createSession(user._id, user.rootDirId, user.role);

  res.cookie("sid", sessionId, {
    httpOnly: true,
    signed: true,
    maxAge: 60 * 1000 * 60 * 24 * 7,
  });
  res.json({ message: "logged in", user: { email: user.email, name: user.name, picture: user.picture, role:user.role} });
};

export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user._id).populate({path: "rootDirId", select: 'size'}).lean();
  if(!user) return res.status(401).json({ error: "user no longer part of the system"})
  res.status(200).json({
    name: user.name,
    email: user.email,
    picture: user.picture,
    role: user.role,
    maxStorageSize: user.maxStorageSize,
    usedStorageSize: user.rootDirId.size
  });
};

export const logout = async (req, res) => {
  const { sid } = req.signedCookies;
  await redisClient.del(`sessions:${sid}`);
  res.clearCookie("sid");
  res.status(204).end();
};

export const logoutAll = async (req, res) => {
  try {
    const result = await redisClient.ft.search(
      'userIdIdx',
      `@userId:{${req.user._id}}`
    );
    await Promise.all(
      result.documents.map((session) =>
        redisClient.del(session.id)
      )
    );
    res.clearCookie("sid");
    res.status(204).end();
  } catch (err) {
    console.error("Error in logoutAll:", err);
    res.status(500).json({ error: "Failed to logout all sessions" });
  }
};

export const getAllUsers = async (req, res, next) => {
  try{const allUsers = await User.find({}).select('email name').lean();
  const keys = await redisClient.keys("sessions:*");
  const sessions = await Promise.all(
    keys.map((key) => redisClient.json.get(key))
  );  
  const allLoggedInUsers = new Set(sessions.map(session => session._id));
  const data = allUsers.map(user => {
    return {
    ...user,
    id: user._id,
    isLoggedIn: allLoggedInUsers.has(user._id.toString())
  }});
  return res.json(data);
  }
  catch(err){
    next(err);
  }
}

export const logoutUserByAdmin = async (req, res, next) => {
  const {id} = req.params;  
  try {
  const result = await redisClient.ft.search('userIdIdx',`@userId:{${id}}`);
  await Promise.all(result.documents.map(session=> redisClient.del(session.id)))
  return res.status(204).json({message:'deleted successfully'})
  }
  catch(err) {
    next(err);
  }
}
