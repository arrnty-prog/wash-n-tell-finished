import axios from 'axios';
import { Form, Input, InputNumber, Radio } from 'antd';
import FormModal from '../ui/FormModal';

const API = 'http://localhost:8000';
const fmt = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 3 });

export default function AdjustStockModal({ item, onClose, onSaved }) {
  const save = async (values) => {
    const headers = { 'x-user-id': JSON.parse(localStorage.getItem('user'))?.id };
    await axios.post(`${API}/inventory/${item._id}/adjust`, values, { headers });
    onSaved?.();
  };

  return (
    <FormModal
      open={!!item}
      onClose={onClose}
      onSubmit={save}
      formName="adjustStock"
      initialValues={{ type: 'restock' }}
      title={`Update Stock${item ? ` - ${item.name}` : ''}`}
      subtitle={item ? `Right now: ${fmt(item.quantity)} ${item.unit} in stock` : ''}
      okText="Save"
    >
      <Form.Item name="type" label="What happened?">
        <Radio.Group
          optionType="button"
          buttonStyle="solid"
          options={[
            { value: 'restock', label: 'Restock (add)' },
            { value: 'use', label: 'Used / removed' },
            { value: 'set', label: 'Set counted amount' },
          ]}
        />
      </Form.Item>
      <Form.Item name="quantity" label={`Quantity (${item?.unit || ''})`} rules={[{ required: true, message: 'Enter a quantity' }]}>
        <InputNumber min={0} step={1} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="note" label="Reason / note (shown in Action History)">
        <Input.TextArea rows={2} maxLength={200} placeholder="e.g. Supplier delivery, spilled, Sunday count" />
      </Form.Item>
    </FormModal>
  );
}
