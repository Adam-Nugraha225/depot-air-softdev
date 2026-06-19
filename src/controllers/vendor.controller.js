const prisma = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/response');

exports.getVendors = async (req, res, next) => {
  try {
    const { search } = req.query;
    
    // Build query
    const where = {
      role: 'VENDOR',
      ...(search && {
        name: { contains: search }
      })
    };

    const vendors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        vendorProfile: true,
      }
    });

    return successResponse(res, vendors, 'Vendors fetched successfully');
  } catch (error) {
    next(error);
  }
};

exports.getVendorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const vendor = await prisma.user.findFirst({
      where: { id, role: 'VENDOR' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        vendorProfile: true,
        fleets: true,
      }
    });

    if (!vendor) return errorResponse(res, 'Vendor not found', 404);

    return successResponse(res, vendor, 'Vendor details fetched successfully');
  } catch (error) {
    next(error);
  }
};

exports.updateVendorProfile = async (req, res, next) => {
  try {
    const { specialty, mainLocation, pricePerLiter, defaultCapacity } = req.body;
    
    const profile = await prisma.vendorProfile.upsert({
      where: { userId: req.user.userId },
      update: { specialty, mainLocation, pricePerLiter, defaultCapacity },
      create: { userId: req.user.userId, specialty, mainLocation, pricePerLiter, defaultCapacity }
    });

    return successResponse(res, profile, 'Vendor profile updated successfully');
  } catch (error) {
    next(error);
  }
};
