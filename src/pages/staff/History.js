// Order History: live data from GET /orders. Click the + on a row to see the order's items
// and its status timeline (who moved it to each stage, and when).
import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Button, Card, Select, Table, Timeline, Typography, message } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import StatusTag from '../../components/ui/StatusTag';
import { peso } from '../../utils/peso';

const PAYMENTS = [{ value: 'all', label: 'All' }, { value: 'Paid', label: 'Paid' }, { value: 'Pending', label: 'Pending' }];

const serviceOf = (o) => [...new Set(o.items.map((i) => i.serviceName || i.name))].join(', ');

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });


const lastChange = (o) => (o.statusHistory?.length ? o.statusHistory[o.statusHistory.length - 1] : null);


const describe = (h, o) => {
  if (h.status === 'Pending') {
    return o.createdBy
      ? { label: 'Pending', text: `Order placed by ${h.changedByName} (Staff)` }
      : { label: 'Pending', text: `Order placed by ${o.customerName} (Customer)` };
  }

  if (h.status === 'Completed') {
    return o.fulfillment?.type === 'delivery'
      ? { label: 'Completed', text: `Delivered by ${h.changedByName} (Staff)` }
      : { label: 'Completed', text: `Picked up by ${o.customerName} (Customer)` };
  }

  return { label: h.status, text: `Moved by ${h.changedByName} (Staff)` };
};

const columns = [
  { title: 'Order ID', dataIndex: 'id', render: (v) => <Typography.Text style={{ color: '#8c8c8c', fontSize: 13 }}>
          {v}
        </Typography.Text>},
  { title: 'Customer', dataIndex: 'customer', render: (v) => <b>{v}</b> },
  { title: 'Date Created', dataIndex: 'date' },
  {
    title: 'Last Updated',
    dataIndex: 'updatedAt',
    sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
    render: (v) => fmtDateTime(v),
  },
  { title: 'Service', dataIndex: 'service' },
  { title: 'Status', dataIndex: 'status', render: (s) => <StatusTag status={s} /> },
  { title: 'Payment', dataIndex: 'payment', render: (s) => <StatusTag status={s} /> },
  { title: 'Total Fee', dataIndex: 'amount', render: (v) => <b>{peso(v)}</b> },
  { title: 'Staff (last updated by)', dataIndex: 'staff' },
];

const expanded = (row) => {
  const o = row.raw;
  return (
    <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', padding: '4px 8px' }}>
      <div style={{ minWidth: 260 }}>
        <b>Items</b>
        {o.items.map((i, n) => (
          <div key={n} style={{ color: '#475569', marginTop: 4 }}>
            {i.name}{i.serviceName ? ` (${i.serviceName})` : ''} · {i.qty} {i.unit || ''} × {peso(i.price)}
          </div>
        ))}
      </div>
      <div style={{ minWidth: 260 }}>
        <b>Order history</b>
        {o.statusHistory?.length ? (
          <Timeline
            style={{ marginTop: 12 }}
            items={[...o.statusHistory].reverse().map((h) => {
              const d = describe(h, o);
              return {
                children: (
                  <span>
                    <b>{d.label}</b> · {d.text} ·{' '}
                    <span style={{ color: '#94a3b8' }}>{fmtDateTime(h.at)}</span>
                  </span>
                ),
              };
            })}
          />
        ) : (
          <div style={{ color: '#94a3b8', marginTop: 4 }}>No history recorded for this order.</div>
        )}
      </div>
    </div>
  );
};

export default function History() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState('all');
  const [payment, setPayment] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await axios.get('http://localhost:8000/orders', { headers: { 'x-user-id': user.id } });
      setOrders(res.data);
    } catch (err) {
      message.error(err.response?.data?.error || 'Could not load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => orders.map((o) => {
    const last = lastChange(o);
    const creator = o.createdBy ? `${o.createdBy.firstName} ${o.createdBy.lastName}` : '—';
    return {
      key: o._id,
      id: `#${o.orderCode}`,
      customer: o.customerName,
      date: fmtDate(o.createdAt),
      updatedAt: last?.at ?? o.updatedAt ?? o.createdAt,   // last time the order changed
      service: serviceOf(o),
      status: o.status || 'Pending',
      payment: o.payment.status === 'paid' ? 'Paid' : 'Pending',
      amount: o.total,
      staff: last?.changedByName ?? creator,               // who made the last change
      raw: o,
    };
  }), [orders]);

  const serviceOptions = useMemo(
    () => [{ value: 'all', label: 'All Services' }, ...[...new Set(orders.flatMap((o) => o.items.map((i) => i.serviceName || i.name)))].map((n) => ({ value: n, label: n }))],
    [orders]
  );

  const shown = rows.filter((r) =>
    (service === 'all' || r.raw.items.some((i) => (i.serviceName || i.name) === service)) &&
    (payment === 'all' || r.payment === payment)
  );

  return (
    <div className="page-content">
      <div className="page-head">
        <div><h2>Order History</h2><span style={{ color: '#64748b' }}>Review past transactions and see how each order moved through the shop.</span></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
          <Button icon={<DownloadOutlined />}>Export CSV</Button>
        </div>
      </div>
      <Card>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 16 }}>
          <div><div style={{ fontWeight: 600, marginBottom: 6 }}>Service Type</div><Select value={service} onChange={setService} style={{ width: 200 }} options={serviceOptions} /></div>
          <div><div style={{ fontWeight: 600, marginBottom: 6 }}>Payment Status</div><Select value={payment} onChange={setPayment} style={{ width: 200 }} options={PAYMENTS} /></div>
          <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: 13 }}>Showing {shown.length} orders found</span>
        </div>
        <Table columns={columns} dataSource={shown} loading={loading} expandable={{ expandedRowRender: expanded }} pagination={{ pageSize: 6 }} scroll={{ x: true }} />
      </Card>
    </div>
  );
}