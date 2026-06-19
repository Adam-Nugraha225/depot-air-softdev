const prisma = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/response');

exports.getActiveChats = async (req, res, next) => {
  try {
    const currentUserId = req.user.userId;

    // Get all messages involving the current user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId },
          { receiverId: currentUserId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } }
      }
    });

    // Group by the other user and get the latest message
    const chatMap = new Map();
    for (const msg of messages) {
      const otherUser = msg.senderId === currentUserId ? msg.receiver : msg.sender;
      if (!chatMap.has(otherUser.id)) {
        chatMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          isFromMe: msg.senderId === currentUserId
        });
      }
    }

    const chats = Array.from(chatMap.values());
    return successResponse(res, chats, 'Active chats fetched successfully');
  } catch (error) {
    next(error);
  }
};

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
