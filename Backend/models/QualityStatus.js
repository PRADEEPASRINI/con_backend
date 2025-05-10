const mongoose = require('mongoose');

const QualityStatusSchema = new mongoose.Schema({
  // We'll group quality status by color since your UI works that way
  customerId: {
    type: String,
    required: true,
    index: true
  },
  color: {
    type: String,
    required: true
  },
  clothType: {
    type: String
  },
  dyeingStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Done'],
    default: 'Not Started'
  },
  qualityStatus: {
    type: String,
    enum: ['Pending', 'Passed', 'Rejected'],
    default: 'Pending'
  },
  rejectedReason: {
    type: String
  },
  photoUrl: {
    type: String
  },
  supervisor: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create a compound index for faster lookups
QualityStatusSchema.index({ customerId: 1, color: 1 });

module.exports = mongoose.model('QualityStatus', QualityStatusSchema);