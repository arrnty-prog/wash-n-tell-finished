// Fake data
export const orders = [
  { key: 1, id: '#ORD-2841', customer: 'Maria Clara', service: 'Wash & Fold', status: 'In Progress', amount: 450 },
  { key: 2, id: '#ORD-2840', customer: 'Juan Dela Cruz', service: 'Dry Cleaning', status: 'Ready', amount: 1200 },
  { key: 3, id: '#ORD-2839', customer: 'Elena Smith', service: 'Full Service', status: 'Drying', amount: 850 },
  { key: 4, id: '#ORD-2838', customer: 'Roberto Gomez', service: 'Wash & Fold', status: 'Drying', amount: 320 },
];
export const customers = [
  { key: 1, name: 'Sarah Jenkins', phone: '+63 917 123 4455', orders: 17, spent: 14250, tier: 'VIP' },
  { key: 2, name: 'Michael Rivera', phone: '+63 917 888 8900', orders: 8, spent: 5400, tier: 'Regular' },
  { key: 3, name: 'Elena Rodriguez', phone: '+63 922 555 7766', orders: 34, spent: 28900, tier: 'VIP' },
];
export const staff = [
  { key: 1, name: 'Marta Clara', role: 'Washer/Folder', contact: '+63 912 345 6789', shift: 'Morning', status: 'Active' },
  { key: 2, name: 'Juan Dela Cruz', role: 'Manager', contact: '+63 998 765 4321', shift: 'Full Shift', status: 'Active' },
  { key: 3, name: 'Elena Smith', role: 'Folder', contact: '+63 915 222 3333', shift: 'Evening', status: 'Inactive' },
];
export const services = [
  { key: 1, desc: 'Standard wash and fold for everyday clothes.', name: 'Wash & Fold', type: 'Standard', price: '₱50 / kg', time: '24 hours' },
  { key: 2, desc: 'Professional care for delicate fabrics.', name: 'Dry Cleaning', type: 'Standard', price: '₱120 / item', time: '48-72 hours' },
  { key: 3, desc: 'Priority processing for urgent orders.', popular: true, name: 'Express Service', type: 'Add-on', price: '+50% base', time: 'Under 6 hours' },
  { key: 4, desc: 'Low-allergen softener for extra freshness.', name: 'Premium Softener', type: 'Add-on', price: '₱30 / wash', time: 'Active' },
];
export const payments = [
  { key: 1, id: 'TXN-90124', customer: 'Montrel Bautista', order: '#ORD-4453', amount: 2100, method: 'Card', status: 'Refunded' },
  { key: 2, id: 'TXN-90123', customer: 'Juan Dela Cruz', order: '#ORD-4401', amount: 1250, method: 'Cash', status: 'Paid' },
  { key: 3, id: 'TXN-90122', customer: 'Maria Santos', order: '#ORD-4431', amount: 850, method: 'GCash', status: 'Paid' },
  { key: 4, id: 'TXN-90121', customer: 'Roberto Gomez', order: '#ORD-4433', amount: 2100, method: 'Card', status: 'Failed' },
  { key: 5, id: 'TXN-90120', customer: 'Sarah Jenkins', order: '#ORD-4402', amount: 450, method: 'GCash', status: 'Paid' },
];
export const paymentStats = { totalRevenue: 147530, netThisWeek: 42210, outstanding: 12450 };
export const paymentMethods = [
  { label: 'Cash', value: 45, color: '#10b981' },
  { label: 'GCash', value: 35, color: '#7c3aed' },
  { label: 'Card', value: 20, color: '#2563eb' },
];
export const payouts = [
  { key: 1, title: 'Settlement', date: 'Oct 24, 2024', amount: 42300 },
  { key: 2, title: 'Settlement', date: 'Oct 17, 2024', amount: 38150 },
];
export const inventory = [
  { key: 1, name: 'Liquid Detergent', brand: 'Ariel', category: 'Cleaning Supplies', level: 12, min: 20, unit: 'Gallons' },
  { key: 2, name: 'Fabric Softener', brand: 'Downy', category: 'Cleaning Supplies', level: 45, min: 15, unit: 'Gallons' },
  { key: 3, name: 'Heavy Duty Bleach', brand: 'Zonrox', category: 'Cleaning Supplies', level: 4, min: 10, unit: 'Gallons' },
  { key: 4, name: 'Plastic Laundry Bags (L)', brand: 'SM Bonus', category: 'Packaging', level: 500, min: 100, unit: 'Units' },
  { key: 5, name: 'Identification Tags', brand: 'Local Supplier', category: 'Packaging', level: 45, min: 200, unit: 'Units' },
];
export const restocks = [
  { title: 'Detergent Refill', note: '+25 Gallons • Oct 28', cost: 8500 },
  { title: 'Laundry Bags Bulk', note: '+1,000 Pcs • Oct 25', cost: 2200 },
  { title: 'Softener Premium', note: '+20 Gallons • Oct 22', cost: 6400 },
];
export const history = [
  { key: 1, id: '#ORD-4402', customer: 'Sarah Jenkins', date: 'Oct 24, 2024', service: 'Wash & Fold', amount: 450, rating: 5 },
  { key: 2, id: '#ORD-4388', customer: 'Michael Choi', date: 'Oct 23, 2024', service: 'Dry Cleaning', amount: 1290, rating: 4 },
  { key: 3, id: '#ORD-4372', customer: 'Emma Wilson', date: 'Oct 22, 2024', service: 'Press Only', amount: 180, rating: 5 },
];
export const machines = [
  { name: 'Washer #01', progress: 65, note: '12 min left' },
  { name: 'Washer #03', progress: 40, note: '25 min left' },
  { name: 'Dryer #02', progress: 15, note: '38 min left' },
];
export const kanban = {
  Received: [{ id: '#ORD-2845', customer: 'Michael Rivera' }],
  Washing: [{ id: '#ORD-2841', customer: 'Sarah Jenkins' }],
  Drying: [{ id: '#ORD-2839', customer: 'Elena Rodriguez' }],
  Folding: [{ id: '#ORD-2836', customer: 'Marcus Thorne' }],
  Ready: [{ id: '#ORD-2830', customer: 'Sophia Lopez' }],
};
export const actionHistory = [
  { key: 1, date: 'Oct 15, 2026, 11:54 PM', by: 'Flint Tejo', type: 'Inventory', details: 'Restocked Liquid Detergent (+25 Gallons)' },
  { key: 2, date: 'Oct 15, 2026, 6:54 AM', by: 'Flint Tejo', type: 'Service', details: 'Updated Wash & Fold price to ₱60.00 / kg' },
  { key: 3, date: 'Oct 14, 2026, 6:54 AM', by: 'Angelica Dizon', type: 'Staff', details: 'Set Maria Lourdes Garcia to Inactive' },
];

export const staffOrders = [
  { key: 1, id: '#ORD-2836', customer: 'Angelo Villanueva', date: 'Oct 15, 2026', service: 'Express Service', status: 'Received', payment: 'Unpaid', amount: 450, staff: 'Alex R.' },
  { key: 2, id: '#ORD-2837', customer: 'Maria Cristina Reyes', date: 'Oct 15, 2026', service: 'Dry Cleaning', status: 'Received', payment: 'Paid', amount: 320, staff: 'Alex R.' },
  { key: 3, id: '#ORD-2841', customer: 'Arianna Tayao', date: 'Oct 15, 2026', service: 'Wash & Fold', status: 'Washing', payment: 'Paid', amount: 450, staff: 'Alex R.' },
  { key: 4, id: '#ORD-2838', customer: 'Flint Tejo', date: 'Oct 15, 2026', service: 'Wash & Fold', status: 'Drying', payment: 'Paid', amount: 290, staff: 'Sarah K.' },
  { key: 5, id: '#ORD-2839', customer: 'John Randolph Sayson', date: 'Oct 15, 2026', service: 'Wash & Fold', status: 'Folding', payment: 'Unpaid', amount: 650, staff: 'Sarah K.' },
  { key: 6, id: '#ORD-2840', customer: 'Montrel Bautista', date: 'Oct 15, 2026', service: 'Dry Cleaning', status: 'Ready', payment: 'Paid', amount: 750, staff: 'Alex R.' },
  { key: 7, id: '#ORD-2835', customer: 'Kristine Mae Lopez', date: 'Oct 15, 2026', service: 'Wash & Fold', status: 'Ready', payment: 'Paid', amount: 980, staff: 'Alex R.' },
  { key: 8, id: '#ORD-2834', customer: 'Angelo Villanueva', date: 'Oct 14, 2026', service: 'Wash & Fold', status: 'Picked Up', payment: 'Paid', amount: 336, staff: 'Sarah K.' },
  { key: 9, id: '#ORD-2833', customer: 'Arianna Tayao', date: 'Oct 14, 2026', service: 'Wash & Fold', status: 'Picked Up', payment: 'Paid', amount: 336, staff: 'Alex R.' },
  { key: 10, id: '#ORD-2832', customer: 'Flint Tejo', date: 'Oct 13, 2026', service: 'Dry Cleaning', status: 'Picked Up', payment: 'Paid', amount: 820, staff: 'Sarah K.' },
];
export const staffAlerts = [
  { type: 'error', title: 'Urgent order', text: 'Express order ORD-2836 is waiting to be washed.' },
  { type: 'info', title: 'Pickup reminder', text: '2 orders are ready for customer pickup.' },
  { type: 'warning', title: 'Maintenance', text: 'Washer 4 is out of service.' },
];
export const staffCustomers = [
  { key: 1, name: 'Arianna Tayao', joined: 'Jan 2024', phone: '+63 945 123 4455', orders: 45, tier: 'VIP' },
  { key: 2, name: 'Montrel Bautista', joined: 'Feb 2024', phone: '+63 917 555 0142', orders: 12, tier: 'Regular' },
  { key: 3, name: 'John Randolph Sayson', joined: 'Mar 2024', phone: '+63 917 123 4567', orders: 8, tier: 'Regular' },
  { key: 4, name: 'Flint Tejo', joined: 'Apr 2024', phone: '+63 928 410 7788', orders: 31, tier: 'VIP' },
  { key: 5, name: 'Maria Cristina Reyes', joined: 'May 2024', phone: '+63 906 220 9134', orders: 5, tier: 'Regular' },
];
// Details panel on Customer Management (first customer is shown)
export const staffCustomerDetail = {
  name: 'Arianna Tayao', tier: 'VIP', code: 'CU-0021', phone: '+63 945 123 4455', email: 'arianna.t@gmail.com',
  address: 'Blk 4 Lot 12, Sampaguita St., Brgy. San Mateo, Norzagaray, Bulacan', payment: 'GCash', orders: 45, spent: 24200,
  transactions: [
    { service: 'Wash & Fold', date: 'Oct 15, 2026', amount: 450 },
    { service: 'Wash & Fold', date: 'Oct 14, 2026', amount: 336 },
  ],
  notes: 'Prefers mild scented fabric softener. Text before delivering.',
};
// Create Laundry Order: the draft shown on the page (totals are typed in, not calculated)
export const staffOrderDraft = {
  customer: 'Arianna Tayao',
  service: { name: 'Wash & Fold', rate: '₱60.00 / kg • 24 Hours', qty: 5, unit: 'kg' },
  line: { label: 'Wash & Fold (5 kg)', amount: '₱300.00' },
  addons: [
    { name: 'Express Service', price: '+₱80.00', checked: false },
    { name: 'Premium Softener', price: '+₱15.00', checked: true },
  ],
  // calculate these from the items, add-ons, VIP discount and tax
  summary: [
    ['Weight Total', '5 kg'], ['Dry-clean Items', '0'], ['Items Total', '₱315.00'],
    ['VIP Discount (10%)', '-₱30.00'], ['Tax (12% VAT)', '₱34.20'],
  ],
  total: '₱319.20',
};
// Update Laundry Status board
export const staffKanban = {
  Received: [
    { id: '#ORD-2836', service: 'Express Service', customer: 'Angelo Villanueva', detail: '4h ago • 5 kg' },
    { id: '#ORD-2837', service: 'Dry Cleaning', customer: 'Maria Cristina Reyes', detail: '3h ago • 3 kg' },
  ],
  Washing: [{ id: '#ORD-2841', service: 'Wash & Fold', customer: 'Arianna Tayao', detail: '10m ago • 6 kg' }],
  Drying: [{ id: '#ORD-2838', service: 'Wash & Fold', customer: 'Flint Tejo', detail: '2h ago • 4 kg' }],
  Folding: [{ id: '#ORD-2839', service: 'Wash & Fold', customer: 'John Randolph Sayson', detail: '1h ago • 8 kg' }],
  Ready: [
    { id: '#ORD-2840', service: 'Dry Cleaning', customer: 'Montrel Bautista', detail: '25m ago • 3 items' },
    { id: '#ORD-2835', service: 'Wash & Fold', customer: 'Kristine Mae Lopez', detail: '5h ago • 10 kg' },
  ],
};
export const staffMachines = {
  Washers: [
    { name: 'Washer 1', state: 'Running', note: '12m left' }, { name: 'Washer 2', state: 'Running', note: '24m left' },
    { name: 'Washer 3', state: 'Ready' }, { name: 'Washer 4', state: 'Maintenance' },
  ],
  Dryers: [
    { name: 'Dryer 1', state: 'High Heat', note: '15m left' }, { name: 'Dryer 2', state: 'Ready' },
    { name: 'Dryer 3', state: 'Ready' }, { name: 'Dryer 4', state: 'Ready' },
  ],
};
// Pickup & Delivery list. `type` is 'Pickup' (customer comes to the shop) or 'Delivery' (we bring it to them)
export const staffPickups = [
  { key: 1, id: '#ORD-2840', customer: 'Montrel Bautista', type: 'Pickup', schedule: 'Today, 3:00 PM', place: 'Shop counter', status: 'Ready' },
  { key: 2, id: '#ORD-2835', customer: 'Kristine Mae Lopez', type: 'Pickup', schedule: 'Today, 5:30 PM', place: 'Shop counter', status: 'Ready' },
  { key: 3, id: '#ORD-2839', customer: 'John Randolph Sayson', type: 'Delivery', schedule: 'Tomorrow, 10:00 AM', place: 'Brgy. Tigbe, Norzagaray', status: 'Scheduled' },
  { key: 4, id: '#ORD-2841', customer: 'Arianna Tayao', type: 'Delivery', schedule: 'Tomorrow, 1:00 PM', place: 'Brgy. San Mateo, Norzagaray', status: 'Scheduled' },
  { key: 5, id: '#ORD-2834', customer: 'Angelo Villanueva', type: 'Pickup', schedule: 'Oct 14, 2026', place: 'Shop counter', status: 'Picked Up' },
];
