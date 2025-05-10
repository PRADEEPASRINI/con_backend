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
    res.status(500).json({ message: error.message });
  }
};

exports.updateStitchingStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, tailor, date } = req.body;
    
    // First verify the cutting is complete
    const cuttingStatus = await CuttingStatus.findOne({ orderId });
    if (!cuttingStatus || cuttingStatus.status !== 'Done') {
      return res.status(400).json({ 
        message: 'Cannot update stitching status until cutting is complete' 
      });
    }
    
    let stitchingStatus = await StitchingStatus.findOne({ orderId });
    
    if (!stitchingStatus) {
      return res.status(404).json({ message: 'Stitching status not found' });
    }
    
    stitchingStatus.status = status || stitchingStatus.status;
    stitchingStatus.tailor = tailor || stitchingStatus.tailor;
    
    if (date) {
      stitchingStatus.date = new Date(date);
    }
    
    const updatedStatus = await stitchingStatus.save();
    
    res.json(updatedStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};