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

    const existingProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.userId }
    });

    const nextSpecialty = specialty !== undefined && String(specialty).trim() !== ''
      ? String(specialty).trim()
      : existingProfile?.specialty || null;
    const nextMainLocation = mainLocation !== undefined && String(mainLocation).trim() !== ''
      ? String(mainLocation).trim()
      : existingProfile?.mainLocation || null;
    const nextPricePerLiter = pricePerLiter !== undefined
      ? Number(pricePerLiter)
      : existingProfile?.pricePerLiter || 0;
    const nextDefaultCapacity = defaultCapacity !== undefined
      ? Number(defaultCapacity)
      : existingProfile?.defaultCapacity || 0;

    if (!Number.isFinite(nextPricePerLiter) || nextPricePerLiter < 0) {
      return errorResponse(res, 'Price per liter must be a valid amount', 400);
    }

    if (!Number.isInteger(nextDefaultCapacity) || nextDefaultCapacity < 0) {
      return errorResponse(res, 'Default capacity must be a whole number', 400);
    }

    const completedFields = [
      Boolean(nextSpecialty),
      Boolean(nextMainLocation),
      nextPricePerLiter > 0,
      nextDefaultCapacity > 0,
    ].filter(Boolean).length;
    const profileCompletion = Math.round((completedFields / 4) * 100);
    
    const profile = await prisma.vendorProfile.upsert({
      where: { userId: req.user.userId },
      update: {
        specialty: nextSpecialty,
        mainLocation: nextMainLocation,
        pricePerLiter: nextPricePerLiter,
        defaultCapacity: nextDefaultCapacity,
        profileCompletion,
      },
      create: {
        userId: req.user.userId,
        specialty: nextSpecialty,
        mainLocation: nextMainLocation,
        pricePerLiter: nextPricePerLiter,
        defaultCapacity: nextDefaultCapacity,
        profileCompletion,
      }
    });

    return successResponse(res, profile, 'Vendor profile updated successfully');
  } catch (error) {
    next(error);
  }
};
