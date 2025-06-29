import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export default async function checkAuth(req, res, next) {
  const { jwt: token } = req.cookies;
  if (!token)
    return res.status(401).json({ error: 'not logged in' });
  try {
    const loggedinUser = jwt.verify(token, process.env.JWT_SECRET);
    if (!loggedinUser?.id)
      return res.status(401).json({ error: "Invalid token" });
    const user = await User.findOne({ _id: loggedinUser.id }).lean();
    if (!user) {
      return res.status(401).json({ error: "user no longer available in the system" });
    }
    req.user = user;
    next();
  }
  catch (error) {
    if (error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError') {
      res.clearCookie("jwt");
      return res.status(401).json({ error: 'not logged in' })
    }
    next(err);
  }
}
