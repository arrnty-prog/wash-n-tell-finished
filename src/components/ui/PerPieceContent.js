import React from 'react';
import { Button, Empty, InputNumber } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import itemButton from './itemButton';

const PerPieceContent = ({ priceKey, serviceName, items, orderCart, setQty }) => {
  const list = items
    .filter((item) => item.prices?.[priceKey] !== undefined)
    .map((item) => ({
      id: `${priceKey}-${item._id}`,
      itemId: item._id,
      serviceKey: priceKey,
      serviceName,
      name: item.name,
      icon: item.icon,
      price: item.prices[priceKey],
      unit: 'pc',
    }));

  if (list.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No items available for this service" />;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16, padding: 8 }}>
      {list.map((item) => {
        const qty = orderCart[item.id]?.qty || 0;
        return (
          <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            {itemButton(item, qty > 0, () => setQty(item, qty + 1))}

            {qty > 0 && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  marginTop: 10, padding: '6px 8px', borderRadius: 12,
                  background: '#f0f7ff', border: '1px solid #cfe2ff',
                }}
              >
                <Button
                  shape="circle"
                  size="small"
                  icon={<MinusOutlined />}
                  onClick={() => setQty(item, qty - 1)}
                />
                <InputNumber
                    className="qty-input"
                    min={0}
                    max={50}
                    value={qty}
                    controls={false}
                    onChange={(v) => setQty(item, v ?? 0)}
                    style={{ flex: 1, minWidth: 0 }}
                  />
                <Button
                  type="primary"
                  shape="circle"
                  size="small"
                  icon={<PlusOutlined />}
                  disabled={qty >= 99}
                  onClick={() => setQty(item, qty + 1)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PerPieceContent;