// Sidebar + top bar shared by admin and staff. The menu is chosen by `role`.
import { Layout, Menu, Input, Badge, Button, ConfigProvider } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  PieChartOutlined, TeamOutlined, IdcardOutlined, FileTextOutlined, TagOutlined, CreditCardOutlined,
  AppstoreOutlined, LineChartOutlined, HistoryOutlined, AuditOutlined, BellOutlined, PlusOutlined, LogoutOutlined,
  UserOutlined, SearchOutlined, HomeOutlined
} from '@ant-design/icons';

const MENUS = {
  admin: [
    ['dashboard', 'Dashboard Overview', <PieChartOutlined />],
    ['staff', 'User/Staff Management', <TeamOutlined />],
    ['customers', 'Customer Management', <IdcardOutlined />],
    ['orders', 'Laundry Orders', <FileTextOutlined />],
    ['services', 'Service & Pricing', <TagOutlined />],
    ['payments', 'Payment Management', <CreditCardOutlined />],
    'divider',
    ['inventory', 'Inventory', <AppstoreOutlined />],
    ['reports', 'Reports & Analytics', <LineChartOutlined />],
    ['history', 'Order History', <HistoryOutlined />],
    ['action-history', 'Action History', <AuditOutlined />], // log of who did what (admin only)
  ],
  staff: [
    ['dashboard', 'Dashboard', <PieChartOutlined />],
    ['customers', 'Customer Management', <IdcardOutlined />],
    ['orders', 'Laundry Orders', <FileTextOutlined />],
  ],
  user: [
    ['home', 'Home', <HomeOutlined />],
    ['new-order', 'New Order', <PlusOutlined />],
    ['my-orders', 'My Orders', <FileTextOutlined />],
    ['profile', 'Profile', <UserOutlined />],
  ]
};

function Logo({ role }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '22px 20px 18px' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#38bdf8,#2563eb)', display: 'grid', placeItems: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.5c3.5 4.2 6.5 7.6 6.5 11.2a6.5 6.5 0 0 1-13 0C5.5 10.1 8.5 6.7 12 2.5z" /></svg>
      </div>
      <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>
        Wash 'N Tell <span style={{ color: '#2563eb' }}>{role === 'admin' ? 'Admin' : 'Staff'}</span>
      </span>
    </div>
  );
}

export default function AppLayout({ role }) {
  console.log('AppLayout file loaded');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  console.log('role:', JSON.stringify(role))
  const hello = (null);
  const items = MENUS[role].map((m) => (m === 'divider' ? { type: 'divider' } : { key: `/${role}/${m[0]}`, label: m[1], icon: m[2] }));
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider width={250} breakpoint="lg" collapsedWidth={0} style={{ background: '#fff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'sticky', top: 0 }}>
          <Logo role={role} />
          <ConfigProvider theme={{ components: { Menu: {
            itemHeight: 42, itemMarginInline: 12, itemBorderRadius: 10, itemColor: '#475569',
            itemSelectedBg: '#e8f0fe', itemSelectedColor: '#2563eb', iconSize: 16,
          } } }}>
            <Menu mode="inline" selectedKeys={[pathname]} items={items} onClick={(e) => navigate(e.key)} style={{ borderInline: 0, fontWeight: 500, flex: 1 }} />
          </ConfigProvider>
          <div style={{ margin: 16, padding: '12px 14px', background: '#f8fafc', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Alex - {role === 'admin' ? 'Admin' : 'Staff'}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Store Manager</div>
            </div>
            <LogoutOutlined style={{ color: '#64748b' }} />
          </div>
        </div>
      </Layout.Sider>
      <Layout>
        <Layout.Header style={{ background: '#fff', display: 'flex', justifyContent: role === 'admin' ? 'flex-end' : 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingInline: 32 }}>
          {role !== 'admin' && <Input prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} placeholder="Search orders, customers..." variant="filled" style={{ width: 320 }} />}
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            {role !== 'admin' && <Button type="primary" icon={<PlusOutlined />}>New Order</Button>}
            <Badge dot><BellOutlined style={{ fontSize: 18, color: '#475569' }} /></Badge>
          </div>
        </Layout.Header>
        <Layout.Content><Outlet /></Layout.Content>
      </Layout>
    </Layout>
  );
}
