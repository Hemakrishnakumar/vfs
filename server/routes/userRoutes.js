import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import { users, directories } from "../config/database.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  const { name, email, password } = req.body;

  const foundUser =await users.findOne({email});  
  if (foundUser) {
    return res.status(409).json({
      error: "User already exists",
      message:
        "A user with this email address already exists. Please try logging in or use a different email.",
    });
  }

  const user = await users.insertOne({   
    name,
    email,
    password,
  });

  const directory =await directories.insertOne({    
    name: `root-${email}`,
    userId: user.insertedId.toString(),
    parentDirId: null,    
  });
  await users.findOneAndUpdate({_id: user.insertedId}, { $set: {rootDirId: directory.insertedId.toString()}});      
  res.status(201).json({ message: "User Registered" });  
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const user =await users.findOne({email});
  if (!user || user.password !== password) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }
  res.cookie("uid", user._id.toString(), {
    httpOnly: true,
    maxAge: 60 * 1000 * 60 * 24 * 7,
  });
  res.json({ message: "logged in" });
});

router.get("/", checkAuth, (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("uid");
  res.status(204).end();
});

export default router;
