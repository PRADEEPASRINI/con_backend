const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Create a new order
router.post('/', orderController.createOrder);

// Get orders by customer ID
router.get('/customer/:customerId', orderController.getOrdersByCustomerId);

module.exports = router;