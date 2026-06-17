const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.isJoi) {
    return errorResponse(res, err.details[0].message, 400);
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return errorResponse(res, 'A record with that unique field already exists.', 409);
    }
    // Handle other prisma errors if needed
  }

  return errorResponse(res, err.message || 'Internal Server Error', err.statusCode || 500);
};

module.exports = errorHandler;
