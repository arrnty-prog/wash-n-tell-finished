import { useState } from 'react';
import axios from 'axios';
import { ConfigProvider, Row, Col, Flex, Space, Form, Input, Button, Typography, message } from 'antd';
import {
  UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, LockOutlined,
  CheckCircleFilled, SafetyOutlined, CustomerServiceOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/ui/Logo';
import heroImg from '../../assets/regreg.png';

const { Title, Text, Link } = Typography;

const iconStyle = { color: '#94a3b8' };

function HeroPanel() {
  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100%',
        backgroundImage: `url(${heroImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}

const req = (label) => ({ required: true, message: `Enter your ${label}` });

function RegisterForm() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = (v) => {
    setError('');
    setSaving(true);
    axios.post('http://localhost:8000/customers', {
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      mobile: v.phone,
      address: v.address,
      password: v.password,
    })
      .then(() => {
        message.success('Account created! You can log in now.');
        navigate('/login');
      })
      .catch((err) => {
        setError(err.response ? (err.response.data.error || 'Registration failed') : 'Cannot reach the server. Is the backend running?');
      })
      .finally(() => setSaving(false));
  };

  return (
    <div style={{ width: '100%', maxWidth: 462 }}>
  <Logo style={{ padding: 0, marginBottom: 24 }} />
      <Title level={2} style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
        Create Your Account
      </Title>
      <Text type="secondary" style={{ fontSize: 14 }}>Create an account to get started</Text>

      <ConfigProvider
  theme={{
    token: { fontSize: 15, controlHeight: 35, controlHeightLG: 44 },
    components: { Form: { itemMarginBottom: 16, labelHeight: 22, verticalLabelPadding: '0 0 4px' } },
  }}
>
  <Form name="register" layout="vertical" requiredMark={false} style={{ marginTop: 24 }} onFinish={handleRegister}>
          <Row gutter={13}>
            <Col xs={24} sm={12}>
              <Form.Item name="firstName" label="First Name" rules={[req('first name')]}>
                <Input prefix={<UserOutlined style={iconStyle} />} placeholder="First name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="lastName" label="Last Name" rules={[req('last name')]}>
                <Input prefix={<UserOutlined style={iconStyle} />} placeholder="Last name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="email" label="Email Address" rules={[req('email'), { type: 'email', message: 'Enter a valid email' }]}>
            <Input prefix={<MailOutlined style={iconStyle} />} placeholder="john@example.com" />
          </Form.Item>

          <Row gutter={13}>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Phone Number" rules={[req('phone number')]}>
                <Input prefix={<PhoneOutlined style={iconStyle} />} placeholder="+63 900 000 0000" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="address" label="Address" rules={[req('address')]}>
                <Input prefix={<EnvironmentOutlined style={iconStyle} />} placeholder="Street, Barangay, City" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={13}>
            <Col xs={24} sm={12}>
              <Form.Item name="password" label="Create Password" rules={[
                { required: true, message: 'Create a password' },
                { validator: (_, v) => (!v || (v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v)) ? Promise.resolve() : Promise.reject(new Error('At least 8 characters, with letters and numbers'))) },
              ]}>
                <Input.Password prefix={<LockOutlined style={iconStyle} />} placeholder="••••••••" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="confirmPassword" label="Confirm Password" dependencies={['password']} rules={[
                { required: true, message: 'Confirm your password' },
                ({ getFieldValue }) => ({ validator: (_, v) => (!v || getFieldValue('password') === v ? Promise.resolve() : Promise.reject(new Error('Passwords do not match'))) }),
              ]}>
                <Input.Password prefix={<LockOutlined style={iconStyle} />} placeholder="••••••••" />
              </Form.Item>
            </Col>
          </Row>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: -8, marginBottom: 16 }}>
  At least 8 characters, with letters and numbers.
</Text>

{error && <Text type="danger" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>{error}</Text>}

<Button
  type="primary"
  size="large"
  block
  loading={saving}
  icon={<CheckCircleFilled />}
  iconPosition="end"
  htmlType="submit"
  style={{ marginTop: 8 }}
>
  Complete Registration
</Button>
        </Form>
      </ConfigProvider>

      <Flex justify="center" gap={6} style={{ marginTop: 20 }}>
        <Text type="secondary" style={{ fontSize: 14 }}>Already have an account?</Text>
        <Link strong style={{ fontSize: 14 }} onClick={() => navigate('/login')}>Log In</Link>
      </Flex>

      <Flex justify="center" style={{ marginTop: 18 }}>
        <Space size={31}>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}><SafetyOutlined /> SECURE DATA</Text>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}><CustomerServiceOutlined /> 24/7 SUPPORT</Text>
        </Space>
      </Flex>
    </div>
  );
}

export default function Register() {
  return (
    <Row style={{ minHeight: '100vh' }}>
      <Col xs={0} lg={12}><HeroPanel /></Col>
      <Col
        xs={24}
        lg={12}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#fff' }}
      >
        <RegisterForm />
      </Col>
    </Row>
  );
}