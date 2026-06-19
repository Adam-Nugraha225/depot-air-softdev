const prisma = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/response');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        vendorProfile: true
      }
    });
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, user, 'Profile fetched successfully');
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, phone },
      select: { id: true, name: true, email: true, phone: true }
    });
    return successResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.userId }
    });
    return successResponse(res, addresses, 'Addresses fetched successfully');
  } catch (error) {
    next(error);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    const { 
      recipientName, province, city, district, 
      postalCode, street, details, isPrimary 
    } = req.body;
    
    // If setting as primary, unset other primaries
    if (isPrimary) {
      await prisma.address.updateMany({
        where: { userId: req.user.userId },
        data: { isPrimary: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.userId,
        recipientName,
        province,
        city,
        district,
        postalCode,
        street,
        details,
        isPrimary: isPrimary || false
      }
    });
    return successResponse(res, address, 'Address added successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, addressLine, isPrimary } = req.body;

    const existingAddress = await prisma.address.findUnique({
      where: { id }
    });

    if (!existingAddress) return errorResponse(res, 'Address not found', 404);
    if (existingAddress.userId !== req.user.userId) return errorResponse(res, 'Forbidden', 403);

    if (isPrimary) {
      await prisma.address.updateMany({
        where: { userId: req.user.userId },
        data: { isPrimary: false }
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        label,
        addressLine,
        isPrimary: isPrimary || false
      }
    });

    return successResponse(res, address, 'Address updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingAddress = await prisma.address.findUnique({
      where: { id }
    });

    if (!existingAddress) return errorResponse(res, 'Address not found', 404);
    if (existingAddress.userId !== req.user.userId) return errorResponse(res, 'Forbidden', 403);

    await prisma.address.delete({
      where: { id }
    });

    return successResponse(res, null, 'Address deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.getPaymentMethods = async (req, res, next) => {
  try {
    const methods = await prisma.paymentMethod.findMany({
      where: { userId: req.user.userId }
    });
    return successResponse(res, methods, 'Payment methods fetched successfully');
  } catch (error) {
    next(error);
  }
};

exports.addPaymentMethod = async (req, res, next) => {
  try {
    const { type, details } = req.body;
    const method = await prisma.paymentMethod.create({
      data: { userId: req.user.userId, type, details }
    });
    return successResponse(res, method, 'Payment method added successfully', 201);
  } catch (error) {
    next(error);
  }
};
