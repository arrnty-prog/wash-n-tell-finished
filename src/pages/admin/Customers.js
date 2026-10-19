import { useEffect, useState } from 'react';
import axios from 'axios';
import AddCustomerModal from '../../components/modals/AddCustomerModal';
import EditCustomerModal from '../../components/modals/EditCustomerModal';
import { Card, Button, Table, Typography, Space, Avatar, Empty, Input, Tag, Popconfirm, Tooltip, message } from 'antd';
import { EditOutlined, SearchOutlined, InboxOutlined, UndoOutlined } from '@ant-design/icons';

const muted = { color: '#bfbfbf' };
const dash = <span style={muted}>—</span>;

export default function Customers() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // used by the edit modal later

  const getHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return { 'x-user-id': user?.id };
  };

  const load = async () => {
  try {
    const headers = getHeaders();

    const [accountsRes, ordersRes] = await Promise.all([
      axios.get('http://localhost:8000/getAccounts', { params: { role: 'user' }, headers }),
      axios.get('http://localhost:8000/orders', { headers }),
    ]);

    const totalsByCustomer = {};
    for (const order of ordersRes.data) {
      if (order.status === 'Cancelled') continue;
      const customerId = String(order.customer);
      if (!totalsByCustomer[customerId]) {
        totalsByCustomer[customerId] = { orders: 0, spent: 0 };
      }
      totalsByCustomer[customerId].orders += 1;
      totalsByCustomer[customerId].spent += Number(order.total ?? 0);
    }

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const mapped = accountsRes.data.map((a) => {
      const totals = totalsByCustomer[String(a._id)] || { orders: 0, spent: 0 };
      return {
        key: a._id,
        id: a.userCode,
        firstName: a.firstName,
        lastName: a.lastName,
        name: `${a.firstName} ${a.lastName}`,
        email: a.email,
        phone: a.phone,
        address: a.address,
        status: a.status,
        date: dateFormatter.format(new Date(a.createdAt)),
        totalOrders: totals.orders,
        spent: totals.spent,
      };
    });

    mapped.sort((a, b) => {
      const aArchived = a.status === 'Archived' ? 1 : 0;
      const bArchived = b.status === 'Archived' ? 1 : 0;
      return aArchived - bArchived;
    });

    setRows(mapped);
  } catch (err) {
    console.log('load failed:', err.response?.status, err.response?.data || err.message);
  }
};

useEffect(() => {
  load();
}, []);

  const toggleArchive = async (record) => {
    try {
      await axios.put(
        `http://localhost:8000/accounts/${record.key}`,
        { status: record.status === 'Archived' ? 'Active' : 'Archived' },
        { headers: getHeaders() }
      );
      message.success(record.status === 'Archived' ? 'Customer restored' : 'Customer archived');
      load();
    } catch (err) {
      message.error(err.response?.data?.error || 'Action failed');
    }
  };

  const filteredRows = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [r.id, r.name, r.email, r.phone]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q));
  });

  const columns = [
    {
      title: 'Customer Id',
      dataIndex: 'id',
      render: (v) => (
        <Typography.Text style={{ fontFamily: 'monospace', color: '#8c8c8c', fontSize: 13 }}>
          {v}
        </Typography.Text>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }}>
            {name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    { title: 'Phone', dataIndex: 'phone', render: (v) => v || dash },
    { title: 'Address', dataIndex: 'address', render: (v) => v || dash },
    { title: 'Date Created', dataIndex: 'date' },
    {
      title: 'Total Orders',
      dataIndex: 'totalOrders',
      align: 'right',
      sorter: (a, b) => a.totalOrders - b.totalOrders,
      render: (v) => (v === 0 ? <span style={muted}>0</span> : v),
    },
    {
      title: 'Total Spent',
      dataIndex: 'spent',
      align: 'right',
      sorter: (a, b) => a.spent - b.spent,
      render: (v) =>
        v === 0 ? (
          <span style={muted}>₱0.00</span>
        ) : (
          <span style={{ fontWeight: 600 }}>
            ₱{Number(v).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        ),
    },
    {
  title: 'Status',
  dataIndex: 'status',
  sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
  render: (status) =>
    status === 'Archived' ? <Tag>Archived</Tag> : <Tag color="green">Active</Tag>,
},
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button size="small" icon={<EditOutlined />} onClick={() => setEditing(record)} />
          </Tooltip>
          <Popconfirm
            title={record.status === 'Archived' ? 'Restore this customer?' : 'Archive this customer?'}
            onConfirm={() => toggleArchive(record)}
          >
            <Tooltip title={record.status === 'Archived' ? 'Restore' : 'Archive'}>
              <Button
                size="small"
                icon={record.status === 'Archived' ? <UndoOutlined /> : <InboxOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-content">
      <div className="page-head">
        <div>
          <h2>Customer Management</h2>
          <span style={{ color: '#64748b', display: 'block', marginTop: 3 }}>
            Manage customer accounts, view order frequencies, and assist users.
          </span>
        </div>
        <Space>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
          />
          <Button type="primary" onClick={() => setOpen(true)}>Add New Customer</Button>
        </Space>
      </div>

      <Card>
        <Table
          className="customer-table"
          rowClassName={(r) => (r.status === 'Archived' ? 'row-archived' : '')}
          columns={columns}
          dataSource={filteredRows}
          pagination={{ pageSize: 6 }}
          scroll={{ x: true }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={search ? 'No customers match your search' : 'No customers yet'}
              />
            ),
          }}
        />
        <AddCustomerModal open={open} onClose={() => setOpen(false)} onSaved={load} />
        <EditCustomerModal customer={editing} onClose={() => setEditing(null)} onSaved={load} />
      </Card>
    </div>
  );
}