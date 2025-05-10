const express = require('express');
const router = express.Router();
const cuttingController = require('../controllers/cuttingController');

// Get cutting statuses by customer ID
router.get('/customer/:customerId', cuttingController.getCuttingStatusByCustomerId);

// Update cutting status for an order
router.put('/:orderId', cuttingController.updateCuttingStatus);

module.exports = router;