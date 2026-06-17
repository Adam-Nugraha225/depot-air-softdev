const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');
const { authMiddleware, vendorMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendorById);

// Vendor only routes
router.put('/profile', vendorMiddleware, vendorController.updateVendorProfile);

module.exports = router;
