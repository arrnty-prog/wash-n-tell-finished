// Reusable page: title + button + optional top banner + table + optional side panel.
import { Button, Input, Table, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function TablePage({ title, subtitle, actionLabel, onAction, actions, columns, data, banner, side }) {
  return (
    <div className="page-content">
      <div className="page-head">
        <div><h2>{title}</h2><span style={{ color: '#64748b' }}>{subtitle}</span></div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Visual search box. TODO(backend): hook up to filter the table */}
          <Input.Search placeholder="Search" style={{ width: 220 }} />
          {actions}
          {!actions && actionLabel && <Button type="primary" icon={<PlusOutlined />} onClick={onAction}>{actionLabel}</Button>}
        </div>
      </div>
      {banner}
      <Row gutter={16}>
        <Col xs={24} xl={side ? 17 : 24}>
          <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} scroll={{ x: true }} />
        </Col>
        {side && <Col xs={24} xl={7}>{side}</Col>}
      </Row>
    </div>
  );
}
