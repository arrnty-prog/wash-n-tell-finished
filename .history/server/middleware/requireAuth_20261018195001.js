const AccountModel = require('../models/Account');

module.exports = async (req, res, next) => {
  try {
    const id = req.header('x-user-id');
    if (!id) return res.status(401).json({ error: 'Not logged in' });

    const user = await AccountModel.findById(id);
    if (!user) return res.status(401).json({ error: 'Invalid user' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid user' });
  }
};