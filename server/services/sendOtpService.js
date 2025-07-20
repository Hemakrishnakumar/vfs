import nodemailer from 'nodemailer';
import OTP from "../models/otpModel.js";

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, 
  auth: {
    user: "dev.krish.learn@gmail.com",
    pass: "miyf zswd jipo tymb",
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

  // Upsert OTP (replace if it already exists)
  await OTP.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true }
  );

  const html = `
    <div style="font-family:sans-serif;">
      <h2>Your OTP is: ${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
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