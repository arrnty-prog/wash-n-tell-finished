const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const requireRole = require('../middleware/requireRole'); // allows admin + staff
const requireAuth = require('../middleware/requireAuth')

router.get('/', requireAuth, requireRole('admin', 'staff'), orderController.getOrders);
router.get('/mine', requireAuth, orderController.getMyOrders);
router.post('/', requireAuth, orderController.createOrder);
router.patch('/:id/status', requireAuth, requireRole('admin', 'staff'), orderController.updateStatus);
module.exports = router;
