import { Row, Col, Card, Segmented, Button, Checkbox, Divider, Tag, Alert, message } from 'antd';
import { ArrowLeftOutlined, CreditCardOutlined, MobileOutlined, WalletOutlined, UserOutlined} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import React, {useState} from 'react'
import axios from 'axios'
import { useOrderDraft, getTotals } from '../../context/OrderContext';

const row = { display: 'flex', justifyContent: 'space-between', marginBottom: 8 };

const METHODS = [
  { value: 'card', label: <span><CreditCardOutlined /> &nbsp;Card</span> },
  { value: 'gcash', label: <span><MobileOutlined /> &nbsp;GCash</span> },
  { value: 'cash', label: <span><WalletOutlined /> &nbsp;Cash</span> },
];

export default function PaymentLayout({ showCashReceived = true }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const method = pathname.match(/\/payment\/([^/]+)/)?.[1]; // 'card' | 'gcash' | 'cash' | 'success'
  const base = pathname.replace(/\/payment\/.*$/, '/payment');

  const { draft, clearDraft } = useOrderDraft();
  const [saving, setSaving] = useState(false);

  const cartItems = Object.values(draft.orderCart);
  const { subtotal, deliveryFee, taxAmount, total } = getTotals(draft);
  const canSubmit = cartItems.length > 0 && !!draft.customerId;

  const confirmPayment = async (paymentDetails = {}) => {
    if (saving) return false;
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await axios.post('http://localhost:8000/orders', {
        customer: draft.customerId,
        items: cartItems,
        fulfillment: {
          type: draft.fulfillment,
          address: draft.customerDetails?.address,
          scheduledDate: draft.scheduledDate,
        },
        payment: { method, ...paymentDetails },
      }, { headers: { 'x-user-id': user?.id } });
      navigate(`${base}/success`, { replace: true, state: { order: res.data } });
      clearDraft();
      return true;
    } catch (err) {
      message.error(err.response?.data?.error || 'Payment failed. Your order was not saved.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const outletContext = { showCashReceived, total, saving, canSubmit, confirmPayment };

  if (method === 'success') {
    return <div className="page-content"><Outlet context={outletContext} /></div>;
  }

  return (
    <div className="page-content">
      <div className="page-head">
        <div>
          <Button type="link" icon={<ArrowLeftOutlined />} style={{ padding: 0, height: 'auto', marginBottom: 6 }} onClick={() => navigate(-1)}>Back to Order</Button>
          <h2>Payment</h2>
          <span style={{ color: '#64748b' }}>Choose a payment method, then confirm.</span>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 12 } }}>
            <Segmented block size="large" value={method} options={METHODS} onChange={(m) => navigate(`${base}/${m}`)} />
          </Card>
          {!canSubmit && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message="This order draft is empty or has no customer. Go back to the order to add them."
            />
          )}
          <Outlet context={outletContext} />
        </Col>

        <Col xs={24} xl={8}>
  <Card
    title="Order Draft Summary"
    style={{ borderRadius: 8, position: 'sticky', top: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
  >
    {/* Customer */}
    <div style={{ marginBottom: 16 }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Customer
      </h4>

      {draft.customerDetails ? (
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: '600', fontSize: '15px', color: '#0f172a' }}>
            <UserOutlined style={{ marginRight: 6, color: '#2563eb' }} />
            {draft.customerDetails.firstName} {draft.customerDetails.lastName}
          </div>
        </div>
      ) : (
        <div style={{ background: '#fff3f3', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ff8f8f' }}>
          <Tag color="error" style={{ margin: 0 }}>No Customer Selected</Tag>
        </div>
      )}
    </div>

    <Divider style={{ margin: '12px 0' }} />

    {/* Order items */}
    <h4 style={{ margin: '0 0 12px 0', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      Order Items
    </h4>

    {cartItems.map((cartItem) => (
      <div key={cartItem.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <strong style={{ fontSize: '14px', display: 'block' }}>{cartItem.name}</strong>
          <span style={{ color: '#64748b', fontSize: '12px' }}>
            {cartItem.serviceName && `(${cartItem.serviceName}) `}
            ₱{Number(cartItem.price || 0).toFixed(2)} × {cartItem.qty} {cartItem.unit}
          </span>
        </div>
        <span style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
          ₱{(Number(cartItem.price || 0) * cartItem.qty).toFixed(2)}
        </span>
      </div>
    ))}

    <Divider style={{ margin: '12px 0' }} />

    {/* Totals */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
        <span>Subtotal:</span>
        <span>₱{subtotal.toFixed(2)}</span>
      </div>

      {deliveryFee > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
          <span>Delivery fee:</span>
          <span>₱{deliveryFee.toFixed(2)}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
        <span>VAT (12%):</span>
        <span>₱{taxAmount.toFixed(2)}</span>
      </div>

      <Divider style={{ margin: '6px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
        <span>Total Due:</span>
        <span style={{ color: '#2563eb', fontSize: '18px' }}>₱{total.toFixed(2)}</span>
      </div>
    </div>
  </Card>
</Col>
      </Row>
    </div>
  );
}
