const CuttingStatus = require('../models/CuttingStatus');
const Order = require('../models/Order');

exports.getCuttingStatusByCustomerId = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    
    // Get orders first
    const orders = await Order.find({ customerId });
    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this customer' });
    }
    
    // Get cutting statuses
    const orderIds = orders.map(order => order._id);
    const cuttingStatuses = await CuttingStatus.find({
      orderId: { $in: orderIds }
    });
    
    // Merge data for frontend use
    const results = orders.map(order => {
      const cutting = cuttingStatuses.find(
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
        supervisor: cutting.supervisor,
        date: cutting.date ? cutting.date.toISOString().split('T')[0] : null
      };
    });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCuttingStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, supervisor, date } = req.body;
    
    let cuttingStatus = await CuttingStatus.findOne({ orderId });
    
    if (!cuttingStatus) {
      return res.status(404).json({ message: 'Cutting status not found' });
    }
    
    cuttingStatus.status = status || cuttingStatus.status;
    cuttingStatus.supervisor = supervisor || cuttingStatus.supervisor;
    
    if (date) {
      cuttingStatus.date = new Date(date);
    }
    
    const updatedStatus = await cuttingStatus.save();
    
    res.json(updatedStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
