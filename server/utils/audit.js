const AuditLog = require('../models/AuditLog');

async function logAction(req, { action, entityType, entityId, details }) {
if (!req.user) return;
try {
await AuditLog.create({
action, entityType, entityId, details,
performedBy: req.user._id,
performedByName: `${req.user.firstName} ${req.user.lastName}`,
    });
} catch (err) {
    console.error('Audit log failed:', err.message);
}
}
module.exports = { logAction };