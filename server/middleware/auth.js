const jwt = require('jsonwebtoken')


module.exports = (req, res, next) => {
  const authHeader = req.header.authorization;

  if (!authHeader) {
    return res.status(401).send("No token");
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if(err){
      return res.status(401).send("Invalid token");
    }
    req.userId = payload.userId;
    next();
  });
};