import Session from "../models/sessionModel.js";

export default async function checkAuth(req, res, next) {
  const { sid } = req.signedCookies;  
  if (!sid){
    res.clearCookie('sid');
    return res.status(401).json({ error: 'not logged in' });
  }
  try {
   const session = await Session.findById(sid).populate('user').lean();
    if (!session)
        return res.status(401).json({ error: "session expired" });    
    if (!session.user) {
      return res.status(404).json({ error: "user no longer available in the system" });
    }
    req.user = session.user;
    next();
  }
  catch (error) {    
    next(error);
  }
}
