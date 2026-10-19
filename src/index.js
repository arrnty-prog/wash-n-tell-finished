import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './styles/global.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import OrderContext from './context/OrderContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <OrderContext>
      <App />
      </OrderContext>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();