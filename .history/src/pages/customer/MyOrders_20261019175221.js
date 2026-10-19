import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Card, Button, Input, Select, Tabs, Collapse, Steps, Table, Timeline, Row, Col, Empty, message } from 'antd';
import { Link } from 'react-router-dom';
import { PlusOutlined, DownloadOutlined, WarningOutlined } from '@ant-design/icons';
import StatusTag from '../../components/ui/StatusTag';

const API = 'http://localhost:8000';
const peso = (v) => `₱${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
const SERVICES = ['All', 'Wash and Fold', 'Dry Clean', 'Ironing'].map((s) => ({ value: s, label: s }));
const small = { fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 };

const STAGES = ['Pending', 'Washing', 'Drying', 'Folding', 'Ready', 'Completed'];
const ORDER_STEPS = ['Order placed', 'Washing', 'Drying', 'Folding', 'Ready'];

const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' });
const fmtDateTime = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' });

const toCard = (o) => {
  const services = [...new Set((o.items || []).map((i) => i.serviceName || i.name))].join(', ');
  const lines = (o.items || []).map((i) => ({
    name: `${i.name}${i.qty ? `, ${i.qty}${i.unit ? ` ${i.unit}` : ''}` : ''}`,
    amount: Number(i.price) * Number(i.qty),
  }));
  if (o.tax) lines.push({ name: 'Tax (12% VAT)', amount: o.tax });
  if (o.deliveryFee) lines.push({ name: 'Delivery fee', amount: o.deliveryFee });

  const seen = new Set((o.statusHistory || []).map((h) => h.status));
  const history = [
    ...(o.statusHistory || []).map((h) => ({ done: true, time: fmtDateTime(h.at), label: h.status === 'Pending' ? 'Order placed' : h.status })),
    ...STAGES.filter((s) => !seen.has(s)).map((s) => ({ done: false, label: s })),
  ];

  return {
    key: o._id,
    id: `#${o.orderCode}`,
    services,
    status: o.status,
    step: Math.min(STAGES.indexOf(o.status), ORDER_STEPS.length - 1),
    scheduled: o.fulfillment?.scheduledDate ? fmtDate(o.fulfillment.scheduledDate) : null,
    date: fmtDate(o.createdAt),
    total: o.total,
    payment: o.payment?.status === 'paid' ? 'Paid' : 'Unpaid',
    history,
    lines,
    address: o.fulfillment?.type === 'delivery' ? o.fulfillment.address || 'Delivery' : 'Pickup at the shop counter',
    completed: o.status === 'Completed',
  };
};

const orderHeader = (o) => (
  <div style={{ width: '100%' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
      <div><b style={{ fontSize: 16 }}>Order {o.id}</b><div style={{ color: '#64748b' }}>{o.services}</div></div>
      <StatusTag status={o.status} />
    </div>
    <Steps size="small" current={o.step} items={ORDER_STEPS.map((title) => ({ title }))} style={{ margin: '16px 0 8px' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
      <span>{o.scheduled ? `Scheduled: ${o.scheduled}` : `Placed: ${o.date}`}</span>
      <b style={{ color: '#0f172a' }}>Total: {peso(o.total)} ({o.payment})</b>
    </div>
  </div>
);

const orderDetails = (o) => (
  <>
    <Row gutter={[24, 16]}>
      <Col xs={24} md={8}>
        <div style={small}>Status history</div>
        <Timeline items={o.history.map((h) => ({ color: h.done ? 'blue' : 'gray', children: <span>{h.label}{h.time && <span style={{ color: '#94a3b8' }}> · {h.time}</span>}</span> }))} />
      </Col>
      <Col xs={24} md={8}>
        <div style={small}>Items and price</div>
        {o.lines.map((l, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', marginBottom: 4 }}>
            <span>{l.name}</span><span>{peso(l.amount)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', marginTop: 8, paddingTop: 8 }}><b>Total</b><b>{peso(o.total)}</b></div>
      </Col>
      <Col xs={24} md={8}>
        <div style={small}>Pickup / Delivery</div>
        <div style={{ color: '#475569' }}>{o.address}</div>
      </Col>
    </Row>
    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button type="primary" icon={<DownloadOutlined />}>Download Receipt</Button>
        <Button icon={<WarningOutlined />}>Report a Problem</Button>
      </div>
      <Button danger>Cancel</Button>
    </div>
  </>
);

const pastColumns = [
  { title: 'Order ID', dataIndex: 'id', render: (v) => <b>{v}</b> },
  { title: 'Date', dataIndex: 'date' },
  { title: 'Service', dataIndex: 'services' },
  { title: 'Amount', dataIndex: 'total', render: (v) => <b>{peso(v)}</b> },
  { title: 'Status', dataIndex: 'status', render: (s) => <StatusTag status={s} /> },
  { title: '', render: () => <Button size="small">Reorder</Button> }, // TODO(backend): copy this order into a new one
];

const activeList = (list) => (
  list.length === 0
    ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No active orders" />
    : (
      <Collapse
        bordered={false}
        expandIconPosition="end"
        defaultActiveKey={[list[0].key]}
        style={{ background: 'transparent' }}
        items={list.map((o) => ({
          key: o.key,
          label: orderHeader(o),
          children: orderDetails(o),
          style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
        }))}
      />
    )
);
const pastList = (list) => <Card><Table columns={pastColumns} dataSource={list} rowKey="key" pagination={{ pageSize: 8, hideOnSinglePage: true }} scroll={{ x: true }} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No completed orders yet" /> }} /></Card>;

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [service, setService] = useState('All');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    axios.get(`${API}/orders/mine`, { headers: { 'x-user-id': user?.id } })
      .then((res) => setOrders(res.data.map(toCard)))
      .catch((err) => message.error(err.response?.data?.error || 'Could not load your orders'))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => {
    const q = search.trim().replace('#', '').toLowerCase();
    return orders.filter((o) =>
      (!q || o.id.replace('#', '').toLowerCase().includes(q)) &&
      (service === 'All' || o.services.toLowerCase().includes(service.toLowerCase().replace('ironing', 'iron'))));
  }, [orders, search, service]);

  const active = shown.filter((o) => !o.completed);
  const past = shown.filter((o) => o.completed);

  return (
    <div className="page-content">
      <div className="page-head">
        <div><h2>My Orders</h2><span style={{ color: '#64748b' }}>Track your active orders and see your past ones.</span></div>
        <Link to="/user/new-order"><Button type="primary" icon={<PlusOutlined />}>New Order</Button></Link>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <Input.Search allowClear placeholder="Search order number" style={{ flex: 1, minWidth: 220 }} value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={service} onChange={setService} options={SERVICES} style={{ width: 180 }} />
      </div>

      <Card loading={loading} bordered={false} style={{ background: 'transparent' }} styles={{ body: { padding: 0 } }}>
        <Tabs items={[
          { key: 'active', label: `Active (${active.length})`, children: activeList(active) },
          { key: 'completed', label: `Completed (${past.length})`, children: pastList(past) },
          { key: 'all', label: `All (${shown.length})`, children: <>{activeList(active)}{past.length > 0 && pastList(past)}</> },
        ]} />
      </Card>
    </div>
  );
}
