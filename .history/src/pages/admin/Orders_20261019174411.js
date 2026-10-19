import { Row, Col, Card, Tag } from 'antd';
import { kanban } from '../../data/mock';

const STAGES = { Received: '#64748b', Washing: '#2563eb', Drying: '#f59e0b', Folding: '#7c3aed', Ready: '#16a34a' };
const machineList = [
  { name: 'Washer 1', state: 'BUSY', color: 'red', note: '04:55 remaining' },
  { name: 'Washer 2', state: 'WASHING', color: 'blue', note: '04:50 remaining' },
  { name: 'Washer 3', state: 'READY', color: 'green', note: '' },
  { name: 'Washer 4', state: 'MAINTENANCE', color: 'red', note: '' },
  { name: 'Dryer 1', state: 'DRYING', color: 'purple', note: '15:00 remaining' },
  { name: 'Dryer 2', state: 'READY', color: 'green', note: '' },
];

export default function Orders() {
  return (
    <div className="page-content">
      <div className="page-head"><div><h2>Laundry Order Management</h2><span style={{ color: '#64748b' }}>Real-time workflow tracking for all laundry services.</span></div></div>
      <Row gutter={16}>
        <Col xs={24} xl={18}>
          <Row gutter={8} wrap={false} style={{ overflowX: 'auto' }}>
            {Object.entries(kanban).map(([stage, list]) => (
              <Col key={stage} flex="1 0 170px">
                <div style={{ fontWeight: 700, fontSize: 12, color: STAGES[stage], marginBottom: 8 }}>{stage.toUpperCase()} ({list.length})</div>
                {list.map((o) => (
                  <Card key={o.id} size="small" style={{ marginBottom: 8, borderTop: `3px solid ${STAGES[stage]}` }}>
                    <Tag color={stage === 'Ready' ? 'green' : 'blue'}>WASH & FOLD</Tag>
                    <div><b>{o.customer}</b></div>
                    <small style={{ color: '#94a3b8' }}>{o.id}</small>
                  </Card>
                ))}
              </Col>
            ))}
          </Row>
        </Col>
        <Col xs={24} xl={6}>
          <Card title="Machine Status" size="small" extra={<Tag color="green">LIVE</Tag>}>
            {machineList.map((m) => (
              <div key={m.name} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{m.name}</b><Tag color={m.color} style={{ margin: 0 }}>{m.state}</Tag></div>
                {m.note && <small style={{ color: '#94a3b8' }}>{m.note}</small>}
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
