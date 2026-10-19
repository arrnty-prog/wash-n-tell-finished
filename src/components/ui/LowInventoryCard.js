import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Empty, Tag, Button } from 'antd';
import { Link } from 'react-router-dom';

const API = 'http://localhost:8000';
const fmt = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 3 });

export const isOut = (i) => i.quantity <= 0;
export const isLow = (i) => i.quantity < i.minimum;

export function useLowInventory() {
  const [low, setLow] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    axios
      .get(`${API}/inventory`, { headers: { 'x-user-id': user?.id } })
      .then((res) => setLow(res.data.filter(isLow).sort((a, b) => a.quantity - b.quantity)))
      .catch((err) => console.error('Error fetching inventory:', err))
      .finally(() => setLoading(false));
  }, []);

  return { low, loading };
}

const cardStyle = { borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' };
const headerStyle = { borderBottom: '1px solid #f1f5f9', fontSize: 16, fontWeight: 700 };

export default function LowInventoryCard({ low, loading, role }) {
  return (
    <Card
      title="Low Inventory Alerts"
      loading={loading}
      style={cardStyle}
      styles={{ header: headerStyle }}
      extra={<Link to={`/${role}/inventory`}><Button type="link" size="small">View inventory</Button></Link>}
    >
      {low.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="All stocked up" />
      ) : (
        low.map((i) => (
          <div
            key={i._id}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
              padding: '10px 14px', marginBottom: 8, borderRadius: 12,
              background: isOut(i) ? '#fef2f2' : '#fff7ed',
              border: `1px solid ${isOut(i) ? '#fecaca' : '#fed7aa'}`,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <b style={{ color: '#0f172a' }}>{i.name}</b>
              {i.brand && <div style={{ fontSize: 12, color: '#94a3b8' }}>{i.brand}</div>}
            </div>
            <Tag color={isOut(i) ? 'red' : 'orange'} style={{ margin: 0 }}>
              {isOut(i) ? 'Out of stock' : `${fmt(i.quantity)} ${i.unit} left`}
            </Tag>
          </div>
        ))
      )}
    </Card>
  );
}
