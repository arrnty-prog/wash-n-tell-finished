const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/InventoryController');
const requireRole = require('../middleware/requireRole');
const requireAuth = require('../middleware/requireAuth');

router.get('/', requireAuth, requireRole('admin', 'staff'), inventoryController.getInventory);
router.post('/', requireAuth, requireRole('admin', 'staff'), inventoryController.createItem);
router.put('/:id', requireAuth, requireRole('admin', 'staff'), inventoryController.updateItem);
router.post('/:id/adjust', requireAuth, requireRole('admin', 'staff'), inventoryController.adjustStock);
router.patch('/:id/archive', requireAuth, requireRole('admin', 'staff'), inventoryController.setArchived);

module.exports = router;
