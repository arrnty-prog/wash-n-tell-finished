const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action:          { type: String, required: true, enum: ['CREATE', 'UPDATE', 'ARCHIVE'] },
  entityType:      { type: String, required: true, enum: ['Admin', 'Staff', 'Customer', 'Order', 'Service', 'Inventory'] },
  entityId:        { type: mongoose.Schema.Types.ObjectId },
  performedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'accounts', required: true },
  performedByName: { type: String, required: true },
  details:         { type: String },
  createdAt:       { type: Date, default: Date.now, immutable: true },
});
module.exports = mongoose.model('auditlogs', AuditLogSchema);