const prisma = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/response');

exports.createOrder = async (req, res, next) => {
  try {
    const { vendorId, volume, totalPrice, deliveryAddressId } = req.body;

    // Generate unique order number
    const orderNumber = `#VH-${Math.floor(10000 + Math.random() * 90000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId: req.user.userId,
        vendorId,
        volume,
        totalPrice,
      }
    });

    return successResponse(res, order, 'Order created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const where = {};
    if (req.user.role === 'BUYER') {
      where.buyerId = req.user.userId;
    } else {
      where.vendorId = req.user.userId;
    }

    if (status && status !== 'Semua Status') {
      where.status = status;
    }

    if (search) {
      where.orderNumber = { contains: search };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        vendor: { select: { name: true } },
        buyer: { select: { name: true } },
        assignedFleet: { select: { truckId: true, driverName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, orders, 'Orders fetched successfully');
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        vendor: { select: { name: true, phone: true } },
        buyer: { select: { name: true, phone: true } },
        assignedFleet: true
      }
    });

    if (!order) return errorResponse(res, 'Order not found', 404);

    return successResponse(res, order, 'Order details fetched successfully');
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g., "SELESAI", "DIBATALKAN"

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return errorResponse(res, 'Order not found', 404);
    if (order.vendorId !== req.user.userId) return errorResponse(res, 'Forbidden', 403);

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    return successResponse(res, updatedOrder, 'Order status updated successfully');
  } catch (error) {
    next(error);
  }
};
