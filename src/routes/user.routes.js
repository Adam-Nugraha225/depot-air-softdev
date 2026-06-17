const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

router.get('/addresses', userController.getAddresses);
router.post('/addresses', userController.addAddress);

router.get('/payment-methods', userController.getPaymentMethods);
router.post('/payment-methods', userController.addPaymentMethod);

module.exports = router;
