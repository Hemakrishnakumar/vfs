import OTP from "../models/otpModel.js";
import User from "../models/userModel.js";
import { sendOtpService } from "../services/sendOtpService.js";
import { OAuth2Client } from "google-auth-library";
import { createUserAndDirectory } from "./userController.js";
import redisClient from "../config/redis.js";
import { GOOGLE_CLIENT_ID, SESSION_EXPIRE_IN_SECONDS } from "../config/constants.js";


const client = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID
})

const verifyToken = async (idToken) => {
  const loginTicket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID
  })
  const userData = loginTicket.getPayload();
  return userData;
}

export const sendOtp = async (req, res, next) => {
  const { email } = req.body;
  const resData = await sendOtpService(email);
  res.status(201).json(resData);
};

export const verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;
  const otpRecord = await OTP.findOne({ email, otp });

  if (!otpRecord) {
    return res.status(400).json({ error: "Invalid or Expired OTP!" });
  }

  return res.json({ message: "OTP Verified!" });
};

export const googleSignin = async (req, res, next) => {
  const { idToken } = req.body;
  if (!idToken)
    return res.status(400).json({ error: 'id token is missing' });
  try {
    const userData = await verifyToken(idToken);
    const { email, name, picture } = userData;
    let user = await User.findOne({ email });
    if (!user) {
      user = await createUserAndDirectory({ email, name, picture })
    }
    const sessionId = await createSession(user._id, user.rootDirId, user.role);
    res.cookie("sid", sessionId, {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
    });
    return res.json({ message: "logged in", user: {email: user.email, name: user.name, picture: user.picture, role: user.role} });
  } catch (err) {
    next(err);
  }
}

export const createSession = async (userId, rootDirId, role) => {
  const result = await redisClient.ft.search('userIdIdx', `@userId:{${userId}}`, {RETURN: []});
  if (result.total >= 1) {
    await redisClient.del(result.documents[0].id);
  }
  const sessionId = crypto.randomUUID();
  const redisKey = `sessions:${sessionId}`;
  await redisClient.json.set(redisKey, '$', {_id:userId, rootDirId, role});  
  await redisClient.expire(redisKey, SESSION_EXPIRE_IN_SECONDS);
  return sessionId;
}