import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"
import {checkAuth} from "./middlewares/authMiddleware.js";
import { connectDB } from "./config/db.js";
import { COOKIE_SECRET, PORT } from "./config/constants.js";


await connectDB();

const app = express();
app.use(cookieParser(COOKIE_SECRET));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/directory", checkAuth, directoryRoutes);
app.use("/file", checkAuth, fileRoutes);
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/users", checkAuth, adminRoutes);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server Started and running on ${PORT}`);
});
