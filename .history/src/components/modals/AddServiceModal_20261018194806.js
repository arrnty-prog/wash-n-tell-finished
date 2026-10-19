import { Form, Input, InputNumber, Select } from 'antd';
import FormModal, { TwoCols } from '../ui/FormModal';

export default function AddServiceModal({ open, onClose }) {
  return (
    <FormModal open={open} onClose={onClose} formName="addService" initialValues={{ category: 'Standard', chargedPer: 'kg' }} title="Create New Service" subtitle="Add a service and its pricing to the shop menu." okText="Create Service">
      <Form.Item name="serviceName" label="Service Name"><Input placeholder="e.g. Comforter Wash" /></Form.Item>
      <TwoCols
        // Category decides which section the card appears in on the page (Standard / Add-ons & Premium)
        left={<Form.Item name="category" label="Category"><Select options={[{ value: 'Standard', label: 'Standard' }, { value: 'Add-on', label: 'Add-on' }]} /></Form.Item>}
        right={<Form.Item name="turnaround" label="Est. Turnaround"><Input placeholder="24 Hours" /></Form.Item>}
      />
      <TwoCols
        left={<Form.Item name="basePrice" label="Base Price (₱)"><InputNumber placeholder="60" style={{ width: '100%' }} /></Form.Item>}
        // "Charged Per" is the unit shown next to the price on the card (e.g. ₱50 / kg)
        right={<Form.Item name="chargedPer" label="Charged Per"><Select options={['kg', 'item', 'wash'].map((u) => ({ value: u, label: u }))} /></Form.Item>}
      />
      <Form.Item name="description" label="Description"><Input.TextArea rows={3} placeholder="Short description of the service." /></Form.Item>
    </FormModal>
  );
}
