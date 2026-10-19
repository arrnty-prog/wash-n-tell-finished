const express = require('express');
const router = express.Router();
const auditController = require('../controllers/AuditController');
const requireRole = require('../middleware/requireRole'); // allows admin + staff
const requireAuth = require('../middleware/requireAuth')

router.get('/', requireAuth, requireRole('admin', 'staff'), auditController.getAuditLogs);

module.exports = router;
