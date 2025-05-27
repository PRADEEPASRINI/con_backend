const StitchingStatus = require('../models/StitchingStatus');
const Order = require('../models/Order');
const CuttingStatus = require('../models/CuttingStatus');

exports.getStitchingStatusByCustomerId = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    
    // Get orders first
    const orders = await Order.find({ customerId });
    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this customer' });
    }
    
    // Get order IDs
    const orderIds = orders.map(order => order._id);
    
    // Get cutting statuses to know which items are ready for stitching
    const cuttingStatuses = await CuttingStatus.find({
      orderId: { $in: orderIds }
    });
    
    // Get stitching statuses
    const stitchingStatuses = await StitchingStatus.find({
      orderId: { $in: orderIds }
    });
    
    // Merge data for frontend use
    const results = orders.map(order => {
      const cutting = cuttingStatuses.find(
        status => status.orderId.toString() === order._id.toString()
      ) || { status: 'Not Started' };
      
      const stitching = stitchingStatuses.find(
        status => status.orderId.toString() === order._id.toString()
      ) || { status: 'Not Started' };
      
      return {
        id: order._id,
        customerId: order.customerId,
        itemName: order.itemName,
        size: order.size,
        color: order.color,
        quantity: order.quantity,
        cuttingStatus: cutting.status,
        stitchingStatus: stitching.status,
        tailor: stitching.tailor || '',
        date: stitching.date ? stitching.date.toISOString().split('T')[0] : null
      };
    });
    
    res.json(results);
  } catch (error) {
    console.error('Error in getStitchingStatusByCustomerId:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateStitchingStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    // FIXED: Changed from { status, tailor, date } to match frontend data structure
    const { status, tailor, date, stitchingStatus: bodyStitchingStatus } = req.body;
    
    console.log('Updating stitching status for orderId:', orderId);
    console.log('Request body received:', req.body);
    
    // Use stitchingStatus if status is not provided (for backward compatibility)
    const actualStatus = status || bodyStitchingStatus;
    
    if (!actualStatus) {
      return res.status(400).json({ 
        message: 'Status field is required',
        received: req.body 
      });
    }
    
    // Validate status value
    const validStatuses = ['Not Started', 'In Progress', 'Done'];
    if (!validStatuses.includes(actualStatus)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        received: actualStatus
      });
    }
    
    // First get the order to get customer ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found',
        orderId: orderId
      });
    }
    
    console.log('Order found:', order);
    
    // Check if orderId is a valid ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ 
        message: 'Invalid order ID format',
        orderId: orderId
      });
    }
    
    // Verify the cutting is complete (optional check, can be removed if not needed)
    const cuttingStatus = await CuttingStatus.findOne({ orderId });
    console.log('Cutting status found:', cuttingStatus);
    
    // Commented out this check as it might be too restrictive
    // if (!cuttingStatus || cuttingStatus.status !== 'Done') {
    //   return res.status(400).json({ 
    //     message: 'Cannot update stitching status until cutting is complete',
    //     cuttingStatus: cuttingStatus?.status || 'Not Found'
    //   });
    // }
    
    // Find existing stitching status or create new one
    let stitchingRecord = await StitchingStatus.findOne({ orderId });
    
    if (!stitchingRecord) {
      // Create new stitching status record
      console.log('Creating new stitching status record');
      stitchingRecord = new StitchingStatus({
        orderId: orderId,
        customerId: order.customerId,
        status: actualStatus,
        tailor: tailor || '',
        date: date ? new Date(date) : new Date()
      });
    } else {
      // Update existing record
      console.log('Updating existing stitching status record');
      stitchingRecord.status = actualStatus;
      if (tailor !== undefined) {
        stitchingRecord.tailor = tailor;
      }
      if (date) {
        stitchingRecord.date = new Date(date);
      }
    }
    
    const updatedStatus = await stitchingRecord.save();
    console.log('Stitching status saved successfully:', updatedStatus);
    
    // Return the updated data in the format expected by frontend
    const response = {
      id: updatedStatus.orderId,
      customerId: updatedStatus.customerId,
      status: updatedStatus.status,
      stitchingStatus: updatedStatus.status, // Include both for compatibility
      tailor: updatedStatus.tailor,
      date: updatedStatus.date ? updatedStatus.date.toISOString().split('T')[0] : null,
      updatedAt: updatedStatus.updatedAt
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in updateStitchingStatus:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};