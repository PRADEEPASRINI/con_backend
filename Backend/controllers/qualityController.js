const QualityStatus = require('../models/QualityStatus');
const Order = require('../models/Order');

exports.getQualityStatusByCustomerId = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    
    // Get quality statuses
    const qualityStatuses = await QualityStatus.find({ customerId });
    
    // Get orders to understand all available colors
    const orders = await Order.find({ customerId });
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this customer' });
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
        photoUrl: qualityStatus?.photoUrl || '',
        supervisor: qualityStatus?.supervisor || '',
        date: qualityStatus?.date ? qualityStatus.date.toISOString().split('T')[0] : null
      };
    });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateQualityStatus = async (req, res) => {
  try {
    const { customerId, color } = req.params;
    const { qualityStatus, dyeingStatus, rejectedReason, supervisor, date } = req.body;
    
    // Get photo URL if uploaded
    const photoUrl = req.file?.path;
    
    // Find existing quality status or create new one
    let qualityStatusDoc = await QualityStatus.findOne({ customerId, color });
    
    if (!qualityStatusDoc) {
      // Create new quality status
      qualityStatusDoc = new QualityStatus({
        customerId,
        color,
        clothType: req.body.clothType
      });
    }
    
    // Update fields
    if (qualityStatus) qualityStatusDoc.qualityStatus = qualityStatus;
    if (dyeingStatus) qualityStatusDoc.dyeingStatus = dyeingStatus;
    if (rejectedReason) qualityStatusDoc.rejectedReason = rejectedReason;
    if (supervisor) qualityStatusDoc.supervisor = supervisor;
    if (photoUrl) qualityStatusDoc.photoUrl = photoUrl;
    
    if (date) {
      qualityStatusDoc.date = new Date(date);
    }
    
    const updatedStatus = await qualityStatusDoc.save();
    
    res.json(updatedStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};