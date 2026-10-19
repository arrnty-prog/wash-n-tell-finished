import { Card, Form, Input, Button, Row, Col, Steps, Typography } from 'antd';
import { MobileOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import { peso } from '../../utils/peso';

const digits = (v = '') => v.replace(/\D/g, '');

// Accepts 9171234567, 09171234567 or +63 917 123 4567 and shows it as "917 123 4567".
const formatMobile = (v) => {
  let d = digits(v);
  if (d.length > 10 && d.startsWith('63')) d = d.slice(2);
  else if (d.length > 10 && d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 10).replace(/^(\d{3})(\d{0,3})(\d{0,4}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '));
};

export default function GcashPayment() {
  const { total, saving, canSubmit, confirmPayment } = useOutletContext();

  const onFinish = ({ accountName, number }) =>
    confirmPayment({ status: 'paid', gcash: { accountName: accountName.trim(), number: `+63${digits(number)}` } });

  return (
    <Card title="Pay with GCash">
      <Row gutter={[32, 24]}>
        <Col xs={24} md={10}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, background: '#f8fafc' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e8f0fe', color: '#2563eb', display: 'grid', placeItems: 'center', fontSize: 20, marginBottom: 16 }}><MobileOutlined /></div>
            <div style={{ color: '#64748b', fontSize: 12 }}>Send payment to this GCash account</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 12 }}>Wash 'N Tell Laundry</div>
            <div style={{ color: '#64748b', fontSize: 12 }}>Account name</div>
            <Typography.Text copyable style={{ fontSize: 22, fontWeight: 700, display: 'block', marginTop: 12 }}>0917 123 4567</Typography.Text>
            <div style={{ color: '#64748b', fontSize: 12 }}>GCash number</div>
            <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 16, paddingTop: 16 }}>
              <div style={{ color: '#64748b', fontSize: 12 }}>Amount to pay</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#2563eb' }}>{peso(total)}</div>
            </div>
          </div>
        </Col>

        <Col xs={24} md={14}>
          <Steps direction="vertical" size="small" current={0} style={{ marginBottom: 20 }} items={[
            { title: 'Open GCash and tap Send Money' },
            { title: 'Send the exact amount to the GCash number shown' },
            { title: 'Enter the GCash details you paid from, then confirm' },
          ]} />
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="accountName" label="GCash account name" rules={[{ required: true, whitespace: true, message: 'Enter the name registered on GCash' }]}>
              <Input size="large" placeholder="Name registered on GCash" />
            </Form.Item>
            <Form.Item name="number" label="GCash number" normalize={formatMobile} rules={[{ required: true, message: 'Enter the GCash number' }, { validator: (_, v) => (/^9\d{9}$/.test(digits(v)) ? Promise.resolve() : Promise.reject('Enter a valid mobile number, e.g. 917 123 4567')) }]}>
              <Input size="large" addonBefore="+63" placeholder="9XX XXX XXXX" inputMode="numeric" />
            </Form.Item>
            <Button type="primary" size="large" block htmlType="submit" loading={saving} disabled={saving || !canSubmit}>
              Confirm GCash payment
            </Button>
          </Form>
        </Col>
      </Row>
    </Card>
  );
}
