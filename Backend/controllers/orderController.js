const Order = require('../models/Order');
const CuttingStatus = require('../models/CuttingStatus');
const StitchingStatus = require('../models/StitchingStatus');

exports.createOrder = async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    
    // Create initial cutting status when order is created
    const cuttingStatus = new CuttingStatus({
      orderId: savedOrder._id,
      customerId: savedOrder.customerId,
      status: 'Not Started'
    });
    await cuttingStatus.save();
    
    // Create initial stitching status when order is created
    const stitchingStatus = new StitchingStatus({
      orderId: savedOrder._id,
      customerId: savedOrder.customerId,
      status: 'Not Started'
    });
    await stitchingStatus.save();
    
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrdersByCustomerId = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const orders = await Order.find({ customerId });
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this customer' });
    }
    
    // Get all associated statuses for these orders
    const orderIds = orders.map(order => order._id);
    
    const cuttingStatuses = await CuttingStatus.find({
      orderId: { $in: orderIds }
    });
    
    const stitchingStatuses = await StitchingStatus.find({
      orderId: { $in: orderIds }
    });
    
    // Merge the data for frontend use
    const enrichedOrders = orders.map(order => {
      const cutting = cuttingStatuses.find(
        status => status.orderId.toString() === order._id.toString()
      ) || { status: 'Not Started' };
      
      const stitching = stitchingStatuses.find(
        status => status.orderId.toString() === order._id.toString()
      ) || { status: 'Not Started' };
      
      return {
        ...order.toObject(),
        cuttingStatus: cutting.status,
        cuttingSupervisor: cutting.supervisor,
        cuttingDate: cutting.date,
        stitchingStatus: stitching.status,
        tailor: stitching.tailor,
        stitchingDate: stitching.date
      };
    });
    
    res.json(enrichedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add this new method for getting all unique customers
exports.getAllCustomers = async (req, res) => {
  try {
    // Using MongoDB's distinct method to get unique customer IDs
    const customers = await Order.distinct('customerId');
    
    // Format the response to match what the frontend expects
    const formattedCustomers = customers.map(customerId => ({ customerId }));
    
    res.status(200).json(formattedCustomers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};