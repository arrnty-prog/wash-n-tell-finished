// Pop-up for the "+ Restock Item" 
import { Form, Input, InputNumber, Select } from 'antd';
import FormModal, { TwoCols } from '../ui/FormModal';

export default function RestockItemModal({ open, onClose }) {
  return (
    <FormModal open={open} onClose={onClose} formName="restockItem" initialValues={{ category: 'Cleaning Supplies', unit: 'Gallons' }} title="Add New Item" subtitle="Add a new supply to the inventory." okText="Add Item">
      <TwoCols
        left={<Form.Item name="itemName" label="Item Name"><Input placeholder="e.g. Liquid Detergent" /></Form.Item>}
        right={<Form.Item name="brand" label="Brand"><Input placeholder="e.g. Surf, Ariel, Downy" /></Form.Item>}
      />
      <TwoCols
        left={<Form.Item name="category" label="Category"><Select options={['Cleaning Supplies', 'Packaging'].map((c) => ({ value: c, label: c }))} /></Form.Item>}
        right={<Form.Item name="unit" label="Unit"><Select options={['Gallons', 'Units'].map((u) => ({ value: u, label: u }))} /></Form.Item>}
      />
      <TwoCols
        left={<Form.Item name="quantity" label="Current Quantity"><InputNumber placeholder="20" style={{ width: '100%' }} /></Form.Item>}
        // Minimum Required drives the LOW STOCK status in the inventory table (level < minimum)
        right={<Form.Item name="minimum" label="Minimum Required"><InputNumber placeholder="10" style={{ width: '100%' }} /></Form.Item>}
      />
    </FormModal>
  );
}
