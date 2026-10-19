import { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Form, Input, Space, message } from 'antd';

const digits = (v = '') => v.replace(/\D/g, '');

// Accepts 9171234567, 09171234567 or +63 917 123 4567 and shows it as "917 123 4567".
const formatMobile = (v) => {
  let d = digits(v);
  if (d.length > 10 && d.startsWith('63')) d = d.slice(2);
  else if (d.length > 10 && d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 10).replace(/^(\d{3})(\d{0,3})(\d{0,4}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '));
};


export default function EditCustomerModal({ customer, onClose, onSaved }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // Fill the form whenever a different customer is picked
  useEffect(() => {
    if (customer) {
      form.setFieldsValue({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      });
    }
  }, [customer, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const user = JSON.parse(localStorage.getItem('user'));
      await axios.put(
        `http://localhost:8000/accounts/${customer.key}`,
        values,
        { headers: { 'x-user-id': user?.id } }
      );

      message.success('Customer updated');
      onSaved();
      onClose();
    } catch (err) {
      if (err.errorFields) return; // validation error, the form shows it
      message.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`Edit ${customer?.name ?? 'customer'}`}
      open={!!customer}
      onOk={handleOk}
      onCancel={onClose}
      okText="Save changes"
      confirmLoading={saving}
      forceRender
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Space style={{ display: 'flex' }} size={12}>
          <Form.Item name="firstName" label="First name" rules={[{ required: true, message: 'Please enter first name' }]} style={{ flex: 1 }}>
            <Input placeholder='Enter first name'/>
          </Form.Item>
          <Form.Item name="lastName" label="Last name" rules={[{ required: true, message: 'Please enter last name'  }]} style={{ flex: 1 }}>
            <Input placeholder='Enter last name' />
          </Form.Item>
        </Space>

        <Form.Item name="email" label="Email" rules={[{ required: true , message: 'Please enter a valid email' }, { type: 'email' }]}>
          <Input placeholder='example@domain.com' />
        </Form.Item>
         <Form.Item name="phone" label="Mobile Number" normalize={formatMobile} labelStyle={{ fontWeight: 'bold' }} rules={[{ required: true, message: 'Please enter a valid mobile number' }, { validator: (_, v) => (/^9\d{9}$/.test(digits(v)) ? Promise.resolve() : Promise.reject('Enter a valid mobile number, e.g. 917 123 4567')) }]}>
                            <Input size="large" addonBefore="+63" placeholder="9XX XXX XXXX" inputMode="numeric" />
                          </Form.Item>
              
         <Form.Item name="address" label="Address" rules={[{ required: true , message: 'Please enter an address' }]}>
          <Input placeholder='Enter address' />
        </Form.Item>
      </Form>
    </Modal>
  );
}