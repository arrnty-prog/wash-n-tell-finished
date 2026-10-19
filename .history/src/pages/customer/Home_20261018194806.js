import { Row, Col, Card, Button } from 'antd';
import { Link } from 'react-router-dom';
import {
  PlusOutlined, FileTextOutlined, TagOutlined,
  GiftOutlined, ClockCircleOutlined, PhoneOutlined, DollarOutlined,
} from '@ant-design/icons';
import { customerPromo, shopInfo } from './mock'; // TODO(backend): replace with API data

const card = { borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' };

// One shortcut card (icon square + title + text + button)
function ShortcutCard({ icon, title, text, to, label, primary }) {
  return (
    <Card hoverable style={{ ...card, height: '100%' }} styles={{ body: { padding: 24 } }}>
      <span style={{
        fontSize: 22, color: '#fff', width: 48, height: 48, borderRadius: 14, marginBottom: 16,
        display: 'grid', placeItems: 'center',
        background: 'linear-gradient(135deg,#38bdf8,#2563eb)',
      }}>{icon}</span>
      <div style={{ fontWeight: 700, fontSize: 17, color: '#0f172a' }}>{title}</div>
      <div style={{ color: '#64748b', margin: '4px 0 20px' }}>{text}</div>
      <Link to={to}><Button type={primary ? 'primary' : 'default'} size="large" block style={{ borderRadius: 10 }}>{label}</Button></Link>
    </Card>
  );
}

// Small section title with an icon
function SectionTitle({ icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 14 }}>
      <span style={{ color: '#2563eb' }}>{icon}</span>{children}
    </div>
  );
}

const infoRow = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#475569', borderBottom: '1px dashed #e2e8f0' };

export default function Home() {
  const firstName = JSON.parse(localStorage.getItem('user') || 'null')?.firstName || '';

  return (
    <div className="page-content">
      {/* Welcome banner */}
      <div style={{
        borderRadius: 20, padding: '32px 36px', marginBottom: 24, color: '#fff',
        background: 'linear-gradient(135deg,#38bdf8,#2563eb)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 28, fontWeight: 800 }}>Welcome back, {firstName}!</h2>
          <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>What would you like to do today?</div>
        </div>
        <Link to="/user/new-order">
          <Button size="large" icon={<PlusOutlined />} style={{ borderRadius: 10, fontWeight: 600, color: '#2563eb' }}>Book a Pickup</Button>
        </Link>
      </div>

      <Row gutter={[20, 20]}>
        {/* 3 shortcut cards */}
        <Col xs={24} md={8}><ShortcutCard primary icon={<PlusOutlined />} title="New Order" text="Book a pickup or drop-off" to="/user/new-order" label="Start" /></Col>
        <Col xs={24} md={8}><ShortcutCard icon={<FileTextOutlined />} title="My Orders" text="View active and past orders" to="/user/my-orders" label="View" /></Col>
        <Col xs={24} md={8}><ShortcutCard icon={<TagOutlined />} title="Price List" text="See our rates and services" to="/user/home" label="View" /></Col>{/* TODO(backend): open the price list */}

        {/* Promo banner */}
        <Col span={24}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px', borderRadius: 16,
            background: '#fff7e6', border: '1px solid #ffe7ba',
          }}>
            <span style={{ fontSize: 24, color: '#fa8c16' }}><GiftOutlined /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>Promo</div>
              <div style={{ color: '#475569' }}>{customerPromo}</div>
            </div>
            <Button style={{ borderRadius: 10 }}>Learn more</Button>
          </div>
        </Col>

        {/* Shop info */}
        <Col span={24}>
          <Card style={card} styles={{ body: { padding: 28 } }}>
            <Row gutter={[40, 24]}>
              <Col xs={24} md={8}>
                <SectionTitle icon={<DollarOutlined />}>Price list</SectionTitle>
                {shopInfo.prices.map(([name, price]) => <div key={name} style={infoRow}><span>{name}</span><b style={{ color: '#0f172a' }}>{price}</b></div>)}
              </Col>
              <Col xs={24} md={8}>
                <SectionTitle icon={<ClockCircleOutlined />}>Operating hours</SectionTitle>
                {shopInfo.hours.map(([days, hours]) => <div key={days} style={infoRow}><span>{days}</span><b style={{ color: '#0f172a' }}>{hours}</b></div>)}
              </Col>
              <Col xs={24} md={8}>
                <SectionTitle icon={<PhoneOutlined />}>Contact</SectionTitle>
                {shopInfo.contact.map((line) => <div key={line} style={{ color: '#475569', padding: '8px 0' }}>{line}</div>)}
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}