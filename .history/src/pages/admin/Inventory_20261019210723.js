import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Alert, Button, Card, Empty, Input, List, Row, Col, Select, Space, Table, Tag, Tooltip, Popconfirm, message } from 'antd';
import { WarningOutlined, SearchOutlined, EditOutlined, InboxOutlined, UndoOutlined, PlusOutlined, SwapOutlined, DownloadOutlined } from '@ant-design/icons';
import InfoBox from '../../components/ui/InfoBox';
import StatusTag from '../../components/ui/StatusTag';
import InventoryItemModal from '../../components/modals/InventoryItemModal';
import AdjustStockModal from '../../components/modals/AdjustStockModal';

const API = 'http://localhost:8000';
const headers = () => ({ 'x-user-id': JSON.parse(localStorage.getItem('user'))?.id });
const fmt = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 3 });

const CATEGORIES = ['Cleaning Supplies', 'Dry Cleaning Supplies', 'Packaging', 'Other'];
const UNIT_SHORT = { Liters: 'L', Gallons: 'gal', Kg: 'kg', Pcs: 'pcs' };
const PER = { wash_and_fold: 'per kg (fold)', dry_clean: 'per pc (dry clean)', iron: 'per pc (iron)', wash_and_iron: 'per pc (wash+iron)', carpet: 'per sq m (carpet)', order: 'per order' };

const stockStatus = (r) => (r.quantity <= 0 ? 'Out of Stock' : r.quantity < r.minimum ? 'Low Stock' : 'In Stock');
const needsAttention = (r) => stockStatus(r) !== 'In Stock';

const exportCsv = (rows) => {
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [['Item', 'Brand', 'Category', 'Quantity', 'Unit', 'Minimum', 'Status'].map(cell).join(',')]
    .concat(rows.map((r) => [r.name, r.brand, r.category, r.quantity, r.unit, r.minimum, stockStatus(r)].map(cell).join(',')));
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventory.csv';
  a.click();
  URL.revokeObjectURL(url);
};

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const [showArchive, setShowArchive] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [onlyAttention, setOnlyAttention] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [adjusting, setAdjusting] = useState(null);

  const load = useCallback(async () => {
  setLoading(true);
  const [inv, logs] = await Promise.allSettled([
    axios.get(`${API}/inventory`, { headers: headers(), params: { archived: showArchive } }),
    axios.get(`${API}/audit-logs`, { headers: headers(), params: { type: 'Inventory' } }),
  ]);

  if (inv.status === 'fulfilled') {
    console.log('inventory response:', inv.value.data); // check the shape
    setItems(Array.isArray(inv.value.data) ? inv.value.data : inv.value.data.items ?? []);
    setUpdatedAt(new Date());
  } else {
    console.error(inv.reason);
    message.error(inv.reason.response?.data?.error || 'Could not load inventory');
  }

  if (logs.status === 'fulfilled') setActivity(logs.value.data.slice(0, 8));
  setLoading(false);
}, [showArchive])

  useEffect(() => { load(); }, [load]);

  const act = async (request, okText) => {
    try {
      await request();
      message.success(okText);
      load();
    } catch (err) {
      message.error(err.response?.data?.error || 'Action failed');
    }
  };

  const toggleArchive = (r) =>
    act(() => axios.patch(`${API}/inventory/${r._id}/archive`, { archived: !r.archived }, { headers: headers() }), r.archived ? 'Item restored' : 'Item archived');

  const attention = items.filter(needsAttention);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((r) =>
      (category === 'all' || r.category === category) &&
      (!onlyAttention || needsAttention(r)) &&
      (!q || [r.name, r.brand, r.category].some((f) => String(f || '').toLowerCase().includes(q)))
    );
  }, [items, search, category, onlyAttention]);

  const columns = [
    {
      title: 'Item', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name),
      render: (v, r) => (<div><b>{v}</b>{r.brand && <div style={{ fontSize: 12, color: '#94a3b8' }}>{r.brand}</div>}</div>),
    },
    { title: 'Category', dataIndex: 'category' },
    {
      title: 'Current Level', dataIndex: 'quantity', sorter: (a, b) => a.quantity - b.quantity,
      render: (_, r) => <b style={{ color: needsAttention(r) ? '#ef4444' : '#16a34a' }}>{fmt(r.quantity)} {r.unit}</b>,
    },
    { title: 'Min. Required', render: (_, r) => <span style={{ color: '#64748b' }}>{fmt(r.minimum)} {r.unit}</span> },
    { title: 'Status', render: (_, r) => <StatusTag status={stockStatus(r)} /> },
    {
      title: 'Auto-usage',
      render: (_, r) => (r.usage?.length
        ? <Space size={[4, 4]} wrap>{r.usage.map((u) => <Tag key={u.service} bordered={false}>{fmt(u.amount)} {UNIT_SHORT[r.unit]} {PER[u.service]}</Tag>)}</Space>
        : <span style={{ color: '#bfbfbf' }}>manual only</span>),
    },
    {
      title: 'Action', align: 'center',
      render: (_, r) => (
        <Space>
          {!r.archived && <Tooltip title="Update stock"><Button size="small" icon={<SwapOutlined />} onClick={() => setAdjusting(r)} /></Tooltip>}
          {!r.archived && <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => setEditing(r)} /></Tooltip>}
          <Popconfirm title={r.archived ? 'Restore this item?' : 'Archive this item?'} onConfirm={() => toggleArchive(r)}>
            <Tooltip title={r.archived ? 'Restore' : 'Archive'}><Button size="small" icon={r.archived ? <UndoOutlined /> : <InboxOutlined />} /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const isEmpty = !loading && items.length === 0 && !showArchive;

  return (
    <div className="page-content">
      <div className="page-head">
        <div><h2>Inventory Management</h2><span style={{ color: '#64748b' }}>Track supply levels and manage warehouse stock.</span></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<DownloadOutlined />} onClick={() => exportCsv(items)} disabled={items.length === 0}>Export Inventory</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>Add Item</Button>
        </div>
      </div>
      <Row gutter={16}>
        <Col xs={24} xl={17}>
          {!showArchive && attention.length > 0 && (
            <Alert type="error" style={{ marginBottom: 16 }} icon={<WarningOutlined />} showIcon message={<b>Low Inventory Alert</b>}
              description={`${attention.length} item${attention.length === 1 ? ' is' : 's are'} low or out of stock. Reorder needed.`}
              action={<Button danger type="primary" size="small" onClick={() => setOnlyAttention((v) => !v)}>{onlyAttention ? 'SHOW ALL' : 'REVIEW ALERTS'}</Button>} />
          )}

          <Card title={showArchive ? 'Archived Items' : 'Current Stock Tracking'} extra={updatedAt && <small style={{ color: '#94a3b8' }}>Last updated: {updatedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</small>}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              <Input allowClear prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} placeholder="Search supplies or brands..." style={{ flex: 1, minWidth: 220 }} value={search} onChange={(e) => setSearch(e.target.value)} />
              <Select value={category} onChange={setCategory} style={{ width: 200 }}
                options={[{ value: 'all', label: 'All Categories' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]} />
              <Button icon={<InboxOutlined />} type={showArchive ? 'primary' : 'default'} onClick={() => { setShowArchive((v) => !v); setOnlyAttention(false); }}>
                {showArchive ? 'Back to Stock' : 'View Archive'}
              </Button>
            </div>
            <Table
              rowKey="_id" columns={columns} dataSource={rows} loading={loading} pagination={{ pageSize: 8 }} scroll={{ x: true }}
              locale={{
                emptyText: isEmpty
                  ? (<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No supplies yet">
                      <Space><Button type="primary" onClick={() => setAddOpen(true)}>Add Item</Button></Space>
                    </Empty>)
                  : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={showArchive ? 'Nothing archived' : 'No items match'} />,
              }}
              footer={() => <span style={{ color: '#64748b' }}>Showing {rows.length} supply items</span>}
            />
          </Card>
        </Col>
        <Col xs={24} xl={7}>
          <Card title="Recent Inventory Activity" size="small" style={{ marginBottom: 16 }}>
            <List
              size="small" dataSource={activity} locale={{ emptyText: 'No inventory activity yet' }}
              renderItem={(a) => (
                <List.Item>
                  <List.Item.Meta
                    title={<span style={{ fontSize: 13, fontWeight: 500 }}>{a.details}</span>}
                    description={`${a.performedByName} • ${new Date(a.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`}
                  />
                </List.Item>
              )}
            />
            <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 8 }}>The full record is in Action History.</div>
          </Card>
          <InfoBox title="AUTOMATIC USAGE">Each order takes its supplies out of stock (e.g. detergent per kg of Wash and Fold). Edit an item to change how much it uses.</InfoBox>
          <InfoBox title="STOCK COUNT POLICY">Manual physical inventory audit is required every Sunday at 8:00 PM. Use "Set counted amount" to correct the records.</InfoBox>
        </Col>
      </Row>

      <InventoryItemModal open={addOpen || !!editing} item={editing} onClose={() => { setAddOpen(false); setEditing(null); }} onSaved={load} />
      <AdjustStockModal item={adjusting} onClose={() => setAdjusting(null)} onSaved={load} />
    </div>
  );
}
