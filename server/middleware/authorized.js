const jwt = require('jsonwebtoken');

// verify token, for every logged user
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: "Access denied. No token provided."
    });
  }

  jwt.verify(token, process.env.JWTPRIVATEKEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid or expired token",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    // check if token payload has required fields
    if (!decoded._id || !decoded.role || !decoded.username) {
      return res.status(403).json({
        message: "Malformed token payload"
      });
    }

    req.user = decoded;
    next();
  });
};


// admin and user
const authorizeBoth = (req, res, next) => {
  if (!['USER', 'ADMIN'].includes(req.user?.role)) {
    return res.status(403).json({
      message: "Forbidden. Authentication required",
      yourRole: req.user?.role || 'none'
    });
  }
  next();
};

// admin only
const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      message: "Forbidden. Admin privileges required",
      yourRole: req.user?.role || 'none'
    });
  }
  next();
};

// user only
const authorizeUser = (req, res, next) => {
  if (req.user?.role !== 'USER') {
    return res.status(403).json({
      message: "Forbidden. User privileges required",
      yourRole: req.user?.role || 'none'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeAdmin,
  authorizeUser,
  authorizeBoth
};