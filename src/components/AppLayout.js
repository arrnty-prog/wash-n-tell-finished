// Sidebar + top bar shared by admin and staff. The menu is chosen by `role`.
import { Layout, Menu, Badge, Avatar, ConfigProvider, Button} from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Logo from '../ui/Logo'; // same logo is used on the Login page
import {
  PieChartOutlined, TeamOutlined, IdcardOutlined, FileTextOutlined, TagOutlined, CreditCardOutlined,
  AppstoreOutlined, LineChartOutlined, HistoryOutlined, AuditOutlined, BellOutlined, LogoutOutlined,
  UserOutlined, SyncOutlined, CarOutlined,
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
    ['history', 'Order History', <HistoryOutlined />],
    ['action-history', 'Action History', <AuditOutlined />], // log of who did what (admin only)
  ],
  staff: [
    ['dashboard', 'Dashboard', <AppstoreOutlined />],
    ['customers', 'Customer Management', <UserOutlined />],
    ['create-order', 'Create Laundry Order', <FileTextOutlined />],
    ['update-status', 'Update Laundry Status', <SyncOutlined />],
    ['pickup-delivery', 'Pickup & Delivery', <CarOutlined />],
    ['history', 'Order History', <HistoryOutlined />],
  ],
};

export default function AppLayout({ role }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const items = MENUS[role].map((m) => (m === 'divider' ? { type: 'divider' } : { key: `/${role}/${m[0]}`, label: m[1], icon: m[2] }));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }
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
          <div style={{ margin: 16, padding: '12px 14px', background: role === 'admin' ? '#f8fafc' : '#fff', border: role === 'admin' ? undefined : '1px solid #e2e8f0', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {role === 'admin' ? (
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Alex - Admin</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Store Manager</div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar style={{ background: '#2563eb', fontWeight: 700 }}>A</Avatar>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Alex Rivera</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Staff Member</div>
                </div>
              </div>
            )}
            <Button type ="text" icon={<LogoutOutlined style={{ color: '#64748b' }} onClick={handleLogout}/>}></Button>
            
          </div>
        </div>
      </Layout.Sider>
      <Layout>
        <Layout.Header style={{ background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingInline: 32 }}>
          <Badge dot><BellOutlined style={{ fontSize: 18, color: '#475569' }} /></Badge>
        </Layout.Header>
        <Layout.Content><Outlet /></Layout.Content>
      </Layout>
    </Layout>
  );
}
