import { useState } from 'react';
import { Modal, Form, Row, Col, message } from 'antd';

export function TwoCols({ left, right }) {
  return (
    <Row gutter={16}>
      <Col xs={24} sm={12}>{left}</Col>
      <Col xs={24} sm={12}>{right}</Col>
    </Row>
  );
}

export default function FormModal({ open, onClose, onSubmit, title, subtitle, okText, formName, initialValues, width = 560, children }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setSaving(true);
    try {
      await onSubmit(values);
      message.success('Saved');
      form.resetFields();
      onClose();
    } catch (err) {
      console.log('save failed:', err);
      message.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={saving}
      okText={okText}
      cancelText="Cancel"
      centered
      width={width}
      destroyOnHidden
      title={
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{title}</div>
          <div style={{ fontSize: 13, fontWeight: 400, color: '#64748b' }}>{subtitle}</div>
        </div>
      }
    >
      <Form form={form} name={formName} initialValues={initialValues} layout="vertical" requiredMark={false} style={{ marginTop: 20 }}>
        {children}
      </Form>
    </Modal>
  );
}