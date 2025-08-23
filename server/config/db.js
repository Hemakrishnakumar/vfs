import mongoose from "mongoose";
import { DB_CONNECTION_STRING } from "./constants.js";

export async function connectDB() {
  try {
    await mongoose.connect(
      DB_CONNECTION_STRING
    );

    console.log("Database connected");
  } catch (err) {
    console.log(err);
    console.log("Could Not Connect to the Database");
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("Database Disconnected!");
  process.exit(0);
});
