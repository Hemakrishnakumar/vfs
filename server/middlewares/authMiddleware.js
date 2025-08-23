import redisClient from '../config/redis.js';

export const checkAuth = async (req, res, next) => {
  const { sid } = req.signedCookies;
  if (!sid) {
    res.clearCookie("sid");
    return res.status(401).json({ error: "Not logged in!" });
  }
  const loggedInUser = await redisClient.json.get(`sessions:${sid}`);
  if (!loggedInUser) {
    res.clearCookie("sid");
    return res.status(401).json({ error: "session expired. Please login again" });
  }  
  req.user = loggedInUser;
  next();
}


export const protect = (...allowedRoles) => (req, res, next) => {  
  const role = req.user.role;  
  if(allowedRoles.includes(role))
    return next();
  return res.status(403).json({error:'You are not authorized'})
}
