const jwt = require('jsonwebtoken');

// verify token, for every logged user
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  jwt.verify(token, process.env.JWTPRIVATEKEY, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid or expired token",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    req.user = user;
    next();
  });
};

// admin only
const authorizeAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        message: "Forbidden. Admin privileges required",
        yourRole: req.user.role
      });
    }
    next();
  });
};

// user only
const authorizeUser = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'USER') {
      return res.status(403).json({
        message: "Forbidden. User account required",
        yourRole: req.user.role
      });
    }
    next();
  });
};

module.exports = {
  authenticateToken,
  authorizeAdmin,
  authorizeUser
};