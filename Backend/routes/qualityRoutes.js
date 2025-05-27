const express = require('express');
const router = express.Router();
const qualityController = require('../controllers/qualityController');
const upload = require('../middleware/upload');

// Get quality statuses by customer ID
router.get('/customer/:customerId', qualityController.getQualityStatusByCustomerId);

// Update quality status for a color
router.put('/:customerId/:color', 
  upload.single('photo'), // Use multer middleware for handling file uploads
  qualityController.updateQualityStatus
);

module.exports = router;