import { configDotenv } from "dotenv";
configDotenv();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import checkAuth from "./middlewares/authMiddleware.js";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => console.log("DB CONNECTED!!"))
  .catch((err) => console.log('Falied to connect to db', err.message));

app.use(cookieParser());
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

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).json({ error: "Something went wrong!!", message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server Started and running on PORT:${PORT}`);
});
