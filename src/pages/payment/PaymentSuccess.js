import { Result, Button, Card, Descriptions } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { peso } from '../../utils/peso';

const METHOD_LABEL = {
  card: 'Card',
  gcash: 'GCash',
  cash: 'Cash',
};

export default function PaymentSuccess() {
  const navigate = useNavigate();
  // Set by PaymentLayout right after the order is saved
  const order = useLocation().state?.order;

const goToDashboard = () => {
  const role = JSON.parse(localStorage.getItem('user') || 'null')?.role;
  navigate(role === 'user' ? '/user/home' : `/${role === 'admin' ? 'admin' : 'staff'}/dashboard`, { replace: true });
};
  if (!order) {
    return (
      <div className="page-content">
        <Card>
          <Result
            status="info"
            title="No recent payment to show"
            subTitle="This page only appears right after an order is placed."
            extra={
              <Button type="primary" onClick={goToDashboard}>
                Back to dashboard
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const { _id, payment, total, customerName, fulfillment } = order;

  const isPaid = payment.status === 'paid';
  const hasCashDetails = payment.cashReceived != null;
  const orderCode = String(_id).slice(-6).toUpperCase();
  const fulfillmentLabel = fulfillment.type === 'delivery' ? 'delivery' : 'pickup';

  const subTitle = isPaid
    ? `${peso(total)} paid by ${customerName}.`
    : `${peso(total)} to be paid on ${fulfillmentLabel} by ${customerName}.`;

  return (
    <div className="page-content">
      <Card>
        <Result
          status="success"
          title={isPaid ? 'Payment received' : 'Order placed'}
          subTitle={subTitle}
          extra={
            <Button type="primary" onClick={goToDashboard}>
              Done
            </Button>
          }
        />

        <Descriptions
          bordered
          column={1}
          size="small"
          style={{ maxWidth: 480, margin: '0 auto' }}
        >
          <Descriptions.Item label="Order ID">#{orderCode}</Descriptions.Item>
          <Descriptions.Item label="Method">
            {METHOD_LABEL[payment.method] || payment.method}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {isPaid ? 'Paid' : 'Pending'}
          </Descriptions.Item>
          <Descriptions.Item label={isPaid ? 'Total paid' : 'Total due'}>
            {peso(total)}
          </Descriptions.Item>

          {hasCashDetails && (
            <>
              <Descriptions.Item label="Cash received">
                {peso(payment.cashReceived)}
              </Descriptions.Item>
              <Descriptions.Item label="Change">
                {peso(payment.change)}
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Card>
    </div>
  );
}