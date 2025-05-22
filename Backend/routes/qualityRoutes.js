const express = require('express');
const router = express.Router();
const qualityController = require('../controllers/qualityController');
const upload = require('../middleware/upload');

// Get quality statuses (with or without customerId)
router.get('/customer/:customerId?', qualityController.getQualityStatusByCustomerId);

// Update quality status for a color
router.put('/:customerId/:color', 
  upload.single('photo'),
  qualityController.updateQualityStatus
);

module.exports = router;