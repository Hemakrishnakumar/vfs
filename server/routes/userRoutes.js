import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import { getUser, login, logout, register } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/", checkAuth, getUser);

router.post("/logout", logout);

export default router;
