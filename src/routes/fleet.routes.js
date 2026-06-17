const express = require('express');
const router = express.Router();
const fleetController = require('../controllers/fleet.controller');
const { authMiddleware, vendorMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);
router.use(vendorMiddleware); // All fleet routes are for vendors

router.get('/', fleetController.getFleets);
router.post('/', fleetController.addFleet);
router.put('/:id/status', fleetController.updateFleetStatus);
router.post('/assign', fleetController.assignFleetToOrder);

module.exports = router;
