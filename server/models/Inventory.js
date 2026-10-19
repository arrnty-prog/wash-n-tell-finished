const mongoose = require('mongoose');
const { USAGE_SERVICES, CATEGORIES, UNITS } = require('../utils/inventoryUsage');

// pang determine if ilang liters per kg
const UsageRuleSchema = new mongoose.Schema({
  service: { type: String, enum: USAGE_SERVICES, required: true },
  amount:  { type: Number, required: true, min: 0 },
}, { _id: false });

const InventorySchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, maxlength: 80 },
  brand:    { type: String, trim: true, maxlength: 60, default: '' },
  category: { type: String, enum: CATEGORIES, required: true },
  unit:     { type: String, enum: UNITS, required: true },
  quantity: { type: Number, required: true, min: 0, default: 0 },  
  minimum:  { type: Number, required: true, min: 0, default: 0 },  
  usage:    { type: [UsageRuleSchema], default: [] },              // pangdeduct asa inventory controller ung function
  archived: { type: Boolean, default: false },
  nameKey:  { type: String, required: true, unique: true },       
}, { timestamps: true });

module.exports = mongoose.model('inventory', InventorySchema);
