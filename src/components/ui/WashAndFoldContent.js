import React, { useState } from 'react';
import { InputNumber, Button, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const PRESETS = [1, 3, 5, 7, 10];

const label = { color: '#64748b', fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10 };
const row = { display: 'flex', justifyContent: 'space-between', color: '#64748b', padding: '4px 0' };

const WashAndFoldContent = ({ service, onAdd }) => {
  const [quantity, setQuantity] = useState(1);
  const rate = Number(service.rate || 0);
  const total = rate * (quantity || 0);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, padding: 8 }}>
      {/* Weight picker */}
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={label}>Weight</div>
        <InputNumber
          min={1}
          max={15}
          value={quantity}
          onChange={(v) => setQuantity(v)}
          size="large"
          addonAfter="kg"
          style={{ width: '100%' }}
        />

        <div style={{ ...label, marginTop: 20 }}>Quick select</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PRESETS.map((kg) => (
            <Button
              key={kg}
              type={quantity === kg ? 'primary' : 'default'}
              shape="round"
              onClick={() => setQuantity(kg)}
            >
              {kg} kg
            </Button>
          ))}
        </div>
      </div>

      {/* Price summary */}
      <div style={{ flex: 1, minWidth: 240, background: '#f0f7ff', border: '1px solid #cfe2ff', borderRadius: 16, padding: 20 }}>
        <div style={row}><span>Rate</span><span>₱{rate.toFixed(2)} / kg</span></div>
        <div style={row}><span>Weight</span><span>{quantity || 0} kg</span></div>

        <Divider style={{ margin: '10px 0', borderColor: '#cfe2ff' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>Line total</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#2563eb' }}>₱{total.toFixed(2)}</span>
        </div>

        <Button
          type="primary"
          size="large"
          block
          icon={<PlusOutlined />}
          disabled={!quantity}
          style={{ marginTop: 16, borderRadius: 10, height: 46, fontWeight: 600 }}
          onClick={() =>
            onAdd({
              id: 'wash_and_fold',
              name: 'Wash and Fold',
              serviceName: service.name,
              price: rate,
              unit: 'kg',
              qty: quantity,
            })
          }
        >
          Add to Order
        </Button>
      </div>
    </div>
  );
};

export default WashAndFoldContent;