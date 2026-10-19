// Pop-up for "+ Add Item" (item = null) and the row's Edit button (item = the row).
// The stock number is NOT edited here (use the Update Stock pop-up so every change is logged with a reason).
import axios from 'axios';
import { Form, Input, InputNumber, Select, Button, Space, Typography } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import FormModal, { TwoCols } from '../ui/FormModal';

const API = 'http://localhost:8000';
const CATEGORIES = ['Cleaning Supplies', 'Dry Cleaning Supplies', 'Packaging', 'Other'].map((c) => ({ value: c, label: c }));
const UNITS = ['Liters', 'Gallons', 'Kg', 'Pcs'].map((u) => ({ value: u, label: u }));

// What an order can use supplies for. The text in brackets is what the amount is "per".
const USED_FOR = [
  { value: 'wash_and_fold', label: 'Wash and Fold (per kg)' },
  { value: 'dry_clean', label: 'Dry Cleaning (per piece)' },
  { value: 'iron', label: 'Ironing (per piece)' },
  { value: 'wash_and_iron', label: 'Wash and Iron (per piece)' },
  { value: 'carpet', label: 'Carpet Cleaning (per sq m)' },
  { value: 'order', label: 'Every order (once per order)' },
];

export default function InventoryItemModal({ open, item, onClose, onSaved }) {
  const editing = !!item;

  const save = async (values) => {
    const headers = { 'x-user-id': JSON.parse(localStorage.getItem('user'))?.id };
    const body = { ...values, usage: values.usage || [] };
    if (editing) await axios.put(`${API}/inventory/${item._id}`, body, { headers });
    else await axios.post(`${API}/inventory`, body, { headers });
    onSaved?.();
  };

  const initialValues = editing
    ? { name: item.name, brand: item.brand, category: item.category, unit: item.unit, minimum: item.minimum, usage: item.usage }
    : { category: 'Cleaning Supplies', unit: 'Liters', quantity: 0, minimum: 0, usage: [] };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={save}
      formName="inventoryItem"
      initialValues={initialValues}
      width={640}
      title={editing ? 'Edit Item' : 'Add New Item'}
      subtitle={editing ? 'Change the details, minimum level or automatic usage.' : 'Add a new supply to the inventory.'}
      okText={editing ? 'Save Changes' : 'Add Item'}
    >
      <TwoCols
        left={<Form.Item name="name" label="Item Name" rules={[{ required: true, message: 'Enter the item name' }]}><Input placeholder="e.g. Liquid Detergent" maxLength={80} /></Form.Item>}
        right={<Form.Item name="brand" label="Brand"><Input placeholder="e.g. Ariel, Downy" maxLength={60} /></Form.Item>}
      />
      <TwoCols
        left={<Form.Item name="category" label="Category"><Select options={CATEGORIES} /></Form.Item>}
        right={<Form.Item name="unit" label="Unit"><Select options={UNITS} /></Form.Item>}
      />
      <TwoCols
        left={editing
          ? <Form.Item label="Current Quantity"><Input disabled value={`${item.quantity} ${item.unit} (use Update Stock to change)`} /></Form.Item>
          : <Form.Item name="quantity" label="Current Quantity" rules={[{ required: true, message: 'Enter the quantity' }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>}
        right={<Form.Item name="minimum" label="Minimum Required" extra="Below this it shows as Low Stock."><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>}
      />

      <div style={{ fontWeight: 600, marginBottom: 4 }}>Automatic usage</div>
      <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
        Stock goes down by this amount (in the item's unit) every time an order includes that service. Leave empty if it is only used up manually.
      </Typography.Paragraph>
      <Form.List name="usage">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...rest }) => (
              <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                <Form.Item {...rest} name={[name, 'service']} rules={[{ required: true, message: 'Choose what it is used for' }]} style={{ marginBottom: 0 }}>
                  <Select placeholder="Used for..." style={{ width: 280 }} options={USED_FOR} />
                </Form.Item>
                <Form.Item {...rest} name={[name, 'amount']} rules={[{ required: true, message: 'Amount' }]} style={{ marginBottom: 0 }}>
                  <InputNumber min={0.001} max={1000} step={0.01} placeholder="Amount" style={{ width: 120 }} />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#94a3b8' }} />
              </Space>
            ))}
            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>Add usage rule</Button>
          </>
        )}
      </Form.List>
    </FormModal>
  );
}
