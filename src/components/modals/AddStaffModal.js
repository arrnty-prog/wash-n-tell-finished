import axios from 'axios';
import { Form, Input, Row, Col } from 'antd';
import FormModal from '../ui/FormModal';


const digits = (v = '') => v.replace(/\D/g, '');

// for number only
const formatMobile = (v) => {
  let d = digits(v);
  if (d.length > 10 && d.startsWith('63')) d = d.slice(2);
  else if (d.length > 10 && d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 10).replace(/^(\d{3})(\d{0,3})(\d{0,4}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '));
};

export default function AddStaffModal({ open, onClose, onSaved }) {
  const save = async (values) => {
    const user = JSON.parse(localStorage.getItem('user'));
    await axios.post('http://localhost:8000/staff', values, {
      headers: { 'x-user-id': user.id },
    });
    onSaved?.();
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={save}
      formName="addStaff"
      title="Add Staff"
      subtitle="Enter the details of the new team member."
      okText="Save Staff"
    >
        <Row gutter={16}>
            <Col span={12}>
              <Form.Item  name="firstName" label="First Name" labelStyle={{ fontWeight: 'bold' }}rules={[{ required: true, message: 'Please enter first name' }] }>
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Last Name" labelStyle={{ fontWeight: 'bold' }} rules={[{ required: true, message: 'Please enter last name' }]}>
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
          </Row>
            <Form.Item name="email" label="Email Address" labelStyle={{ fontWeight: 'bold' }} rules={[{ required: true, type: 'email', message: 'Please enter a valid email address'}]}><Input placeholder="example@domain.com" /></Form.Item>
            <Form.Item name="mobile" label="Mobile Number" normalize={formatMobile} labelStyle={{ fontWeight: 'bold' }} rules={[{ required: true, message: 'Please enter a valid mobile number' }, { validator: (_, v) => (/^9\d{9}$/.test(digits(v)) ? Promise.resolve() : Promise.reject('Enter a valid mobile number, e.g. 917 123 4567')) }]}>
                          <Input size="large" addonBefore="+63" placeholder="9XX XXX XXXX" inputMode="numeric" />
                        </Form.Item>
            
            <Form.Item name="address" label="Address" labelStyle={{ fontWeight: 'bold' }} rules={[{ required: true, message: 'Please enter an address'}]}><Input placeholder="Enter address" /></Form.Item>
            <Form.Item 
        name="password" 
        label="Password" 
        labelStyle={{ fontWeight: 'bold' }}
        rules={[
          { required: true, message: 'Please enter a password' },
          { min: 6, message: 'Password must be at least 6 characters long' },
          { 
            pattern: /\d/, 
            message: 'Password must contain at least one number' 
          }
        ]}
      >
        <Input.Password placeholder="Enter password" />
      </Form.Item>
      
      <Form.Item
        name="confirmPassword"
         label={<span style={{ fontWeight: 500 }}>First Name</span>}
        labelCol={{ style: { fontWeight: 500 } }} 
        dependencies={['password']}
        rules={[
          { required: true, message: 'Please confirm your password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Passwords do not match'));
            },
          }),
        ]}
      >
        <Input.Password placeholder="Re-enter password" />
      </Form.Item>
      </FormModal>
  );
}