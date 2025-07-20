import express from "express";
import { sendOtp, verifyOtp,googleSignin } from "../controllers/authController.js";



const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post('/google', googleSignin)

export default router;
