import { Card } from 'antd';

export default function StatCard({ title, value, prefix, icon, color = '#2563eb' }) {
  return (
    <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }} styles={{ body: { padding: 20 } }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 52, height: 52, flexShrink: 0, borderRadius: 14,
          display: 'grid', placeItems: 'center', fontSize: 24, lineHeight: 1,
          color, background: `${color}1a`, /* same color at ~10% opacity */
        }}>
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: '#64748b', fontSize: 13, fontWeight: 600 }}>{title}</div>
          <div style={{ color: '#0f172a', fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>
            {prefix}{value}
          </div>
        </div>
      </div>
    </Card>
  );
}