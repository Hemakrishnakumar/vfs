import Session from "../models/sessionModel.js";

export default async function checkAuth(req, res, next) {
  const { sid } = req.signedCookies;

  if (!sid) {
    res.clearCookie("sid");
    return res.status(401).json({ error: "Not logged in!" });
  }

  const session = await Session.findById(sid).populate('user').lean();

  if (!session) {
    res.clearCookie("sid");
    return res.status(401).json({ error: "session expired" });
  } 
  if (!session.user) {
    return res.status(401).json({ error: "user no longer exists in the system" });
  }
  req.user = session.user;
  next();
}
