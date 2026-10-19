import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Collapse, Divider, Tag, Empty, Radio, Tooltip, Avatar } from 'antd';
import { UserOutlined, FileTextOutlined, DeleteOutlined, ShoppingCartOutlined, CarOutlined, ShopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import WashAndFoldContent from '../../components/ui/WashAndFoldContent';
import PerPieceContent from '../../components/ui/PerPieceContent';
import CarpetAndRugContent from '../../components/ui/CarpetAndRugContent';
import CustomerSelect from '../../components/ui/CustomerSelect';

import { useOrderDraft, getTotals } from '../../context/OrderContext';

const cardStyle = { borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' };
const headerStyle = { borderBottom: '1px solid #f1f5f9', fontSize: 16, fontWeight: 700 };
const ptitle = { display: 'flex', alignItems: 'center', gap: 10, color: '#0f172a' };
const iconBadge = {
  width: 30, height: 30, borderRadius: 8, color: '#fff', fontSize: 15,
  display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#38bdf8,#2563eb)',
};
const label = { margin: '0 0 8px', color: '#64748b', fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' };
const row = { display: 'flex', justifyContent: 'space-between', color: '#64748b' };

const Title = ({ icon, children }) => (
  <span style={ptitle}><span style={iconBadge}>{icon}</span>{children}</span>
);

export default function CreateOrder() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [items, setItems] = useState([]);

  const { draft, updateDraft, setOrderCart } = useOrderDraft();
  const { orderCart, customerDetails, fulfillment } = draft;
  const { subtotal, deliveryFee, total, taxAmount } = getTotals(draft);

  const PRICE_KEY = { 'Dry Clean': 'dry_clean', 'Wash and Iron': 'wash_and_iron', 'Ironing': 'iron' };

  const handleCustomerSelect = (customerId, details) => {
    updateDraft({ customerId, customerDetails: details });
  };

  const setFulfillment = (value) => updateDraft({ fulfillment: value });

  const setCartQty = (item, qty) => {
    setOrderCart((prev) => {
      const next = { ...prev };
      if (!qty || qty <= 0) delete next[item.id];
      else next[item.id] = { ...item, qty };
      return next;
    });
  };

  const addToCart = (cartItem) =>
    setOrderCart((prev) => ({ ...prev, [cartItem._id || cartItem.id]: cartItem }));

  const removeFromCart = (cartKey) =>
    setOrderCart((prev) => {
      const next = { ...prev };
      delete next[cartKey];
      return next;
    });

  useEffect(() => {
    axios.get('http://localhost:8000/items')
      .then((res) => setItems(res.data))
      .catch((err) => console.error('Error fetching items:', err));

    axios.get('http://localhost:8000/services')
      .then((res) => setServices(res.data))
      .catch((err) => console.error('Error fetching services:', err));
  }, []);

  const renderServiceUi = (service) => {
    switch (service.name) {
      case 'Wash and Fold':
        return <WashAndFoldContent onAdd={addToCart} service={service} />;
      case 'Carpet Cleaning':
        return <CarpetAndRugContent setQty={addToCart} service={service} />;
      default:
        return <PerPieceContent priceKey={PRICE_KEY[service.name]} serviceName={service.name} items={items} orderCart={orderCart} setQty={setCartQty} />;
    }
  };

  const collapseItems = services.map((service) => ({
    key: service._id,
    label: <b style={{ color: '#0f172a' }}>{service.name}</b>,
    children: renderServiceUi(service),
    style: { background: '#fff', borderRadius: 12, marginBottom: 10, border: '1px solid #e2e8f0' },
  }));

  const handleProceed = () => navigate('/payment');

  const hasItems = Object.keys(orderCart).length > 0;
  const initials = `${customerDetails?.firstName?.[0] || ''}${customerDetails?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="page-content">
      <div className="page-head">
        <div>
          <h2 style={{ fontWeight: 800, color: '#0f172a' }}>Create Laundry Order</h2>
          <span style={{ color: '#64748b' }}>Select a customer, choose services, and place the order.</span>
        </div>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} xl={17}>
          <Card style={{ ...cardStyle, marginBottom: 20 }} styles={{ header: headerStyle }} title={<Title icon={<UserOutlined />}>Customer Information</Title>}>
            <div style={{ marginBottom: 14 }}>
              <CustomerSelect onSelectCustomer={handleCustomerSelect} />
            </div>

            {customerDetails ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f0f7ff', border: '1px solid #cfe2ff', borderRadius: 12, padding: '12px 16px' }}>
                <Avatar size={44} style={{ background: 'linear-gradient(135deg,#38bdf8,#2563eb)', fontWeight: 700 }}>{initials}</Avatar>
                <div>
                  <b style={{ fontSize: 15, color: '#0f172a' }}>{customerDetails.firstName} {customerDetails.lastName}</b>{' '}
                  <span style={{ color: '#64748b' }}>({customerDetails.phone})</span>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {customerDetails.email}<br />{customerDetails.address}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: '#fff5f5', border: '1px dashed #ff8f8f', borderRadius: 12, padding: '12px 16px' }}>
                <Tag color="error" style={{ margin: 0 }}>No Customer Selected</Tag>
              </div>
            )}
          </Card>

          <Card style={cardStyle} styles={{ header: headerStyle }} title={<Title icon={<FileTextOutlined />}>Laundry Items & Services</Title>}>
            <Collapse accordion ghost items={collapseItems} />
          </Card>
        </Col>

        <Col xs={24} xl={7}>
          <Card
            title={<Title icon={<ShoppingCartOutlined />}>Order Draft Summary</Title>}
            style={{ ...cardStyle, position: 'sticky', top: 16 }}
            styles={{ header: headerStyle, body: { padding: 20 } }}
          >
            <h4 style={label}>Customer</h4>
            {customerDetails ? (
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontWeight: 600, color: '#0f172a' }}>
                <UserOutlined style={{ marginRight: 8, color: '#2563eb' }} />
                {customerDetails.firstName} {customerDetails.lastName}
              </div>
            ) : (
              <div style={{ background: '#fff5f5', padding: '10px 12px', borderRadius: 10, border: '1px dashed #ff8f8f' }}>
                <Tag color="error" style={{ margin: 0 }}>No Customer Selected</Tag>
              </div>
            )}

            <Divider style={{ margin: '16px 0' }} />

            {/* Fulfillment */}
            <h4 style={label}>Fulfillment Option</h4>
            <Radio.Group
              value={fulfillment}
              onChange={(e) => setFulfillment(e.target.value)}
              optionType="button"
              buttonStyle="solid"
              style={{ width: '100%', display: 'flex' }}
            >
              <Radio.Button value="pickup" style={{ flex: 1, textAlign: 'center' }}>
                <ShopOutlined style={{ marginRight: 4 }} /> Store Pickup
              </Radio.Button>
              <Radio.Button value="delivery" style={{ flex: 1, textAlign: 'center' }}>
                <CarOutlined style={{ marginRight: 4 }} /> Delivery
              </Radio.Button>
            </Radio.Group>

            <Divider style={{ margin: '16px 0' }} />

            {/* Items */}
            <h4 style={label}>Order Items</h4>

            {!hasItems ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No items added yet" />
            ) : (
              <>
                {Object.entries(orderCart).map(([cartKey, cartItem]) => (
                  <div key={cartKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed #e2e8f0' }}>
                    <div>
                      <strong style={{ fontSize: 14, display: 'block', color: '#0f172a' }}>{cartItem.name}</strong>
                      <span style={{ color: '#64748b', fontSize: 12 }}>
                        {cartItem.serviceName && `${cartItem.serviceName} · `}
                        ₱{Number(cartItem.price || 0).toFixed(2)} × {cartItem.qty}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>
                        ₱{(Number(cartItem.price || 0) * cartItem.qty).toFixed(2)}
                      </span>
                      <Tooltip title="Remove item">
                        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeFromCart(cartKey)} />
                      </Tooltip>
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, marginTop: 16 }}>
                  <div style={row}><span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
                  <div style={row}><span>VAT (12%)</span><span>₱{taxAmount.toFixed(2)}</span></div>
                  {fulfillment === 'delivery' && (
                    <div style={row}><span>Delivery fee</span><span>₱{deliveryFee.toFixed(2)}</span></div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0', padding: '14px 16px', borderRadius: 12, background: '#e8f0fe' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Total</span>
                  <span style={{ color: '#2563eb', fontSize: 22, fontWeight: 800 }}>₱{total.toFixed(2)}</span>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<ShoppingCartOutlined />}
                  onClick={handleProceed}
                  disabled={!customerDetails || !hasItems}
                  style={{ borderRadius: 10, height: 48, fontWeight: 600 }}
                >
                  Proceed to Payment
                </Button>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}