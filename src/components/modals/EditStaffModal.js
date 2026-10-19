import { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Form, Input, Space, message } from 'antd';

export default function EditStaffModal({ account, onClose, onSaved }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (account) {
      form.setFieldsValue({
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        phone: account.phone,
        position: account.position,
      });
    }
  }, [account, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.put(`http://localhost:8000/accounts/${account.key}`, values, {
        headers: { 'x-user-id': user?.id },
      });
      message.success('Account updated');
      onSaved();
      onClose();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`Edit ${account?.name ?? 'account'}`}
      open={!!account}
      onOk={handleOk}
      onCancel={onClose}
      okText="Save changes"
      confirmLoading={saving}
      forceRender
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Space style={{ display: 'flex' }} size={12}>
          <Form.Item name="firstName" label="First name" rules={[{ required: true }]} style={{ flex: 1 }}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last name" rules={[{ required: true }]} style={{ flex: 1 }}>
            <Input />
          </Form.Item>
        </Space>
        <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}