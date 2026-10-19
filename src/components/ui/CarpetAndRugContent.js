import React, { useState, useEffect } from 'react';
import { Card, InputNumber, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const CarpetAndRugContent = ({ service, setQty }) => {
  const serviceName = service.name; 
  const ratePerSqM = Number(service.rate); // Rate per sq. ft.
  const cartKey = service._id || service.id;

  // Local state for length and width inputs
  const [length, setLength] = useState(null);
  const [width, setWidth] = useState(null);

  // Calculate square footage
  const sqmt = (Number(length) || 0) * (Number(width) || 0);
  const totalCost = sqmt * ratePerSqM;

  const handleAddToCart = () => {
    if (sqmt <= 0) return;

    const cartItem = {
      _id: cartKey,
      name: `${service.name} (${length}' × ${width}')`, // e.g. Carpet and Rug Cleaning (10' × 12')
      price: ratePerSqM,
      serviceType: serviceName,
      qty: sqmt, // Quantity is treated as the total sq. ft.
      dimensions: { length, width }
    };

    // Pass to parent cart state
    setQty(cartItem, serviceName, sqmt);
  };

  return (
    <Card size="small" style={{ borderRadius: '8px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>{service.name}</div>
          <div style={{ color: '#64748b', fontSize: '12px' }}>
            ₱{ratePerSqM.toFixed(2)} per sq. m.
          </div>
        </div>

        <Space wrap>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: 2 }}>Length (ft)</div>
            <InputNumber 
              min={0} 
              value={length} 
              onChange={setLength} 
              placeholder="Length"
              style={{ width: '110px' }}
            />
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: 2 }}>Width (ft)</div>
            <InputNumber 
              min={0} 
              value={width} 
              onChange={setWidth} 
              placeholder="Width"
              style={{ width: '110px' }}
            />
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddToCart}
              disabled={sqmt <= 0}
            >
              Add to Order
            </Button>
          </div>
        </Space>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
          <span style={{ color: '#64748b' }}>Total Area: <b>{sqmt} sq. mt.</b></span>
          <span style={{ fontWeight: 600, color: '#2563eb' }}>₱{totalCost.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
};

export default CarpetAndRugContent;