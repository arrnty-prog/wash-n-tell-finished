import { useState } from 'react';
import { Card, Button, InputNumber, Alert } from 'antd';
import { useOutletContext } from 'react-router-dom';
import { WalletOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { peso } from '../../utils/peso';

const cardStyle = { borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' };
const headerStyle = { borderBottom: '1px solid #f1f5f9', fontSize: 16, fontWeight: 700 };
const iconBadge = {
  width: 30, height: 30, borderRadius: 8, color: '#fff', fontSize: 15,
  display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#38bdf8,#2563eb)',
};
const label = { display: 'block', marginBottom: 8, color: '#64748b', fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' };

const QUICK_AMOUNTS = [400, 500, 1000];

export default function CashPayment() {
  const { showCashReceived, total, saving, canSubmit, confirmPayment } = useOutletContext();
  const [cashReceived, setCashReceived] = useState(null);

  const received = cashReceived || 0;
  const change = Math.round((received - total) * 100) / 100;
  const enough = Math.round(received * 100) >= Math.round(total * 100);

  const handleConfirm = () =>
    confirmPayment(
      showCashReceived
        ? { status: 'paid', cashReceived: received, change }
        : { status: 'paid' }
    );

  // Quick buttons: exact amount + any preset that covers the total
  const quick = [
    { key: 'exact', text: 'Exact amount', value: total },
    ...QUICK_AMOUNTS.filter((a) => a >= total && a !== total).map((a) => ({ key: a, text: peso(a), value: a })),
  ];

  return (
    <Card
      style={cardStyle}
      styles={{ header: headerStyle, body: { padding: 24 } }}
      title={<span style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#0f172a' }}><span style={iconBadge}><WalletOutlined /></span>Cash payment</span>}
    >
      {/* Amount due */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 20px', marginBottom: 24, borderRadius: 14,
        background: 'linear-gradient(135deg,#38bdf8,#2563eb)', color: '#fff',
      }}>
        <span style={{ fontWeight: 600, opacity: 0.9 }}>Amount due</span>
        <b style={{ fontSize: 28, fontWeight: 800 }}>{peso(total)}</b>
      </div>

      {showCashReceived ? (
        <>
          <label htmlFor="cash-received" style={label}>Cash received</label>
          <InputNumber
            id="cash-received"
            size="large"
            style={{ width: '100%' }}
            prefix="₱"
            controls={false}
            placeholder="0.00"
            min={0}
            precision={2}
            value={cashReceived}
            onChange={(v) => setCashReceived(v)}
          />

          {/* Quick amounts */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {quick.map((q) => (
              <Button
                key={q.key}
                shape="round"
                type={received === q.value ? 'primary' : 'default'}
                onClick={() => setCashReceived(q.value)}
              >
                {q.text}
              </Button>
            ))}
          </div>

          {/* Change / still needed */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            margin: '24px 0 20px', padding: '16px 20px', borderRadius: 14,
            background: received === 0 ? '#f8fafc' : enough ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${received === 0 ? '#e2e8f0' : enough ? '#bbf7d0' : '#fecaca'}`,
          }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>
              {received > 0 && !enough ? 'Still needed' : 'Change to give'}
            </span>
            <b style={{ fontSize: 26, fontWeight: 800, color: received === 0 ? '#94a3b8' : enough ? '#16a34a' : '#dc2626' }}>
              {peso(enough ? change : Math.max(total - received, 0))}
            </b>
          </div>
        </>
      ) : (
        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 24, borderRadius: 12 }}
          message="Pay in cash when your laundry is picked up or delivered."
        />
      )}

      <Button
        type="primary"
        size="large"
        block
        icon={<CheckCircleOutlined />}
        loading={saving}
        disabled={saving || !canSubmit || (showCashReceived && !enough)}
        onClick={handleConfirm}
        style={{ height: 48, borderRadius: 10, fontWeight: 600 }}
      >
        Confirm cash payment
      </Button>
    </Card>
  );
}