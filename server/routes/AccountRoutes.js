const express = require('express')
const router = express.Router();
const accountController = require('../controllers/AccountController')
const requireRole = require('../middleware/requireRole'); // allows admin + staff
const requireAuth = require('../middleware/requireAuth')


router.get('/getAccounts', requireAuth, requireRole('admin', 'staff'), accountController.getAccounts);

router.post('/admins',    requireAuth, requireRole('admin'), accountController.createAccount('admin'));
router.post('/staff',     requireAuth, requireRole('admin'), accountController.createAccount('staff'));
router.post('/customers', accountController.createAccount('user'));
router.put('/accounts/:id', requireAuth, requireRole('admin', 'staff'), accountController.updateAccount);
router.post('/login', accountController.login)

router.get('/me', requireAuth, accountController.getMe);
router.put('/me', requireAuth, accountController.updateMe);
router.post('/me/password', requireAuth, accountController.changeMyPassword);

module.exports = router;
