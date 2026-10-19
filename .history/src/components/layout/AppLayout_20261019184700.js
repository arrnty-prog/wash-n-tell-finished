// Sidebar + top bar shared by admin and staff. The menu is chosen by `role`.
import { Layout, Menu, Badge, Avatar, ConfigProvider, Button, Modal} from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useOrderDraft } from '../../context/OrderContext'; 
import Logo from '../ui/Logo'; // same logo is used on the Login page
import {
  PieChartOutlined, TeamOutlined, IdcardOutlined, FileTextOutlined, TagOutlined, CreditCardOutlined,
  AppstoreOutlined, HistoryOutlined, AuditOutlined, BellOutlined, LogoutOutlined,
  UserOutlined, SyncOutlined, HomeOutlined, PlusOutlined
} from '@ant-design/icons';

// for navbar
const MENUS = {
  admin: [
    ['dashboard', 'Dashboard', <PieChartOutlined />],
    ['staff', 'Admin & Staff', <TeamOutlined />],
    ['customers', 'Customers', <IdcardOutlined />],
    ['inventory', 'Inventory', <AppstoreOutlined />],
    'divider',
    ['history', 'Order History', <HistoryOutlined />],
    ['payments', 'Payments', <CreditCardOutlined />],
    ['action-history', 'Audit Logs', <AuditOutlined />],
  ],
  staff: [
    ['dashboard', 'Dashboard', <PieChartOutlined />],
    ['customers', 'Customers', <TeamOutlined />],
    ['create-order', 'New Order', <PlusOutlined />],
    ['update-status', 'Update Status', <SyncOutlined />],
    ['inventory', 'Inventory', <AppstoreOutlined />],
    ['history', 'Order History', <HistoryOutlined />],
  ],
  user: [
    ['home', 'Home', <HomeOutlined />],
    ['new-order', 'New Order', <PlusOutlined />],
    ['my-orders', 'My Orders', <FileTextOutlined />],
    ['profile', 'Profile', <UserOutlined />],
  ]
};

export default function AppLayout({ role }) {
  const storedUserString = localStorage.getItem('user');
  let user = null;
  const { clearDraft } = useOrderDraft();

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const items = MENUS[role].map((m) => (m === 'divider' ? { type: 'divider' } : { key: `/${role}/${m[0]}`, label: m[1], icon: m[2] }));

  if (storedUserString) {
    try {
      user = JSON.parse(storedUserString);
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  } else {
    console.log("No user data found in localStorage.");
  }

  // logout
  const handleLogout = () => {
  Modal.confirm({
    title: 'Are you sure you want to log out?',
    okText: 'Log out',
    cancelText: 'Cancel',
    okButtonProps: { danger: true },
    centered: true,
    onOk: () => {
      clearDraft();
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    },
  });
};

  const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User';
  const initial = fullName.charAt(0).toUpperCase();
  
  const displayRole = role === 'admin' ? 'Admin' : 'Staff';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider width={250} breakpoint="lg" collapsedWidth={0} style={{ background: '#fff', position: 'sticky', top:0, height: '100vh', overflow: 'auto'}}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'sticky', top: 0 }}>
          <Logo role={role} />
          <ConfigProvider theme={{ components: { Menu: {
            itemHeight: 42, itemMarginInline: 12, itemBorderRadius: 10, itemColor: '#475569',
            itemSelectedBg: '#e8f0fe', itemSelectedColor: '#2563eb', iconSize: 16,
          } } }}>
            <Menu mode="inline" selectedKeys={[pathname]} items={items} onClick={(e) => navigate(e.key)} style={{ borderInline: 0, fontWeight: 500, flex: 1 }} />
          </ConfigProvider>
          
          <div style={{ 
            margin: 16, 
            padding: '12px 14px', 
            background: '#fff', 
            border: '1px solid #e2e8f0', 
            borderRadius: 12, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar style={{ background: '#2563eb', fontWeight: 700 }}>
                {initial}
              </Avatar>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{fullName}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{displayRole}</div>
              </div>
            </div>
            
            <Button 
              type="text" 
              onClick={handleLogout} 
              icon={<LogoutOutlined style={{ color: '#64748b' }} />} 
            />
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