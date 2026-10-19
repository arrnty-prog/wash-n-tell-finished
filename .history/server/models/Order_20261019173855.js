const mongoose = require('mongoose');

const STAGES = ['Pending', 'Washing', 'Drying', 'Folding', 'Ready', 'Completed'];

// A snapshot of what was ordered, so later price changes don't rewrite history.
const OrderItemSchema = new mongoose.Schema({
  id:          String,
  itemId:      String,
  serviceKey:  String,
  serviceName: String,
  name:        { type: String, required: true },
  unit:        String,
  price:       { type: Number, required: true, min: 0 },
  qty:         { type: Number, required: true, min: 0 },
  dimensions:  { length: Number, width: Number },
}, { _id: false });

// one entry at a time this is for order history -- tracking of status changed
const StatusEntrySchema = new mongoose.Schema({
  status:        { type: String, enum: STAGES, required: true },
  changedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'accounts', required: true },
  changedByName: { type: String, required: true },
  at:            { type: Date, default: Date.now },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'accounts', required: true },
  customerName: { type: String, required: true },
  items:        { type: [OrderItemSchema], validate: (v) => v.length > 0 },

  fulfillment: {
    type:          { type: String, enum: ['pickup', 'delivery'], required: true },
    address:       String,
    scheduledDate: Date,
  },

  subtotal:    { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  tax:         { type: Number, required: true },
  total:       { type: Number, required: true },

  payment: {
    method:       { type: String, enum: ['card', 'gcash', 'cash'], required: true },
    status:       { type: String, enum: ['paid', 'pending'], required: true },
    paidAt:       Date,
    cashReceived: Number,
    change:       Number,
    // Never store a full card number or CVV. Last 4 digits only.
    card:  { last4: String },
    gcash: { accountName: String, number: String },
  },

  status:        { type: String, enum: STAGES, default: 'Pending' },
  statusHistory: { type: [StatusEntrySchema], default: [] },
  archived:      { type: Boolean, default: false },

  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'accounts', required: true },
  createdByName: String,
  createdAt:     { type: Date, default: Date.now, immutable: true },
}, { toJSON: { virtuals: true }, id: false });

// Short order number shown in the app, e.g. #A1B2C3 (same as your payment success page).
OrderSchema.virtual('orderCode').get(function () {
  return String(this._id).slice(-6).toUpperCase();
});

module.exports = mongoose.model('orders', OrderSchema);
