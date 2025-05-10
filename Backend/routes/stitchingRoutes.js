const express = require('express');
const router = express.Router();
const stitchingController = require('../controllers/stitchingController');

// Get stitching statuses by customer ID
router.get('/customer/:customerId', stitchingController.getStitchingStatusByCustomerId);

// Update stitching status for an order
router.put('/:orderId', stitchingController.updateStitchingStatus);

module.exports = router;