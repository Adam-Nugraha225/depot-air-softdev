const prisma = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/response');

exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;

    // We can filter by month. For MVP, we'll just sum all completed orders
    const completedOrders = await prisma.order.findMany({
      where: {
        vendorId,
        status: 'SELESAI'
      }
    });

    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const successfulDeliveries = completedOrders.length;

    // Fetch review average
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: vendorId },
      select: { rating: true }
    });

    return successResponse(res, {
      totalRevenue,
      successfulDeliveries,
      rating: vendor?.rating || 0
    }, 'Analytics fetched successfully');
  } catch (error) {
    next(error);
  }
};
