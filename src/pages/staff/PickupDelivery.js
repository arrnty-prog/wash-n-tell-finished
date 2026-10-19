// "Schedule Delivery" opens a pop-up (components/modals/ScheduleDeliveryModal).
import { useState } from 'react';
import { Tag, Typography } from 'antd';
import TablePage from '../../components/ui/TablePage';
import StatusTag from '../../components/ui/StatusTag';
import ScheduleDeliveryModal from '../../components/modals/ScheduleDeliveryModal';
import { staffPickups } from '../../data/mock'; // TODO(backend): replace with API data

const columns = [
  { title: 'Order ID', dataIndex: 'id', render: (v) => <Typography.Text style={{ color: '#8c8c8c', fontSize: 13 }}>
          {v}
        </Typography.Text>},
  { title: 'Customer', dataIndex: 'customer' },
  { title: 'Type', dataIndex: 'type', render: (t) => <Tag color={t === 'Delivery' ? 'purple' : 'blue'} bordered={false}>{t}</Tag> },
  { title: 'Schedule', dataIndex: 'schedule' },
  { title: 'Location', dataIndex: 'place' },
  { title: 'Status', dataIndex: 'status', render: (s) => <StatusTag status={s} /> },
  { title: 'Actions', render: (_, r) => (r.status === 'Picked Up' ? null : <Typography.Link>Mark as Picked Up</Typography.Link>) }, // TODO(backend)
];

export default function PickupDelivery() {
  const [open, setOpen] = useState(false); // show/hide the Schedule Delivery pop-up
  return (
    <>
      <TablePage title="Pickup & Delivery" subtitle="Track orders ready for pickup and scheduled deliveries." actionLabel="Schedule Delivery" onAction={() => setOpen(true)} columns={columns} data={staffPickups} />
      <ScheduleDeliveryModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
