const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  tracking: {
    carrier: {
      type: String,
      enum: [
        'Royal Mail',
        'DHL',
        'FedEx',
        'UPS',
        'USPS',
        'DPD',
        'Hermes',
        'Other'
      ]
    },
    trackingNumber: String,
    trackingUrl: String,
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
});

module.exports = mongoose.model('Order', orderSchema);
