import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button, Table, Typography, Space, Avatar, Empty, Input, Tag, Popconfirm, Tooltip, message } from 'antd';
import { EditOutlined, SearchOutlined, InboxOutlined, UndoOutlined, PlusOutlined, UserAddOutlined } from '@ant-design/icons';
import AddAdminModal from '../../components/modals/AddAdminModal';
import AddStaffModal from '../../components/modals/AddStaffModal';
import EditStaffModal from '../../components/modals/EditStaffModal';

const muted = { color: '#bfbfbf' };
const dash = <span style={muted}>—</span>;

export default function Staff() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user'));

  const getHeaders = () => ({ 'x-user-id': currentUser?.id });

  const load = async () => {
    try {
      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const res = await axios.get('http://localhost:8000/getAccounts', { headers: getHeaders() });

      const mapped = res.data
        .filter((a) => a.role !== 'user')
        .map((a) => ({
          key: a._id,
          id: a.userCode,
          firstName: a.firstName,
          lastName: a.lastName,
          name: `${a.firstName} ${a.lastName}`,
          email: a.email,
          role: a.role,
          phone: a.phone,
          status: a.status,
          date: dateFormatter.format(new Date(a.createdAt)),
        }));

      // put active first before archived
      mapped.sort((a, b) => (a.status === 'Archived' ? 1 : 0) - (b.status === 'Archived' ? 1 : 0));

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
      message.success(record.status === 'Archived' ? 'Account restored' : 'Account archived');
      load();
    } catch (err) {
      message.error(err.response?.data?.error || 'Action failed');
    }
  };

  const filteredRows = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [r.id, r.name, r.email, r.phone, r.role, r.position]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q));
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      render: (v) => (
        <Typography.Text style={{ fontFamily: 'monospace', color: '#8c8c8c', fontSize: 13 }}>{v}</Typography.Text>
      ),
    },
    {
      title: 'Name',
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
    {
      title: 'Role',
      dataIndex: 'role',
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Staff', value: 'staff' },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => (role === 'admin' ? <Tag color="purple">Admin</Tag> : <Tag color="blue">Staff</Tag>),
    },
    { title: 'Phone', dataIndex: 'phone', render: (v) => v || dash },
    { title: 'Date Created', dataIndex: 'date' },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
      render: (status) => (status === 'Archived' ? <Tag>Archived</Tag> : <Tag color="green">Active</Tag>),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => {
        const isSelf = record.key === currentUser?.id;
        return (
          <Space>
            <Tooltip title="Edit">
              <Button size="small" icon={<EditOutlined />} onClick={() => setEditing(record)} />
            </Tooltip>
            <Popconfirm
              title={record.status === 'Archived' ? 'Restore this account?' : 'Archive this account?'}
              onConfirm={() => toggleArchive(record)}
              disabled={isSelf}
            >
              <Tooltip title={isSelf ? "You can't archive yourself" : record.status === 'Archived' ? 'Restore' : 'Archive'}>
                <Button
                  size="small"
                  disabled={isSelf}
                  icon={record.status === 'Archived' ? <UndoOutlined /> : <InboxOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="page-content">
      <div className="page-head">
        <div>
          <h2>User & Staff Management</h2>
          <span style={{ color: '#64748b', display: 'block', marginTop: 3 }}>
            Manage roles, shifts, and permissions.
          </span>
        </div>
        <Space>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
          <Button icon={<UserAddOutlined />} onClick={() => setAdminOpen(true)}>Add New Admin</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setStaffOpen(true)}>Add New Staff</Button>
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
                description={search ? 'No accounts match your search' : 'No staff yet'}
              />
            ),
          }}
        />
        <AddAdminModal open={adminOpen} onClose={() => setAdminOpen(false)} onSaved={load} />
        <AddStaffModal open={staffOpen} onClose={() => setStaffOpen(false)} onSaved={load} />
        <EditStaffModal account={editing} onClose={() => setEditing(null)} onSaved={load} />
      </Card>
    </div>
  );
}