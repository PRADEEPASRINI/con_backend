const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    index: true
  },
  itemName: {
    type: String,
    required: true
  },
  clothType: {
    type: String,
    required: true 
  },
  size: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  totalWeight: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);