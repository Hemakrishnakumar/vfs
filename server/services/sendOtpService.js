import nodemailer from 'nodemailer';
import OTP from "../models/otpModel.js";
import { NODEMAILER_GMAIL_APP_PASSWORD, NODEMAILER_GMAIL_USER } from '../config/constants.js';


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, 
  auth: {
    user: NODEMAILER_GMAIL_USER,
    pass: NODEMAILER_GMAIL_APP_PASSWORD,
  },
});


const sendMail = async ({to, subject, html}) => {
  const info = await transporter.sendMail({
    from: '"Hemakrishna" <dev.krish.learn@gmail.com>',
    to,
    subject,
    html,
  });
  console.log("Message sent:", info.messageId);
};

export async function sendOtpService(email) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  await OTP.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true }
  );

  const html = `
  <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 480px; margin: auto; padding: 24px; border-radius: 12px; background: #ffffff; border: 1px solid #e5e7eb;">
    <h2 style="color: #111827; text-align: center;">Your Verification Code</h2>
    
    <p style="font-size: 15px; color: #374151;">
      Use the OTP below to verify your email address. This code is valid for <strong>10 minutes</strong>.
    </p>

    <div style="margin: 24px auto; text-align: center;">
      <div style="display: inline-block; padding: 14px 28px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111827; background: #f3f4f6; border-radius: 8px; border: 1px solid #d1d5db;">
        ${otp}
      </div>
    </div>

    <p style="font-size: 14px; color: #6b7280;">
      If you did not request this, you can safely ignore this email.
    </p>
  </div>
`;


  await sendMail({
    to: email,
    subject: "Storage App OTP",
    html,
  });

  return { success: true, message: `OTP sent successfully on ${email}` };
}

//await sendMail({to:'jayavarapukrishna11@gmail.com', subject:'Hi, there', html:'<h1>Hello World</h1>'});