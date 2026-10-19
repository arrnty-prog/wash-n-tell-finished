const mongoose = require('mongoose');
const InventoryModel = require('../models/Inventory');
const { logAction } = require('../utils/audit');
const {
  USAGE_SERVICES, CATEGORIES, UNITS, r3, makeKey, computeUsage, usageSummary,
} = require('../utils/inventoryUsage');

const num = (v) => (v === '' || v === null || v === undefined ? NaN : Number(v));
const fmt = (n) => String(r3(n)); // 12 -> "12", 0.1200000001 -> "0.12"
const label = (item) => `"${item.name}"${item.brand ? ` (${item.brand})` : ''}`;

// pang validate item kung avail paba
function validateItem(body, { withQuantity }) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name || name.length > 80) return { error: 'Enter the item name (up to 80 characters)' };
  const brand = typeof body.brand === 'string' ? body.brand.trim().slice(0, 60) : '';
  if (!CATEGORIES.includes(body.category)) return { error: 'Choose a category' };
  if (!UNITS.includes(body.unit)) return { error: 'Choose a unit' };

  const minimum = body.minimum === undefined ? 0 : num(body.minimum);
  if (!Number.isFinite(minimum) || minimum < 0 || minimum > 1e6) return { error: 'Minimum must be 0 or more' };

  const usageIn = Array.isArray(body.usage) ? body.usage : [];
  if (usageIn.length > USAGE_SERVICES.length) return { error: 'Too many usage rules' };
  const seen = new Set();
  const usage = [];
  for (const u of usageIn) {
    const amount = num(u && u.amount);
    if (!u || !USAGE_SERVICES.includes(u.service)) return { error: 'Choose what each usage rule applies to' };
    if (!Number.isFinite(amount) || amount < 0.001 || amount > 1000) return { error: 'Usage amount must be between 0.001 and 1000' };
    if (seen.has(u.service)) return { error: 'Each service can only be listed once in the usage rules' };
    seen.add(u.service);
    usage.push({ service: u.service, amount: r3(amount) });
  }

  const data = { name, brand, category: body.category, unit: body.unit, minimum: r3(minimum), usage, nameKey: makeKey(name, brand) };
  if (withQuantity) {
    const quantity = body.quantity === undefined ? 0 : num(body.quantity);
    if (!Number.isFinite(quantity) || quantity < 0 || quantity > 1e6) return { error: 'Quantity must be 0 or more' };
    data.quantity = r3(quantity);
  }
  return { data };
}

const findItem = async (id) => (mongoose.isValidObjectId(id) ? InventoryModel.findById(id) : null);
const serverError = (res, err) => { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); };

const getInventory = async (req, res) => {
  try {
    const items = await InventoryModel.find({ archived: req.query.archived === 'true' }).sort({ name: 1 });
    res.json(items);
  } catch (err) { serverError(res, err); }
};

//  add nnew supply
const createItem = async (req, res) => {
  const v = validateItem(req.body, { withQuantity: true });
  if (v.error) return res.status(400).json({ error: v.error });
  try {
    const item = await InventoryModel.create(v.data);
    await logAction(req, {
      action: 'CREATE', entityType: 'Inventory', entityId: item._id,
      details: `Added inventory item ${label(item)}: ${fmt(item.quantity)} ${item.unit} in stock, minimum ${fmt(item.minimum)}, auto-usage: ${usageSummary(item.usage)}`,
    });
    res.status(201).json(item);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'An item with that name and brand already exists' });
    serverError(res, err);
  }
};

// edit ng detss
const updateItem = async (req, res) => {
  try {
    const item = await findItem(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const v = validateItem(req.body, { withQuantity: false });
    if (v.error) return res.status(400).json({ error: v.error });

    const oldLabel = label(item);
    const changes = [];
    for (const [field, nice] of [['name', 'name'], ['brand', 'brand'], ['category', 'category'], ['unit', 'unit']]) {
      if ((item[field] || '') !== v.data[field]) changes.push(`${nice} "${item[field] || ''}" → "${v.data[field]}"`);
    }
    if (item.minimum !== v.data.minimum) changes.push(`minimum ${fmt(item.minimum)} → ${fmt(v.data.minimum)}`);
    if (usageSummary(item.usage) !== usageSummary(v.data.usage)) changes.push(`auto-usage ${usageSummary(item.usage)} → ${usageSummary(v.data.usage)}`);
    if (changes.length === 0) return res.json(item); // nothing changed = nothing to log

    Object.assign(item, v.data);
    await item.save();
    await logAction(req, {
      action: 'UPDATE', entityType: 'Inventory', entityId: item._id,
      details: `Edited inventory item ${oldLabel}: ${changes.join('; ')}`,
    });
    res.json(item);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'An item with that name and brand already exists' });
    serverError(res, err);
  }
};

// restock
const adjustStock = async (req, res) => {
  try {
    const { type } = req.body;
    const qty = num(req.body.quantity);
    const note = typeof req.body.note === 'string' ? req.body.note.trim().slice(0, 200) : '';

    if (!['restock', 'use', 'set'].includes(type)) return res.status(400).json({ error: 'Choose restock, use or set' });
    if (!Number.isFinite(qty) || qty > 1e6 || (type === 'set' ? qty < 0 : qty <= 0)) {
      return res.status(400).json({ error: type === 'set' ? 'Counted quantity must be 0 or more' : 'Quantity must be more than 0' });
    }

    const item = await findItem(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.archived) return res.status(400).json({ error: 'Restore this item before changing its stock' });

    const before = item.quantity;
    let after;
    if (type === 'restock') after = r3(before + qty);
    else if (type === 'use') {
      if (qty > before) return res.status(400).json({ error: `Only ${fmt(before)} ${item.unit} in stock` });
      after = r3(before - qty);
    } else after = r3(qty);

    // Only apply if the stock is STILL what we just read (two admins at once -> the second gets a 409).
    const updated = await InventoryModel.findOneAndUpdate(
      { _id: item._id, quantity: before, archived: false },
      { $set: { quantity: after } },
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(409).json({ error: 'Stock was just changed by someone else. Refresh and try again.' });

    const move = `${fmt(before)} → ${fmt(after)} ${item.unit}`;
    const why = note ? ` — ${note}` : '';
    const details = type === 'restock' ? `Restocked ${label(item)}: +${fmt(qty)} ${item.unit} (${move})${why}`
      : type === 'use' ? `Removed stock of ${label(item)}: −${fmt(qty)} ${item.unit} (${move})${why}`
      : `Stock count corrected for ${label(item)}: ${move}${why}`;
    await logAction(req, { action: 'UPDATE', entityType: 'Inventory', entityId: item._id, details });
    res.json(updated);
  } catch (err) { serverError(res, err); }
};

// alis or pangbalik
const setArchived = async (req, res) => {
  try {
    const archived = req.body.archived === true;
    const item = await findItem(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.archived === archived) return res.json(item); // already in that state

    const updated = await InventoryModel.findOneAndUpdate(
      { _id: item._id, archived: !archived }, { $set: { archived } }, { returnDocument: 'after' }
    );
    if (!updated) return res.status(409).json({ error: 'Someone else just changed this item. Refresh and try again.' });

    await logAction(req, {
      action: archived ? 'ARCHIVE' : 'UPDATE', entityType: 'Inventory', entityId: item._id,
      details: archived
        ? `Archived inventory item ${label(item)} (${fmt(item.quantity)} ${item.unit} left)`
        : `Restored inventory item ${label(item)} from the archive`,
    });
    res.json(updated);
  } catch (err) { serverError(res, err); }
};



// pangdeduct per order
const deductForOrder = async (req, order) => {
  const items = await InventoryModel.find({ archived: false, 'usage.0': { $exists: true } });
  const used = computeUsage(order.items, items);
  if (used.length === 0) return;

  const parts = [];
  for (const { item, amount } of used) {
    
    let before = null;
    for (let attempt = 0; attempt < 5 && before === null; attempt++) {
      const fresh = await InventoryModel.findById(item._id);
      if (!fresh || fresh.archived) break;
      const after = Math.max(0, r3(fresh.quantity - amount)); // never below zero
      const ok = await InventoryModel.findOneAndUpdate(
        { _id: item._id, quantity: fresh.quantity, archived: false },
        { $set: { quantity: after } },
        { returnDocument: 'after' }
      );
      if (ok) before = fresh.quantity;
    }
    if (before === null) continue;
    const after = Math.max(0, r3(before - amount));
    const short = r3(amount - before);
    parts.push(`${item.name} −${fmt(amount)} ${item.unit} (${fmt(before)} → ${fmt(after)})${short > 0 ? ` ⚠ ran out, short by ${fmt(short)}` : ''}`);
  }
  if (parts.length === 0) return;
  await logAction(req, {
    action: 'UPDATE', entityType: 'Inventory',
    details: `Order #${order.orderCode} used supplies: ${parts.join('; ')}`,
  });
};

module.exports = { getInventory, createItem, updateItem, adjustStock, setArchived, deductForOrder };
