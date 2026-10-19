import { Card, Form, Input, Button, Row, Col, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import { peso } from '../../utils/peso';

const digits = (v = '') => v.replace(/\D/g, '');
const formatCardNumber = (v) => digits(v).slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (v) => {
  const d = digits(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

const validCardNumber = (_, v) =>
  digits(v).length >= 13 ? Promise.resolve() : Promise.reject('Enter the full card number');

const validExpiry = (_, v) => {
  const m = /^(\d{2})\/(\d{2})$/.exec(v || '');
  if (!m) return Promise.reject('Use MM/YY');
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return Promise.reject('Invalid month');
  // A card is good through the last day of its expiry month.
  if (new Date(year, month, 1) <= new Date()) return Promise.reject('This card has expired');
  return Promise.resolve();
};

export default function CardPayment() {
  const { total, saving, canSubmit, confirmPayment } = useOutletContext();

  // Only the last 4 digits ever leave this form. The full number, expiry and CVV are not sent or stored.
  const onFinish = ({ cardNumber }) =>
    confirmPayment({ status: 'paid', card: { last4: digits(cardNumber).slice(-4) } });

  return (
    <Card title="Card details" extra={
      <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <svg width="30" height="20" viewBox="0 0 30 20" aria-label="Mastercard"><circle cx="11" cy="10" r="9" fill="#eb001b" /><circle cx="19" cy="10" r="9" fill="#f79e1b" fillOpacity=".9" /></svg>
        <span style={{ fontWeight: 800, fontStyle: 'italic', fontSize: 16, color: '#1a1f71' }}>VISA</span>
      </span>
    }>
      <Form layout="vertical" onFinish={onFinish} requiredMark>
        <Form.Item name="name" label="Name on card" rules={[{ required: true, whitespace: true, message: 'Enter the name on the card' }]}>
          <Input size="large" placeholder="As printed on the card" autoComplete="cc-name" />
        </Form.Item>
        <Form.Item name="cardNumber" label="Card number" normalize={formatCardNumber} rules={[{ required: true, message: 'Enter the card number' }, { validator: validCardNumber }]}>
          <Input size="large" placeholder="0000 0000 0000 0000" inputMode="numeric" autoComplete="cc-number" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="expiry" label="Expiration date" normalize={formatExpiry} rules={[{ required: true, message: 'Enter the expiry date' }, { validator: validExpiry }]}>
              <Input size="large" placeholder="MM/YY" inputMode="numeric" autoComplete="cc-exp" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="cvv" label="CVV" normalize={(v) => digits(v).slice(0, 4)} rules={[{ required: true, message: 'Enter the CVV' }, { pattern: /^\d{3,4}$/, message: '3 or 4 digits' }]}>
              <Input.Password size="large" placeholder="•••" inputMode="numeric" autoComplete="cc-csc" />
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" size="large" block htmlType="submit" icon={<LockOutlined />} loading={saving} disabled={saving || !canSubmit}>
          Pay {peso(total)}
        </Button>
        <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12, marginBottom: 0 }}>
          Only the last 4 digits of the card are kept with this order.
        </Typography.Paragraph>
      </Form>
    </Card>
  );
}
