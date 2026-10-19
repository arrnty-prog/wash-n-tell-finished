// Laundry order workflow board (kanban only)
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Popconfirm, Tag, Typography, message } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';

const FLOW = ['Pending', 'Washing', 'Drying', 'Folding', 'Ready', 'Completed'];
const LABEL = { Pending: 'Pending', Washing: 'Washing', Drying: 'Drying', Folding: 'Folding', Ready: 'Ready', Completed: 'Completed' };
const COLUMNS = FLOW.slice(0, -1); // "Completed" has no column; the card leaves the board
const FINAL_ACTION = { pickup: 'Mark as Picked Up', delivery: 'Mark as Delivered' };
const REFRESH_MS = 15000;

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return { 'x-user-id': user?.id ?? user?._id };
};

const normalize = (o) => ({
  id: String(o._id ?? o.id),
  code: o.orderCode ?? String(o._id ?? o.id).slice(-6).toUpperCase(), // short order number
  customer: o.customerName ?? o.customer?.name ?? 'Customer',
  fulfillment: o.fulfillment?.type ?? o.fulfillment ?? 'pickup',
  status: FLOW.includes(o.status) ? o.status : 'Pending',
  updatedAt: o.updatedAt ?? o.createdAt,
  items: (o.items ?? []).map((i) => ({
    service: i.service ?? i.serviceName ?? i.name ?? 'Service',
  })),
});

const hoursAgo = (iso) => {
  if (!iso) return '';
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  return hours < 1 ? '<1h ago' : `${hours}h ago`;
};

function OrderCard({ order, onMove }) {
  const i = FLOW.indexOf(order.status);
  const next = FLOW[i + 1];
  const prev = FLOW[i - 1];
  const isReady = order.status === 'Ready';
  const isDelivery = order.fulfillment === 'delivery';
  const finalText = FINAL_ACTION[order.fulfillment] ?? FINAL_ACTION.pickup;

  return (
    <Card
      size="small"
      style={{ borderRadius: 12, ...(isReady ? { background: '#f0fdf4', borderColor: '#86efac' } : {}) }}
      styles={{ body: { padding: 12 } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 4 }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Tag bordered={false} style={{ margin: 0 }}>{order.items[0]?.service}</Tag>
          {order.items.length > 1 && <Tag bordered={false} style={{ margin: 0 }}>+{order.items.length - 1}</Tag>}
          <Tag bordered={false} color={isDelivery ? 'purple' : 'cyan'} style={{ margin: 0 }}>
            {isDelivery ? 'Delivery' : 'Pickup'}
          </Tag>
        </div>
        <Typography.Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>#{order.code}</Typography.Text>
      </div>

      <Typography.Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>{order.customer}</Typography.Text>

      <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
        <ClockCircleOutlined /> Updated {hoursAgo(order.updatedAt)}
      </div>

      {isReady ? (
        <Popconfirm
          title={`${finalText}?`}
          description={`Order #${order.code} will be marked completed and leave the board.`}
          okText="Yes, confirm"
          cancelText="Cancel"
          onConfirm={() => onMove(order.id, 'Completed')}
        >
          <Button
            type="primary"
            block
            size="large"
            style={{ marginBottom: 8, background: '#16a34a', borderColor: '#16a34a' }}
          >
            {finalText} <ArrowRightOutlined />
          </Button>
        </Popconfirm>
      ) : (
        next && (
          <Button
            type="primary"
            block
            size="large"
            style={{ marginBottom: 8 }}
            onClick={() => onMove(order.id, next)}
          >
            Move to {LABEL[next]} <ArrowRightOutlined />
          </Button>
        )
      )}

      {prev && (
        <Button block icon={<ArrowLeftOutlined />} onClick={() => onMove(order.id, prev)}>
          Back to {LABEL[prev]}
        </Button>
      )}
    </Card>
  );
}

export default function UpdateStatus() {
  const [orders, setOrders] = useState([]);
  const ordersRef = useRef(orders);
  ordersRef.current = orders;

  const load = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:8000/orders', { headers: getHeaders() });
      const data = res.data;
      const list = Array.isArray(data) ? data : data.orders ?? data.data ?? [];
      setOrders(list.map(normalize));
    } catch (err) {
      console.error('Load orders failed:', err);
      const reason = err.response
        ? `server returned ${err.response.status}`
        : err.request
          ? 'no response (API down, wrong URL, or CORS)'
          : err.message;
      message.error(`Could not load orders: ${reason}`);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const moveOrder = async (id, status) => {
    const previous = ordersRef.current;
    const code = previous.find((o) => o.id === id)?.code ?? id;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o)));
    try {
      await axios.patch(
        `http://localhost:8000/orders/${id}/status`,
        { status },
        { headers: getHeaders() }
      );
      message.success(`Order #${code} moved to ${LABEL[status]}`);
    } catch (err) {
      console.error('Update status failed:', err.response?.status, err.response?.data, err);
      setOrders(previous);
      const reason = err.response
        ? `${err.response.status} ${err.response.data?.error ?? err.response.data?.message ?? ''}`
        : 'no response from server';
      message.error(`Could not update order #${code}: ${reason}`);
    }
  };

  const onDragEnd = ({ draggableId, source, destination }) => {
    if (!destination || destination.droppableId === source.droppableId) return;
    moveOrder(draggableId, destination.droppableId);
  };

  const active = orders.filter((o) => o.status !== 'Completed');

  return (
    <div className="page-content">
      <div className="page-head">
        <div>
          <h2>Laundry Order Management</h2>
          <span style={{ color: '#64748b' }}>Real-time workflow tracking for all laundry services.</span>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', alignItems: 'flex-start', paddingBottom: 8 }}>
          {COLUMNS.map((stage) => {
            const items = active.filter((o) => o.status === stage);
            return (
              <div
                key={stage}
                style={{ flex: '1 0 230px', maxWidth: 320, background: '#e9edf8', borderRadius: 16, padding: 12 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Typography.Text strong>{LABEL[stage]}</Typography.Text>
                  <span
                    style={{
                      background: '#fff', borderRadius: 999, minWidth: 24, height: 24, padding: '0 8px',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                    }}
                  >
                    {items.length}
                  </span>
                </div>

                <Droppable droppableId={stage}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        minHeight: 120, borderRadius: 12, transition: 'background 0.15s',
                        background: snapshot.isDraggingOver ? '#d9e1f5' : 'transparent',
                      }}
                    >
                      {items.map((o, index) => (
                        <Draggable key={o.id} draggableId={o.id} index={index}>
                          {(p) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                              style={{ ...p.draggableProps.style, marginBottom: 12 }}
                            >
                              <OrderCard order={o} onMove={moveOrder} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}