const QualityStatus = require('../models/QualityStatus');
const Order = require('../models/Order');

exports.getQualityStatusByCustomerId = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    
    // Get all quality statuses if no customerId provided
    const qualityStatuses = customerId 
      ? await QualityStatus.find({ customerId })
      : await QualityStatus.find();
    
    // Get all orders if no customerId provided
    const orders = customerId 
      ? await Order.find({ customerId })
      : await Order.find();
    
    if (orders.length === 0) {
      return res.status(404).json({ 
        message: customerId 
          ? 'No orders found for this customer' 
          : 'No orders found in the system'
      });
    }
    
    // Group orders by color
    const colorGroups = {};
    
    orders.forEach(order => {
      const color = order.color;
      const clothType = order.clothType;
      
      if (!colorGroups[color]) {
        colorGroups[color] = {
          color,
          clothType,
          items: []
        };
      }
      
      colorGroups[color].items.push(order);
    });
    
    // Merge with quality statuses
    const results = Object.values(colorGroups).map(group => {
      const qualityStatus = qualityStatuses.find(
        status => status.color === group.color
      );
      
      return {
        color: group.color,
        clothType: group.clothType,
        items: group.items,
        dyeingStatus: qualityStatus?.dyeingStatus || 'Not Started',
        qualityStatus: qualityStatus?.qualityStatus || 'Pending',
        rejectedReason: qualityStatus?.rejectedReason || '',
        imageUrl: qualityStatus?.photoUrl || '',
        supervisor: qualityStatus?.supervisor || '',
        date: qualityStatus?.date 
          ? qualityStatus.date.toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0]
      };
    });
    
    res.json(results);
  } catch (error) {
    console.error("Error in getQualityStatusByCustomerId:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateQualityStatus = async (req, res) => {
  try {
    const { customerId, color } = req.params;
    const { qualityStatus, rejectedReason, supervisor, clothType } = req.body;
    
    // Get photo URL if uploaded
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    // Find existing quality status or create new one
    let qualityStatusDoc = await QualityStatus.findOne({ customerId, color });
    
    if (!qualityStatusDoc) {
      qualityStatusDoc = new QualityStatus({
        customerId,
        color,
        clothType: clothType || ''
      });
    }
    
    // Update fields
    if (qualityStatus !== undefined) qualityStatusDoc.qualityStatus = qualityStatus;
    if (rejectedReason !== undefined) qualityStatusDoc.rejectedReason = rejectedReason;
    if (supervisor !== undefined) qualityStatusDoc.supervisor = supervisor;
    if (photoUrl !== undefined) qualityStatusDoc.photoUrl = photoUrl;
    
    // Always update the date to current date
    qualityStatusDoc.date = new Date();
    
    const updatedStatus = await qualityStatusDoc.save();
    
    res.json({
      ...updatedStatus._doc,
      date: updatedStatus.date.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error("Error in updateQualityStatus:", error);
    res.status(500).json({ message: error.message });
  }
};