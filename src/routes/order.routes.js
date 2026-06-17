const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authMiddleware, vendorMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/', orderController.createOrder); // Create order (Buyer)
router.get('/', orderController.getOrders); // Get order history (Buyer & Vendor)
router.get('/:id', orderController.getOrderById); // Get order details

// Vendor only
router.put('/:id/status', vendorMiddleware, orderController.updateOrderStatus);

module.exports = router;
