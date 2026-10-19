const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type && req.query.type !== 'all') filter.entityType = req.query.type;
    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(logs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};