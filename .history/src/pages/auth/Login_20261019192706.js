import { Row, Col, Form, Input, Button, Checkbox, Tabs, Typography, Flex, ConfigProvider, Space } from 'antd';
import { MailOutlined, LockOutlined, ArrowRightOutlined, ArrowUpOutlined, SafetyOutlined, CustomerServiceOutlined} from '@ant-design/icons';
import Logo from '../../components/ui/Logo';
import MiniChart from '../../components/ui/MiniChart';

import React, {useState, useEffect} from 'react'
import {useNavigate, Link} from 'react-router-dom'
import axios from 'axios'

const CHART = { data: [400, 650, 500, 800, 1100, 950], labels: ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM'] };

function HeroPanel() {
  return (
    <div className="login-hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, textAlign: 'center' }}>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 520 }}>
        <h1 style={{ color: '#fff', fontSize: 44, lineHeight: 1.1, fontWeight: 800, margin: 0 }}>Smart Laundry Management Simplified</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 17, margin: '20px 0 48px' }}>Optimize your workflow, track every garment, and scale your laundry business with real-time analytics.</p>

        {/* Glass card holding the machine picture + revenue preview */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32, borderRadius: 24, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}>
          {/* Washing machine picture (hidden on small screens so the card stays tidy) */}
          <div className="login-machine" style={{ textAlign: 'center', color: '#fff', fontSize: 13 }}>
            <div style={{ width: 128, height: 160, background: '#fff', borderRadius: 16, padding: 14, margin: '0 auto 14px', position: 'relative' }}>
              <span style={{ position: 'absolute', top: 14, left: 16, width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ position: 'absolute', top: 15, right: 16, width: 32, height: 5, borderRadius: 3, background: '#e5e7eb' }} />
              <div style={{ width: 96, height: 96, margin: '28px auto 0', borderRadius: '50%', border: '4px solid #3b82f6', background: '#eff6ff', display: 'grid', placeItems: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#60a5fa"><path d="M12 2.5c3.5 4.2 6.5 7.6 6.5 11.2a6.5 6.5 0 0 1-13 0C5.5 10.1 8.5 6.7 12 2.5z" /></svg>
              </div>
            </div>
            Machine #04 - Active
          </div>
          {/* "Today's Revenue" preview card */}
          <div style={{ flex: 1, minWidth: 240, background: '#fff', borderRadius: 16, padding: 16, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
              <span style={{ color: '#0f172a' }}>Today's Revenue</span>
              <span style={{ color: '#16a34a' }}>+12.5% <ArrowUpOutlined /></span>
            </div>
            <MiniChart data={CHART.data} labels={CHART.labels} height={150} />
          </div>
        </div>
      </div>
    </div>
  );
}

const url = 'http://localhost:8000/api';

const routes = {
    admin: '/admin/dashboard',
    staff: '/staff/dashboard',
    user: '/user/home'
}


function LoginForm() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = (values) => {
    setError('');

    axios.post('http://localhost:8000/login', { email: values.email, password: values.password })
      .then(res => {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate(routes[res.data.user.role] || '/login');
      })
      .catch(err => {
        setError(err.response ? (err.response.data.error || 'Login failed') : 'Cannot reach the server. Is the backend running?');
      });
  };

  return (
    <div style={{ width: '100%', maxWidth: 462 }}>
      <Logo style={{ padding: 0, marginBottom: 18 }} />
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Welcome Back</h2>
      <Typography.Text type="secondary" style={{ fontSize: 14 }}>
        Sign in to manage your shop or track orders
      </Typography.Text>

      <ConfigProvider
        theme={{
          token: { fontSize: 15, controlHeight: 35, controlHeightLG: 44 },
          components: { Form: { itemMarginBottom: 9, labelHeight: 20, verticalLabelPadding: '0 0 2px' } },
        }}
      >
        <Form
          name="login"
          layout="vertical"
          requiredMark={false}
          initialValues={{ remember: false }}
          onFinish={handleLogin}
          style={{ marginTop: 15 }}
        >
          <Form.Item name="email" label="Email Address">
            <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="e.g. name@shop.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              <Flex justify="space-between" style={{ width: '100%' }}>
                <span>Password</span>
              </Flex>
            }
            extra={
              <div style={{ textAlign: 'right', marginTop: 2 }}>
                <a style={{ fontWeight: 600, fontSize: 12 }}>Forgot Password?</a>
              </div>
            }
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="••••••••" />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 12 }}>
            <Checkbox>Keep me logged in for 30 days</Checkbox>
          </Form.Item>

          {error && (
            <Typography.Text type="danger" style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
              {error}
            </Typography.Text>
          )}

          <Button
            type="primary"
            size="large"
            block
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            htmlType="submit"
            style={{ marginTop: 4 }}
          >
            Log In
          </Button>
        </Form>
      </ConfigProvider>

      <Flex justify="center" gap={6} style={{ marginTop: 15 }}>
        <Typography.Text type="secondary" style={{ fontSize: 14 }}>Don't have an account?</Typography.Text>
        <Link to="/register" style={{ fontWeight: 600, fontSize: 14 }}>Register</Link>
      </Flex>

      <Flex justify="center" style={{ marginTop: 13 }}>
        <Space size={31}>
          <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}><SafetyOutlined /> SECURE DATA</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}><CustomerServiceOutlined /> 24/7 SUPPORT</Typography.Text>
        </Space>
      </Flex>
    </div>
  );
}

export default function Login() {
  return (
    <Row style={{ minHeight: '100vh' }}>
      <Col xs={0} lg={12}><HeroPanel /></Col>
      <Col xs={24} lg={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: '#fff' }}><LoginForm /></Col>
    </Row>
  );
}
