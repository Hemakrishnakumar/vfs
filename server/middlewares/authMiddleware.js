import { ObjectId } from "mongodb";
import { users } from "../config/database.js";

export default async function checkAuth(req, res, next) {
  const { uid } = req.cookies;  
  const user = await users.findOne({_id: new ObjectId(uid)});  
  if (!uid || !user) {
    return res.status(401).json({ error: "Not logged!" });
  }
  req.user = user;
  next();
}
