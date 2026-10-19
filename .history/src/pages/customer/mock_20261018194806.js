export const customerUser = { firstName: 'Maria', lastName: 'Santos', email: 'maria.santos@gmail.com', phone: '+63 917 555 0142', address: 'Blk 4 Lot 12, Sampaguita St., Brgy. San Mateo, Norzagaray, Bulacan' };

// Home: promo banner + shop info under the 3 cards
export const customerPromo = 'Get 10% off your next Wash & Fold order. Use code FRESH10.';
export const shopInfo = {
  prices: [['Wash and fold', '₱50/kg'], ['Ironing', '₱30/pc'], ['Dry clean', '₱120/pc']],
  hours: [['Mon - Sat', '8:00 AM - 8:00 PM'], ['Sunday', '9:00 AM - 5:00 PM']],
  contact: ['0917 123 4567', 'Brgy. Tigbe, Norzagaray, Bulacan'],
};

// New Order: same shape as staffOrderDraft in data/mock.js (no VIP discount line)
export const customerOrderDraft = {
  service: { name: 'Wash & Fold', rate: '₱60.00 / kg • 24 Hours', qty: 5, unit: 'kg' },
  line: { label: 'Wash & Fold (5 kg)', amount: '₱300.00' },
  addons: [
    { name: 'Express Service', price: '+₱80.00', checked: false },
    { name: 'Premium Softener', price: '+₱15.00', checked: true },
  ],
  summary: [['Weight Total', '5 kg'], ['Dry-clean Items', '0'], ['Items Total', '₱315.00'], ['Tax (12% VAT)', '₱37.80']],
  total: '₱352.80',
};

// My Orders: the 5 stages in the progress bar
export const ORDER_STEPS = ['Picked up', 'Washing', 'Drying', 'Folding', 'Delivery'];

// My Orders: active orders. `step` = index of the current stage in ORDER_STEPS (-1 = not started).
export const activeOrders = [
  {
    key: 1, id: '#1042', services: 'Wash and Fold, Dry Clean', status: 'In Progress', step: 1, ready: 'Oct 17, 2026', total: 650, payment: 'Paid',
    history: [
      { done: true, time: 'Oct 15, 9:00 AM', label: 'Order placed' },
      { done: true, time: 'Oct 15, 10:30 AM', label: 'Picked up' },
      { done: true, time: 'Oct 15, 1:00 PM', label: 'Washing' },
      { done: false, label: 'Drying, Folding, Delivery' },
    ],
    lines: [
      { name: 'Wash and fold, 5 kg', note: 'Washing', amount: 250 },
      { name: 'Dry clean, 3 pcs', note: 'Picked up', amount: 360 },
      { name: 'Pickup fee', amount: 20 },
      { name: 'Delivery fee', amount: 20 },
    ],
    address: 'Blk 4 Lot 12, Sampaguita St., Brgy. San Mateo, Norzagaray, Bulacan',
    notes: 'Please call before arriving.',
  },
  {
    key: 2, id: '#1045', services: 'Dry Clean - 3 pcs', status: 'Pending', step: -1, ready: 'Oct 20, 2026', total: 360, payment: 'Unpaid',
    history: [{ done: true, time: 'Oct 18, 8:15 AM', label: 'Order placed' }],
    lines: [{ name: 'Dry clean, 3 pcs', amount: 360 }],
    address: 'Pickup at the shop counter',
    notes: '',
  },
];

// My Orders: completed orders
export const pastOrders = [
  { key: 1, id: '#1038', date: 'Oct 08, 2026', service: 'Wash and Fold + 1 more', amount: 480, status: 'Completed' },
  { key: 2, id: '#1031', date: 'Sep 30, 2026', service: 'Ironing', amount: 150, status: 'Completed' },
];
