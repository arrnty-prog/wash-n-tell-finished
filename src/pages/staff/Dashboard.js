import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Row, Col, Card, Table, Typography } from 'antd';
import { FileTextOutlined, DollarOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import StatCard from '../../components/ui/StatCard';
import StatusTag from '../../components/ui/StatusTag';
import LowInventoryCard, { useLowInventory } from '../../components/ui/LowInventoryCard';

const cardStyle = { borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' };
const headerStyle = { borderBottom: '1px solid #f1f5f9', fontSize: 16, fontWeight: 700 };

const formatTime = (d) =>
  d
    ? new Date(d).toLocaleTimeString('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Manila',
      })
    : '-';

const columns = [
  {
    title: 'Order ID',
    dataIndex: 'id',
    render: (v) => (
      <Typography.Text style={{ color: '#8c8c8c', fontSize: 13 }}>
        {v}
      </Typography.Text>
    ),
  },
  {
    title: 'Time',
    dataIndex: 'createdAt',
    render: formatTime,
    sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  },
  { title: 'Customer', dataIndex: 'customer' },
  { title: 'Service', dataIndex: 'service' },
  { title: 'Status', dataIndex: 'status', render: (s) => <StatusTag status={s} /> },
  { title: 'Amount', dataIndex: 'amount', align: 'right', render: (v) => <b>₱{v.toLocaleString()}</b> },
];

const formatOrderId = (o) =>
  o.orderNumber || `#${String(o._id).slice(-6).toUpperCase()}`;

const toRow = (o) => ({
  id: formatOrderId(o),
  customer:
    o.customerName ||
    `${o.customerDetails?.firstName ?? ''} ${o.customerDetails?.lastName ?? ''}`.trim() ||
    'Unknown',
  service: [...new Set((o.items || []).map((i) => i.serviceName))].join(', '),
  status: o.status,
  paid: o.payment?.status === 'paid',
  amount: o.total ?? 0,
  createdAt: o.createdAt,
  fulfillment: o.fulfillment,
});

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const { low, loading: invLoading } = useLowInventory();

  const getHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return { 'x-user-id': user?.id };
  };

  useEffect(() => {
    axios
      .get('http://localhost:8000/orders?today=true', { headers: getHeaders() })
      .then((res) => setOrders(res.data.map(toRow)))
      .catch((err) => console.error('Error fetching orders:', err))
      .finally(() => setLoading(false));
  }, []);

  // Keeps the header clock current
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const todayRevenue =
    orders
      .filter((o) => o.paid && String(o.status).toLowerCase() !== 'cancelled')
      .reduce((sum, o) => sum + Math.round((o.amount || 0) * 100), 0) / 100;

  const readyOrders = orders.filter((o) => String(o.status).toLowerCase() === 'ready');

  const today = now.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' });
  const clock = now.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="page-content">
      <div className="page-head">
        <div>
          <h2 style={{ fontWeight: 800, color: '#0f172a' }}>Dashboard Overview</h2>
          <span style={{ color: '#64748b' }}>{today} · {clock}</span>
        </div>
      </div>

      {/* Stat cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
        <Col xs={12} xl={6}>
          <StatCard title="Today's Orders" value={orders.length} icon={<FileTextOutlined />} />
        </Col>
        <Col xs={12} xl={6}>
          <StatCard
            title="Today's Revenue"
            value={todayRevenue}
            prefix="₱"
            precision={2}
            icon={<DollarOutlined />}
            color="#16a34a"
          />
        </Col>
        <Col xs={12} xl={6}>
          <StatCard title="Low Inventory" value={low.length} icon={<WarningOutlined />} color="#f97316" />
        </Col>
        <Col xs={12} xl={6}>
          <StatCard
            title="Orders to Pickup / Deliver"
            value={readyOrders.length}
            icon={<CheckCircleOutlined />}
            color="#7c3aed"
          />
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        {/* Today's orders */}
        <Col xs={24} xl={16}>
          <Card title="Today's Orders" style={cardStyle} styles={{ header: headerStyle }}>
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="id"
              loading={loading}
              pagination={true}
              scroll={{ x: true }}
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          {/* Low inventory */}
          <LowInventoryCard low={low} loading={invLoading} role="staff" />
        </Col>
      </Row>
    </div>
  );
}