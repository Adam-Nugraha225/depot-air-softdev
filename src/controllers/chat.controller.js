const prisma = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/response');

exports.getMessages = async (req, res, next) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.user.userId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    return successResponse(res, messages, 'Messages fetched successfully');
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.userId;

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content
      }
    });

    return successResponse(res, message, 'Message sent successfully', 201);
  } catch (error) {
    next(error);
  }
};
