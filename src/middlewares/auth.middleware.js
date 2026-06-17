const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Unauthorized: No token provided', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (error) {
    return errorResponse(res, 'Unauthorized: Invalid token', 401);
  }
};

const vendorMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'VENDOR') {
    next();
  } else {
    return errorResponse(res, 'Forbidden: Vendor access required', 403);
  }
};

module.exports = { authMiddleware, vendorMiddleware };
