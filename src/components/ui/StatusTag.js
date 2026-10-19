import { Tag } from 'antd';

const COLORS = {
  Active: 'green', Paid: 'green', Ready: 'green', Regular: 'default', 'In Stock': 'green',
  'In Progress': 'blue', Drying: 'gold', Inactive: 'default', Failed: 'red', Refunded: 'red', Pending: 'orange', 'Low Stock': 'red', 'Out of Stock': 'red',


  Received: 'default', Washing: 'blue', Folding: 'purple', Unpaid: 'purple', Scheduled: 'cyan', 'Picked Up': 'default',
};

export default function StatusTag({ status }) {
  return <Tag color={COLORS[status] || 'default'}>{status}</Tag>;
}
