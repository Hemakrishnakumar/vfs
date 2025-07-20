import OTP from "../models/otpModel.js";
import Session from "../models/sessionModel.js";
import User from "../models/userModel.js";
import { sendOtpService } from "../services/sendOtpService.js";
import { OAuth2Client } from "google-auth-library";
import { createUserAndDirectory } from "./userController.js";

const clientId = "280455534344-88ke0uiaorctl65dsrvmv0p5ri2ssjj7.apps.googleusercontent.com";

const client = new OAuth2Client({
  clientId,
})

const verifyToken = async (idToken) => {
  const loginTicket = await client.verifyIdToken({
    idToken,
    audience: clientId
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
    const session = await createSession(user._id);
    res.cookie("sid", session.id, {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
    });
    res.json({ message: "logged in" });
  } catch (err) {
    next(err);
  }
}

export const createSession = async (userId) => {
  const allSessions = await Session.find({ user: userId });

  if (allSessions.length >= 1) {
    await allSessions[0].deleteOne();
  }
  return await Session.create({ user: userId });
}