import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Button, Card, Input, Select, Table, Tag, Typography } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';

const API_URL = 'http://localhost:8000';
const PAGE_SIZE = 9;

const TYPES = ['Staff', 'Admin', 'Order', 'Service', 'Inventory', 'Customer'];

const TYPE_COLORS = {
  Staff: 'blue',
  Admin: 'purple',
  Order: 'cyan',
  Service: 'orange',
  Inventory: 'red',
  Customer: 'green',
};

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  ...TYPES.map((t) => ({ value: t, label: t })),
];

const ROLE_LABEL = { user: 'Customer', admin: 'Admin', staff: 'Staff' };

const columns = [
  { title: 'Date', dataIndex: 'dateText', width: 120 },
  { title: 'Time', dataIndex: 'timeText', width: 100 },
  {
    title: 'Type',
    dataIndex: 'type',
    width: 120,
    render: (t) => (
      <Tag color={TYPE_COLORS[t]} bordered={false}>
        {t}
      </Tag>
    ),
  },
  { title: 'Performed By', dataIndex: 'by', render: (v) => <b>{v}</b> },
  { title: 'Details', dataIndex: 'details' },
];

const formatDateText = (d) =>
  new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  });

const formatTimeText = (d) =>
  new Date(d).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila',
  });

const formatPerformer = (l) => {
  const role = l.performedByRole || l.performedBy?.role;
  const label = ROLE_LABEL[String(role).toLowerCase()];
  return label ? `${l.performedByName} (${label})` : l.performedByName;
};

const toRow = (l) => ({
  key: l._id,
  dateText: formatDateText(l.createdAt),
  timeText: formatTimeText(l.createdAt),
  by: formatPerformer(l),
  type: l.entityType,
  details: l.details,
});

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export default function ActionHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    axios
      .get(`${API_URL}/audit-logs`, { headers: { 'x-user-id': user?.id } })
      .then((res) => setLogs(res.data.map(toRow)))
      .catch((err) =>
        console.log('audit-logs failed:', err.response?.status, err.response?.data || err.message)
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter(
      (l) =>
        (type === 'all' || l.type === type) &&
        (!q || [l.by, l.type, l.details].some((v) => String(v ?? '').toLowerCase().includes(q)))
    );
  }, [logs, search, type]);

  const pageStart = (page - 1) * PAGE_SIZE;
  const shownOnPage = Math.max(0, Math.min(PAGE_SIZE, filtered.length - pageStart));

  const exportCsv = () => {
    const header = ['Date', 'Time', 'Performed By', 'Type', 'Details'].map(csvCell).join(',');
    const rows = filtered.map((l) =>
      [l.dateText, l.timeText, l.by, l.type, l.details].map(csvCell).join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `action-history-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="page-content">
      <div className="page-head">
        <div>
          <h2>Action History</h2>
          <span style={{ color: '#64748b' }}>
            A record of all actions made by admins and staff in the system.
          </span>
        </div>
        <Button icon={<DownloadOutlined />} onClick={exportCsv} disabled={!filtered.length}>
          Export Log
        </Button>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <Input
            allowClear
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search action history..."
            style={{ flex: 1, minWidth: 220, maxWidth: 420 }}
          />
          <Select
            value={type}
            onChange={(v) => {
              setType(v);
              setPage(1);
            }}
            style={{ width: 160 }}
            options={TYPE_OPTIONS}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          loading={loading}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            showSizeChanger: false,
            onChange: setPage,
          }}
          scroll={{ x: true }}
          footer={() => (
            <Typography.Text type="secondary">
              Showing {shownOnPage} of {filtered.length} actions
            </Typography.Text>
          )}
        />
      </Card>
    </div>
  );
}