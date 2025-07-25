import express from "express";
import { config } from "dotenv";
config();
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"
import {checkAuth, protect} from "./middlewares/authMiddleware.js";
import { connectDB } from "./config/db.js";


await connectDB();

const app = express();
app.use(cookieParser(process.env.SECRET));
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

app.listen(4000, () => {
  console.log(`Server Started and running on 4000`);
});
