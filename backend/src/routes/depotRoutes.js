const express = require('express');
const router = express.Router();
const depotController = require('../controllers/depotController');

// Endpoint untuk Frontend mengecek level air
router.get('/water-level', depotController.getWaterLevel);

// Endpoint untuk melakukan pemesanan air gunung
router.post('/order', depotController.createOrder);

module.exports = router;