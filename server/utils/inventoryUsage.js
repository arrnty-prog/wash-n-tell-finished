
const USAGE_SERVICES = ['wash_and_fold', 'dry_clean', 'iron', 'wash_and_iron', 'carpet', 'order'];
const SERVICE_LABEL = {
  wash_and_fold: 'Wash and Fold (per kg)',
  dry_clean: 'Dry Cleaning (per piece)',
  iron: 'Ironing (per piece)',
  wash_and_iron: 'Wash and Iron (per piece)',
  carpet: 'Carpet Cleaning (per sq m)',
  order: 'Every order (once per order)',
};
const CATEGORIES = ['Cleaning Supplies', 'Dry Cleaning Supplies', 'Packaging', 'Other'];
const UNITS = ['Liters', 'Gallons', 'Kg', 'Pcs'];

const r3 = (n) => Math.round(Number(n) * 1000) / 1000;

// para di maduplicate pag add
const makeKey = (name, brand) => `${String(name || '').trim()}|${String(brand || '').trim()}`.toLowerCase();

function classifyLine(l) {
  const qty = Number(l && l.qty);
  if (!Number.isFinite(qty) || qty <= 0) return null;
  if (['dry_clean', 'iron', 'wash_and_iron'].includes(l.serviceKey)) return { service: l.serviceKey, qty }; // per-piece lines
  if (l.dimensions && (l.dimensions.length || l.dimensions.width)) return { service: 'carpet', qty };       // carpet lines have a size
  if (l.unit === 'kg' || /fold/i.test(l.serviceName || '')) return { service: 'wash_and_fold', qty };      // wash and fold is by the kg
  return null;
}

// kung ilan per liter or items per order
function computeUsage(orderItems, inventoryItems) {
  const totals = { order: 1 }; 
  for (const line of orderItems || []) {
    const c = classifyLine(line);
    if (c) totals[c.service] = (totals[c.service] || 0) + c.qty;
  }
  const out = [];
  for (const item of inventoryItems) {
    if (item.archived) continue;
    const amount = r3((item.usage || []).reduce((sum, rule) => sum + Number(rule.amount) * (totals[rule.service] || 0), 0));
    if (amount > 0) out.push({ item, amount });
  }
  return out;
}

const usageSummary = (usage = []) =>
  usage.length ? usage.map((u) => `${(SERVICE_LABEL[u.service] || u.service).replace(/ \(.*\)/, '')} ${r3(u.amount)}`).join(', ') : 'none';

module.exports = { USAGE_SERVICES, SERVICE_LABEL, CATEGORIES, UNITS, r3, makeKey, classifyLine, computeUsage, usageSummary };
