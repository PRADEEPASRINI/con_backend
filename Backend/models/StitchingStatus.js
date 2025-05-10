const mongoose = require('mongoose');

const StitchingStatusSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  customerId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Done'],
    default: 'Not Started'
  },
  tailor: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create a compound index for faster lookups
StitchingStatusSchema.index({ orderId: 1, customerId: 1 });

module.exports = mongoose.model('StitchingStatus', StitchingStatusSchema);
