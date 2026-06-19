const prisma = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/response');

exports.getFleets = async (req, res, next) => {
  try {
    const fleets = await prisma.fleet.findMany({
      where: { vendorId: req.user.userId }
    });
    return successResponse(res, fleets, 'Fleets fetched successfully');
  } catch (error) {
    next(error);
  }
};

exports.addFleet = async (req, res, next) => {
  try {
    const { truckId, driverName, truckType, licensePlate, capacity } = req.body;
    
    const fleet = await prisma.fleet.create({
      data: {
        vendorId: req.user.userId,
        truckId,
        driverName,
        truckType,
        licensePlate,
        capacity: capacity ? parseInt(capacity) : null,
      }
    });

    return successResponse(res, fleet, 'Fleet added successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.updateFleetStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, lat, lng } = req.body; // "TERSEDIA", "SEDANG_BERTUGAS", "PEMELIHARAAN"

    const fleet = await prisma.fleet.findUnique({ where: { id } });
    if (!fleet) return errorResponse(res, 'Fleet not found', 404);
    if (fleet.vendorId !== req.user.userId) return errorResponse(res, 'Forbidden', 403);

    const updatedFleet = await prisma.fleet.update({
      where: { id },
      data: { status, lat, lng }
    });

    return successResponse(res, updatedFleet, 'Fleet updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.assignFleetToOrder = async (req, res, next) => {
  try {
    const { orderId, fleetId } = req.body;

    // Verify order
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return errorResponse(res, 'Order not found', 404);
    if (order.vendorId !== req.user.userId) return errorResponse(res, 'Forbidden', 403);

    // Verify fleet
    const fleet = await prisma.fleet.findUnique({ where: { id: fleetId } });
    if (!fleet) return errorResponse(res, 'Fleet not found', 404);
    if (fleet.vendorId !== req.user.userId) return errorResponse(res, 'Forbidden', 403);

    // Assign and update status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { fleetId, status: 'DALAM_PERJALANAN' }
    });

    await prisma.fleet.update({
      where: { id: fleetId },
      data: { status: 'SEDANG_BERTUGAS' }
    });

    return successResponse(res, updatedOrder, 'Fleet assigned successfully');
  } catch (error) {
    next(error);
  }
};
