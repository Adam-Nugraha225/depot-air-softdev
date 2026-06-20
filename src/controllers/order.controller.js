const prisma = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/response');

exports.createOrder = async (req, res, next) => {
  try {
    const { 
      vendorId, volume, paymentMethod, serviceFee = 0, 
      deliveryNotes, address, waterType, deliverySchedule 
    } = req.body;

    // Fetch vendor profile to get pricePerLiter
    const vendor = await prisma.user.findUnique({
      where: { id: vendorId },
      include: { vendorProfile: true }
    });

    if (!vendor || vendor.role !== 'VENDOR' || !vendor.vendorProfile) {
      return errorResponse(res, 'Vendor or vendor profile not found', 404);
    }

    const requestedVolume = Number(volume);
    const serviceFeeAmount = Number(serviceFee || 0);
    const pricePerLiter = Number(vendor.vendorProfile.pricePerLiter);
    const defaultCapacity = Number(vendor.vendorProfile.defaultCapacity);

    if (!Number.isInteger(requestedVolume) || requestedVolume <= 0) {
      return errorResponse(res, 'Order volume must be a whole number greater than 0', 400);
    }

    if (!Number.isFinite(serviceFeeAmount) || serviceFeeAmount < 0) {
      return errorResponse(res, 'Service fee must be a valid amount', 400);
    }

    if (!Number.isFinite(pricePerLiter) || pricePerLiter <= 0 || !Number.isFinite(defaultCapacity) || defaultCapacity <= 0) {
      return errorResponse(res, 'Vendor profile is incomplete. Price and capacity must be set before ordering.', 400);
    }

    const totalPrice = (requestedVolume * pricePerLiter) + serviceFeeAmount;

    // Generate unique order number
    const orderNumber = `#VH-${Math.floor(10000 + Math.random() * 90000)}-X90`;

    // Simulate Payment logic for MVP
    const paymentStatus = paymentMethod === 'Cash On Delivery (COD)' ? 'PENDING' : 'LUNAS';

    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId: req.user.userId,
        vendorId,
        volume: requestedVolume,
        pricePerLiter,
        serviceFee: serviceFeeAmount,
        totalPrice,
        paymentMethod,
        paymentStatus,
        deliveryNotes,
        address,
        waterType,
        deliverySchedule,
        status: 'MENUNGGU_KONFIRMASI'
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
        vendor: { 
          select: { 
            id: true, 
            name: true, 
            phone: true,
            vendorProfile: {
              select: {
                mainLocation: true
              }
            }
          } 
        },
        buyer: { select: { name: true, phone: true } },
        assignedFleet: {
          select: {
            id: true,
            truckId: true,
            driverName: true,
            truckType: true,
            licensePlate: true,
            capacity: true,
            status: true,
            lat: true,
            lng: true
          }
        }
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
        vendor: { 
          select: { 
            name: true, 
            phone: true,
            vendorProfile: {
              select: {
                mainLocation: true
              }
            }
          } 
        },
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
    const { status } = req.body; // e.g., "DIKONFIRMASI", "DITOLAK", "DISIAPKAN"

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
