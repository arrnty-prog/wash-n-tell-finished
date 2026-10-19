const mongoose = require('mongoose');
const AccountModel = require('../models/Account');
const OrderModel = require('../models/Order');
const { logAction } = require('../utils/audit');
const { deductForOrder } = require('./InventoryController');

const STAGES = ['Pending', 'Washing', 'Drying', 'Folding', 'Ready', 'Completed'];

const DELIVERY_FEE = 50;
const TAX_RATE = 0.12;

const METHODS = ['card', 'gcash', 'cash'];
const FULFILLMENT_TYPES = ['pickup', 'delivery'];

const computeTotals = (items, fulfillmentType) => {
  const subtotalCents = items.reduce((sum, it) => sum + Math.round(Number(it.price) * 100 * Number(it.qty)), 0);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const deliveryCents = fulfillmentType === 'delivery' ? DELIVERY_FEE * 100 : 0;
  return {
    subtotal: subtotalCents / 100,
    tax: taxCents / 100,
    deliveryFee: deliveryCents / 100,
    total: (subtotalCents + taxCents + deliveryCents) / 100,
  };
};

const itemError = (items) => {
  if (!Array.isArray(items) || items.length === 0) return 'The order has no items';
  for (const it of items) {
    const price = Number(it?.price);
    const qty = Number(it?.qty);
    if (!it?.name || it.price == null || !Number.isFinite(price) || price < 0 || it.qty == null || !Number.isFinite(qty) || qty <= 0) {
      return `Invalid item in order: ${it?.name || 'unnamed item'}`;
    }
  }
  return null;
};

const createOrder = async (req, res) => {
  const { items, fulfillment = {}, payment = {} } = req.body;
  const customer = req.user.role === 'user' ? String(req.user._id) : req.body.customer;

  const problem = itemError(items);
  if (problem) return res.status(400).json({ error: problem });

  if (!FULFILLMENT_TYPES.includes(fulfillment.type)) {
    return res.status(400).json({ error: 'Choose pickup or delivery' });
  }
  if (!METHODS.includes(payment.method)) {
    return res.status(400).json({ error: 'Choose a valid payment method' });
  }
  if (!mongoose.isValidObjectId(customer)) {
    return res.status(400).json({ error: 'Select a customer for this order' });
  }

  try {
    const account = await AccountModel.findById(customer);
    if (!account || account.role !== 'user') {
      return res.status(400).json({ error: 'Customer not found' });
    }

    const totals = computeTotals(items, fulfillment.type);
    const paid = payment.status === 'paid'; // anything else is recorded as pending
    const record = { method: payment.method, status: paid ? 'paid' : 'pending' };

    if (paid) {
      record.paidAt = new Date();

      if (payment.method === 'cash') {
        const received = Number(payment.cashReceived);
        if (!Number.isFinite(received) || Math.round(received * 100) < Math.round(totals.total * 100)) {
          return res.status(400).json({ error: 'Cash received is less than the amount due' });
        }
        record.cashReceived = received;
        record.change = Math.round((received - totals.total) * 100) / 100;
      }
      if (payment.method === 'card') {
        if (!/^\d{4}$/.test(payment.card?.last4 || '')) {
          return res.status(400).json({ error: 'Missing card details' });
        }
        record.card = { last4: payment.card.last4 }; // deliberately nothing else
      }
      if (payment.method === 'gcash') {
        if (!payment.gcash?.accountName || !payment.gcash?.number) {
          return res.status(400).json({ error: 'Missing GCash details' });
        }
        record.gcash = { accountName: payment.gcash.accountName, number: payment.gcash.number };
      }
    }

    const scheduled = fulfillment.scheduledDate ? new Date(fulfillment.scheduledDate) : null;

    const order = await OrderModel.create({
      customer: account._id,
      customerName: `${account.firstName} ${account.lastName}`,
      items,
      fulfillment: {
        type: fulfillment.type,
        address: fulfillment.address || account.address,
        scheduledDate: scheduled && !Number.isNaN(scheduled.getTime()) ? scheduled : undefined,
      },
      ...totals,
      payment: record,
      status: STAGES[0],
      statusHistory: [{
        status: STAGES[0],
        changedBy: req.user._id,
        changedByName: `${req.user.firstName} ${req.user.lastName}`,
      }],
      createdBy: req.user._id,
    });

    await logAction(req, {
      action: 'CREATE',
      entityType: 'Order',
      entityId: order._id,
      details: `Created order #${order.orderCode} for ${order.customerName}: ₱${totals.total.toFixed(2)} via ${record.method} (${record.status})`,
    });

    try {
      await deductForOrder(req, order);
    } catch (invErr) {
      console.error('Inventory deduction failed:', invErr.message);
    }

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//retrieving orders
const getOrders = async (req, res) => {
  try {
    const filter = {};
    if (STAGES.includes(req.query.status)) filter.status = req.query.status;
    if (['paid', 'pending'].includes(req.query.payment)) filter['payment.status'] = req.query.payment;

    const orders = await OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(300)
      .populate('createdBy', 'firstName lastName'); // swap the saved id for the staff member's name
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find({ customer: req.user._id }).sort({ createdAt: -1 }).limit(300);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// updating order status
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ error: 'Order not found' });
    if (!STAGES.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const order = await OrderModel.findById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const from = order.status || STAGES[0]; // orders saved before statuses existed count as Received
    if (Math.abs(STAGES.indexOf(status) - STAGES.indexOf(from)) !== 1) {
      return res.status(400).json({ error: 'An order can only move one step forward or back' });
    }

    // only one staff can move
    const updated = await OrderModel.findOneAndUpdate(
      { _id: id, status: from === STAGES[0] ? { $in: [STAGES[0], null] } : from },
      {
        $set: { status },
        $push: { statusHistory: { status, changedBy: req.user._id, changedByName: `${req.user.firstName} ${req.user.lastName}`, at: new Date() } },
      },
      { returnDocument: 'after' }
    ).populate('createdBy', 'firstName lastName');

    if (!updated) return res.status(409).json({ error: 'Someone else just updated this order. Refresh and try again.' });

    // for audit log
    await logAction(req, {
      action: 'UPDATE',
      entityType: 'Order',
      entityId: updated._id,
      details: `Moved order #${updated.orderCode} (${updated.customerName}) from ${from} to ${status}`,
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { createOrder, getOrders, getMyOrders, updateStatus, computeTotals };