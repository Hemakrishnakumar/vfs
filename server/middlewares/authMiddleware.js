import User from "../models/userModel.js";

export default async function checkAuth(req, res, next) {
  const { uid } = req.cookies;
  const user = await User.findOne({ _id: uid }).lean();
  if (!uid || !user) {
    return res.status(401).json({ error: "Not logged!" });
  }
  req.user = user;
  next();
}
