import { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Col, Card, Menu, Form, Input, Button, message, Modal } from 'antd';
import { UserOutlined, LockOutlined, LogoutOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useOrderDraft } from '../../context/OrderContext';

const API = 'http://localhost:8000';
const iconStyle = { color: '#94a3b8' };

const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');
const headers = () => ({ 'x-user-id': getUser()?.id });

const menuItems = [
  { key: 'info', label: 'Personal Info', icon: <UserOutlined /> },
  { key: 'password', label: 'Change password', icon: <LockOutlined /> },
  { type: 'divider' },
  { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, danger: true },
];

export default function Profile() {
  const navigate = useNavigate();
  const { clearDraft } = useOrderDraft();
  const [section, setSection] = useState('info'); 
  const [infoForm] = Form.useForm();
  const [pwForm] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    infoForm.setFieldsValue(getUser() || {});
    axios.get(`${API}/me`, { headers: headers() })
      .then((res) => infoForm.setFieldsValue(res.data))
      .catch((err) => message.error(err.response?.data?.error || 'Could not load your profile'));
  }, [infoForm]);

  const saveInfo = (v) => {
    setSaving(true);
    axios.put(`${API}/me`, { firstName: v.firstName, lastName: v.lastName, email: v.email, phone: v.phone, address: v.address }, { headers: headers() })
      .then((res) => {
        localStorage.setItem('user', JSON.stringify({ ...getUser(), firstName: res.data.firstName, lastName: res.data.lastName, email: res.data.email, phone: res.data.phone, address: res.data.address }));
        message.success('Profile saved');
      })
      .catch((err) => message.error(err.response?.data?.error || 'Could not save your profile'))
      .finally(() => setSaving(false));
  };

  const savePassword = (v) => {
    setSaving(true);
    axios.post(`${API}/me/password`, { current: v.current, next: v.next }, { headers: headers() })
      .then(() => { message.success('Password updated'); pwForm.resetFields(); })
      .catch((err) => message.error(err.response?.data?.error || 'Could not update your password'))
      .finally(() => setSaving(false));
  };

  const logout = () =>
    Modal.confirm({
      title: 'Are you sure you want to log out?',
      okText: 'Log out',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      centered: true,
      onOk: () => {
        clearDraft();
        sessionStorage.removeItem('orderDraft');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
      },
    });

  return (
    <div className="page-content">
      <div className="page-head">
        <div><h2>Profile</h2><span style={{ color: '#64748b' }}>Manage your account details.</span></div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={6}>
          <Card styles={{ body: { padding: 8 } }}>
            <Menu mode="inline" selectedKeys={[section]} items={menuItems} style={{ borderInline: 0 }}
              onClick={(e) => (e.key === 'logout' ? logout() : setSection(e.key))} />
          </Card>
        </Col>

        <Col xs={24} lg={18}>
          {section === 'info' ? (
            <Card title="Personal Info">
              <Form form={infoForm} layout="vertical" requiredMark={false} size="large" onFinish={saveInfo}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}><Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Enter your first name' }]}><Input prefix={<UserOutlined style={iconStyle} />} placeholder="First name" /></Form.Item></Col>
                  <Col xs={24} sm={12}><Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Enter your last name' }]}><Input prefix={<UserOutlined style={iconStyle} />} placeholder="Last name" /></Form.Item></Col>
                </Row>
                <Form.Item name="email" label="Email Address" rules={[{ required: true, message: 'Enter your email' }, { type: 'email', message: 'Enter a valid email' }]}><Input prefix={<MailOutlined style={iconStyle} />} placeholder="john@example.com" /></Form.Item>
                <Form.Item name="phone" label="Phone Number" rules={[{ required: true, message: 'Enter your phone number' }]}><Input prefix={<PhoneOutlined style={iconStyle} />} placeholder="+63 900 000 0000" /></Form.Item>
                <Form.Item name="address" label="Address"><Input prefix={<EnvironmentOutlined style={iconStyle} />} placeholder="House no., street, barangay, city" /></Form.Item>
                <Button type="primary" htmlType="submit" loading={saving}>Save</Button>
              </Form>
            </Card>
          ) : (
            <Card title="Change password">
              <Form form={pwForm} layout="vertical" requiredMark={false} size="large" style={{ maxWidth: 420 }} onFinish={savePassword}>
                <Form.Item name="current" label="Current Password" rules={[{ required: true, message: 'Enter your current password' }]}><Input.Password prefix={<LockOutlined style={iconStyle} />} placeholder="••••••••" /></Form.Item>
                <Form.Item name="next" label="New Password" extra="At least 8 characters, with letters and numbers." rules={[
                  { required: true, message: 'Enter a new password' },
                  { validator: (_, v) => (!v || (v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v)) ? Promise.resolve() : Promise.reject(new Error('At least 8 characters, with letters and numbers'))) },
                ]}><Input.Password prefix={<LockOutlined style={iconStyle} />} placeholder="••••••••" /></Form.Item>
                <Form.Item name="confirm" label="Confirm New Password" dependencies={['next']} rules={[
                  { required: true, message: 'Confirm your new password' },
                  ({ getFieldValue }) => ({ validator: (_, v) => (!v || getFieldValue('next') === v ? Promise.resolve() : Promise.reject(new Error('Passwords do not match'))) }),
                ]}><Input.Password prefix={<LockOutlined style={iconStyle} />} placeholder="••••••••" /></Form.Item>
                <Button type="primary" htmlType="submit" loading={saving}>Update Password</Button>
              </Form>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
