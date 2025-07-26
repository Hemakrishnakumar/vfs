import Session from "../models/sessionModel.js";

export const checkAuth = async (req, res, next) => {
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

export const protect = (...allowedRoles) => (req, res, next) => {  
  const role = req.user.role;  
  if(allowedRoles.includes(role))
    return next();
  return res.status(403).json({error:'You are not authorized'})
}
