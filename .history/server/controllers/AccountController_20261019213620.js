const AccountModel = require('../models/Account');
const { logAction } = require('../utils/audit');

const TYPE = { admin: 'Admin', staff: 'Staff', user: 'Customer' };

const getAccounts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const accounts = await AccountModel.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(accounts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const createAccount = (role) => async (req, res) => {
  const { firstName, lastName, email, mobile, password, position, status, address } = req.body;

  if (!firstName || !lastName || !email || !mobile || !password) {
    return res.status(400).json({ error: 'Please fill in all required fields' });
  }

  try {
    const validStatus = ['Active', 'Archived'].includes(status) ? status : 'Active';

    const account = await AccountModel.create({
      firstName,
      lastName,
      email,
      address,
      phone: mobile,
      password,
      role,
      status: role === 'user' ? validStatus : 'Active',
    });
//created show saaw audit
    await logAction(req, {
      action: 'CREATE',
      entityType: TYPE[role],
      entityId: account._id,
      details: `Created ${TYPE[role].toLowerCase()} account for ${account.firstName} ${account.lastName} (${account.email})`,
    });

    const { password: _omit, ...safe } = account.toObject();
    res.status(201).json(safe);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'That email is already in use' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateAccount = async (req, res) => {
  try {
    const target = await AccountModel.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'Account not found' });

    // staff customers only for edit
    if (req.user.role === 'staff' && target.role !== 'user') {
      return res.status(403).json({ error: 'Staff can only edit customers' });
    }

    // if archived cannot edit
    if (req.body.status !== undefined && !['Active', 'Archived'].includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // no archiving of own account
    if (req.body.status === 'Archived' && String(target._id) === String(req.user._id)) {
      return res.status(400).json({ error: "You can't archive your own account" });
    }

    // password cannot be changed
    const allowed = ['firstName', 'lastName', 'email', 'phone', 'address', 'status', 'position'];
    for (const field of allowed) {
      if (req.body[field] !== undefined) target[field] = req.body[field];
    }

    await target.save();

    const { password, ...safe } = target.toObject();
    res.json(safe);
  } catch (err) {
    console.log(err);
    if (err.code === 11000) return res.status(409).json({ error: 'Email already in use' });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const account = await AccountModel.findOne({ email });

    if (!account || account.password !== password) {
      return res.status(400).json({ error: 'Invalid email/password' });
    }

    res.json({
      message: 'Login successful!',
      user: {
        id: account._id,
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        phone: account.phone,
        address: account.address,
        role: account.role,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// for retrieving custome profile only
const getMe = async (req, res) => {
  const { password, ...safe } = req.user.toObject();
  res.json(safe);
};

// for updating customer  profile only
const updateMe = async (req, res) => {
  try {
    const user = req.user;
    for (const field of ['firstName', 'lastName', 'email', 'phone', 'address']) {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    }
    await user.save();
    const { password, ...safe } = user.toObject();
    res.json(safe);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Email already in use' });
    if (err.name === 'ValidationError') return res.status(400).json({ error: 'Please fill in all required fields' });
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// for user change password
const changeMyPassword = async (req, res) => {
  const { current, next } = req.body;
  if (!current || !next) return res.status(400).json({ error: 'Please fill in all fields' });
  if (req.user.password !== current) return res.status(400).json({ error: 'Current password is incorrect' });
  if (next.length < 8 || !/[A-Za-z]/.test(next) || !/\d/.test(next)) {
    return res.status(400).json({ error: 'New password needs at least 8 characters, with letters and numbers' });
  }
  try {
    req.user.password = next;
    await req.user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getAccounts, updateAccount, createAccount, login, getMe, updateMe, changeMyPassword };