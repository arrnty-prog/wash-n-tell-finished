// The customer and service lists come from the same data as Customer Management and Service & Pricing.
import { Form, Select, InputNumber } from 'antd';
import FormModal, { TwoCols } from '../ui/FormModal';
import { staffCustomers, services } from '../../data/mock'; // TODO(backend): load customers and services from the API

export default function AddOrderModal({ open, onClose }) {
  return (
    <FormModal open={open} onClose={onClose} formName="addOrder" initialValues={{ service: 'Wash & Fold', method: 'Cash', status: 'Unpaid' }} title="Add New Order" subtitle="Add another laundry order to the queue." okText="Add Order">
      <Form.Item name="customer" label="Customer">
        <Select placeholder="Select a customer" options={staffCustomers.map((c) => ({ value: c.name, label: `${c.name} — ${c.phone}` }))} />
      </Form.Item>
      <TwoCols
        // Same names as the admin Service & Pricing page
        left={<Form.Item name="service" label="Service"><Select options={services.map((s) => ({ value: s.name, label: s.name }))} /></Form.Item>}
        right={<Form.Item name="weight" label="Weight (kg)"><InputNumber min={1} placeholder="5" style={{ width: '100%' }} /></Form.Item>}
      />
      <TwoCols
        left={<Form.Item name="method" label="Payment Method"><Select options={['Cash', 'GCash', 'Card'].map((v) => ({ value: v, label: v }))} /></Form.Item>}
        right={<Form.Item name="status" label="Payment Status"><Select options={['Unpaid', 'Paid'].map((v) => ({ value: v, label: v }))} /></Form.Item>}
      />
    </FormModal>
  );
}
