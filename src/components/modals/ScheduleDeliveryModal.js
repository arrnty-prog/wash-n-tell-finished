// `type` = 'Pickup' (customer collects at the shop) or 'Delivery' (we bring it to the customer).
import { Form, Select, DatePicker, TimePicker, Input } from 'antd';
import FormModal, { TwoCols } from '../ui/FormModal';
import { staffOrders } from '../../data/mock'; // TODO(backend): load only the orders that can still be picked up or delivered

export default function ScheduleDeliveryModal({ open, onClose }) {
  return (
    <FormModal open={open} onClose={onClose} formName="scheduleDelivery" initialValues={{ type: 'Delivery' }} title="Schedule Delivery" subtitle="Set a pickup or delivery time for an order." okText="Save Schedule">
      <Form.Item name="order" label="Order">
        <Select placeholder="Select an order" options={staffOrders.map((o) => ({ value: o.id, label: `${o.id} — ${o.customer}` }))} />
      </Form.Item>
      <TwoCols
        left={<Form.Item name="type" label="Type"><Select options={['Pickup', 'Delivery'].map((v) => ({ value: v, label: v }))} /></Form.Item>}
        right={<Form.Item name="location" label="Location"><Input placeholder="Shop counter or customer address" /></Form.Item>}
      />
      <TwoCols
        left={<Form.Item name="date" label="Date"><DatePicker style={{ width: '100%' }} /></Form.Item>}
        right={<Form.Item name="time" label="Time"><TimePicker use12Hours format="h:mm A" style={{ width: '100%' }} /></Form.Item>}
      />
      <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} placeholder="e.g. Text the customer before arriving." /></Form.Item>
    </FormModal>
  );
}
