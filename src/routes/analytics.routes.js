const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authMiddleware, vendorMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);
router.use(vendorMiddleware);

router.get('/dashboard', analyticsController.getDashboardAnalytics);

module.exports = router;
