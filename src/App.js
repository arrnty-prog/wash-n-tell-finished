// All routes live here. Admin = /admin/*, Staff = /staff/*
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

import Login from './pages/auth/Login';

import AdminDashboard from './pages/admin/Dashboard';
import AdminStaff from './pages/admin/Staff';
import AdminCustomers from './pages/admin/Customers';
import AdminPayments from './pages/admin/Payments';
import AdminInventory from './pages/admin/Inventory';
import AdminHistory from './pages/admin/History';
import AdminActionHistory from './pages/admin/ActionHistory';
import Register from './pages/auth/Register'; 

import StaffDashboard from './pages/staff/Dashboard';
import StaffCustomers from './pages/staff/Customers';
import StaffCreateOrder from './pages/staff/CreateOrder';
import StaffUpdateStatus from './pages/staff/UpdateStatus';
import StaffPickupDelivery from './pages/staff/PickupDelivery';
import StaffHistory from './pages/staff/History';
import PaymentLayout from './components/layout/PaymentLayout';
import GcashPayment from './pages/payment/GcashPayment';
import CashPayment from './pages/payment/CashPayment';
import CardPayment from './pages/payment/CardPayment';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import CustomerHome from './pages/customer/Home';
import CustomerNewOrder from './pages/customer/NewOrder';
import CustomerMyOrders from './pages/customer/MyOrders';
import CustomerProfile from './pages/customer/Profile';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      

      <Route path="/login" element={<Login />} /> 
      <Route path="/register" element={<Register />} />

      <Route path="/admin" element={<AppLayout role="admin" />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="orders" element={<StaffHistory />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="history" element={<AdminHistory />} />
        <Route path="action-history" element={<AdminActionHistory />} />
      </Route>

      <Route path="/staff" element={<AppLayout role="staff" />}>
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="customers" element={<StaffCustomers />} />
        <Route path="create-order" element={<StaffCreateOrder />} />
        <Route path="update-status" element={<StaffUpdateStatus />} />
        <Route path="pickup-delivery" element={<StaffPickupDelivery />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="history" element={<StaffHistory />} />
      </Route>

       <Route path="/payment" element={<PaymentLayout />}>
            <Route index element={<Navigate to="cash" replace />} />
            <Route path="card" element={<CardPayment />} />
            <Route path="gcash" element={<GcashPayment />} />
            <Route path="cash" element={<CashPayment />} />
            <Route path="success" element={<PaymentSuccess />} />
          </Route>

      <Route path="/user" element={<AppLayout role="user" />}>
        <Route path="home" element={<CustomerHome />} />
        <Route path="new-order" element={<CustomerNewOrder />} />
        <Route path="my-orders" element={<CustomerMyOrders />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>
    </Routes>

   
  );
}
