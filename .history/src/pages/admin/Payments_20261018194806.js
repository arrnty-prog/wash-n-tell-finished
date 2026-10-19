import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Card, Button, Table, Typography, Space, Empty, Input, Tag, Segmented, Statistic, message } from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  PrinterOutlined,
  RiseOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

const muted = { color: '#bfbfbf' };
const dash = <span style={muted}>—</span>;

const peso = (n) =>
  '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const METHOD_COLORS = { Cash: '#10b981', GCash: '#7c3aed', Card: '#2563eb' };
const METHOD_LABELS = { cash: 'Cash', gcash: 'GCash', card: 'Card' };
const STATUS_COLORS = { Paid: 'green', Pending: 'orange' };

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function Payments() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('All');

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const getHeaders = () => ({ 'x-user-id': currentUser?.id });

  const load = async () => {
    try {
      // Payments are read straight from orders (payment.* fields on the Order model)
      const res = await axios.get('http://localhost:8000/orders', { headers: getHeaders() });

      const mapped = res.data.map((o) => ({
        key: o._id,
        orderId: o.orderCode,
        customer: o.customerName,
        amount: o.total,
        method: METHOD_LABELS[o.payment?.method],
        status: o.payment?.status === 'paid' ? 'Paid' : 'Pending',
        paidAt: o.payment?.paidAt ? new Date(o.payment.paidAt) : null,
      }));

      setRows(mapped);
    } catch (err) {
      console.log('load failed:', err.response?.status, err.response?.data || err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ---- summary figures ----
  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const paid = rows.filter((r) => r.status === 'Paid');
    const sum = (list) => list.reduce((t, r) => t + (r.amount || 0), 0);

    return {
      revenue: sum(paid),
      netWeek: sum(paid.filter((r) => r.paidAt && r.paidAt.getTime() >= weekAgo)),
      netMonth: sum(
        paid.filter((r) => {
          const now = new Date();
          return r.paidAt && r.paidAt.getMonth() === now.getMonth() && r.paidAt.getFullYear() === now.getFullYear();
        })
      ),
    };
  }, [rows]);

  // ---- payment method breakdown (paid only) ----
  const breakdown = useMemo(() => {
    const paid = rows.filter((r) => r.status === 'Paid');
    const total = paid.reduce((t, r) => t + (r.amount || 0), 0);
    return Object.keys(METHOD_COLORS).map((m) => {
      const value = paid.filter((r) => r.method === m).reduce((t, r) => t + (r.amount || 0), 0);
      return { method: m, value, pct: total ? Math.round((value / total) * 100) : 0 };
    });
  }, [rows]);

  const filteredRows = rows.filter((r) => {
    if (method !== 'All' && r.method !== method) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [r.orderId, r.customer, r.method, r.status, r.amount]
      .filter((f) => f !== undefined && f !== null)
      .some((field) => String(field).toLowerCase().includes(q));
  });

  // ---- actions ----
  const exportCsv = () => {
    if (!filteredRows.length) return message.info('Nothing to export');
    const header = ['Order ID', 'Customer', 'Amount', 'Method', 'Date Paid', 'Status'];
    const lines = filteredRows.map((r) =>
      [r.orderId, r.customer, r.amount, r.method, r.paidAt ? dateFormatter.format(r.paidAt) : '', r.status]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payments.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      render: (v) => <Typography.Text style={{ color: '#1677ff', fontWeight: 500 }}>#{v}</Typography.Text>,
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      sorter: (a, b) => (a.customer || '').localeCompare(b.customer || ''),
      render: (v) => <span style={{ fontWeight: 600 }}>{v || dash}</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
      render: (v) => <span style={{ fontWeight: 600 }}>{peso(v)}</span>,
    },
    {
      title: 'Method',
      dataIndex: 'method',
      render: (v) => (v ? <Tag bordered={false}>{v}</Tag> : dash),
    },
    {
      title: 'Date Paid',
      dataIndex: 'paidAt',
      sorter: (a, b) => (a.paidAt?.getTime() || 0) - (b.paidAt?.getTime() || 0),
      render: (d) => (d ? dateFormatter.format(d) : dash),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s) => <Tag color={STATUS_COLORS[s]}>{s}</Tag>,
    },
  ];

  // ---- donut (plain SVG, no chart library needed) ----
  const R = 70;
  const C = 2 * Math.PI * R;
  const totalPct = breakdown.reduce((t, b) => t + b.pct, 0);
  let offset = 0;

  const summaryCard = (icon, bg, color, label, value, extra = {}) => (
    <Card style={{ flex: 1, minWidth: 220, ...extra.card }} styles={{ body: { padding: 20 } }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: bg,
            color,
            display: 'grid',
            placeItems: 'center',
            fontSize: 20,
          }}
        >
          {icon}
        </div>
        <Statistic title={label} value={value} formatter={(v) => peso(v)} valueStyle={{ fontSize: 26 }} />
      </div>
    </Card>
  );

  return (
    <div className="page-content">
      <div className="page-head">
        <div>
          <h2>Payment Management</h2>
          <span style={{ color: '#64748b', display: 'block', marginTop: 3 }}>
            Monitor all incoming transactions and financial health.
          </span>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={exportCsv}>Export CSV</Button>
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>Print Report</Button>
        </Space>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <Card
          style={{ flex: 1, minWidth: 220, background: '#2563eb', border: 'none' }}
          styles={{ body: { padding: 20 } }}
        >
          <Statistic
            title={<span style={{ color: '#dbeafe' }}>Total Revenue</span>}
            value={stats.revenue}
            formatter={(v) => peso(v)}
            valueStyle={{ color: '#fff', fontSize: 26 }}
          />
        </Card>
        {summaryCard(<RiseOutlined />, '#d1fae5', '#10b981', 'Net This Week', stats.netWeek)}
        {summaryCard(<CalendarOutlined />, '#ede9fe', '#7c3aed', 'Net This Month', stats.netMonth)}
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Ledger */}
        <Card title="Transaction Ledger" style={{ flex: '1 1 640px', minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <Input
              allowClear
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <Segmented options={['All', 'GCash', 'Card', 'Cash']} value={method} onChange={setMethod} />
          </div>

          <Table
            className="customer-table"
            columns={columns}
            dataSource={filteredRows}
            pagination={{ pageSize: 6 }}
            scroll={{ x: true }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={search || method !== 'All' ? 'No transactions match your filters' : 'No transactions yet'}
                />
              ),
            }}
          />
        </Card>

        {/* Payment methods */}
        <Card title="Payment Methods" style={{ flex: '0 0 340px', maxWidth: '100%' }}>
          <div style={{ display: 'grid', placeItems: 'center', marginBottom: 20 }}>
            <svg width="190" height="190" viewBox="0 0 190 190" role="img" aria-label="Payment methods breakdown">
              <g transform="rotate(-90 95 95)">
                <circle cx="95" cy="95" r={R} fill="none" stroke="#f0f0f0" strokeWidth="22" />
                {totalPct > 0 &&
                  breakdown.map((b) => {
                    const len = (b.pct / 100) * C;
                    const el = (
                      <circle
                        key={b.method}
                        cx="95"
                        cy="95"
                        r={R}
                        fill="none"
                        stroke={METHOD_COLORS[b.method]}
                        strokeWidth="22"
                        strokeDasharray={`${len} ${C - len}`}
                        strokeDashoffset={-offset}
                      />
                    );
                    offset += len;
                    return el;
                  })}
              </g>
            </svg>
          </div>

          <Space direction="vertical" style={{ width: '100%' }} size={10}>
            {breakdown.map((b) => (
              <div key={b.method} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{ width: 8, height: 8, borderRadius: '50%', background: METHOD_COLORS[b.method] }}
                  />
                  {b.method}
                </span>
                <span style={{ fontWeight: 600 }}>{b.pct}%</span>
              </div>
            ))}
          </Space>
        </Card>
      </div>
    </div>
  );
}