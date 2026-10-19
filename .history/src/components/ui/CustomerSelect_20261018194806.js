import React, {useState, useEffect} from 'react'
import {Select} from 'antd'
import axios from 'axios'

const CustomerSelect = ({onSelectCustomer}) => {
    const [customers, setCustomers] = useState([])
    
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'))
        axios.get('http://localhost:8000/getAccounts', {
            params: { role: 'user' },
            headers: { 'x-user-id': user.id },
        })
            .then(res => {
                const onlyCustomers = res.data.filter(account => account.role ==='user')
                setCustomers(onlyCustomers)
                console.log(onlyCustomers)
            })
            .catch(err => {
                console.error("Error fetching customers:", err);
            });
    },[])

    const options = customers.map(user => ({
        value: user._id,
        label: <span>{user.firstName} {user.lastName} { }
        <span style={{ color: '#888'}}>({user.phone})</span> 
        </span>,
        userObj: user
    }))
  return (
    <div style={{ marginBottom: '20px', width: '100%', maxWidth: '400px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
        Select Customer:
      </label>
      
      <Select
        showSearch
        placeholder="Search by customer name..."
        optionFilterProp="label" 
        style={{ width: '100%' }}
        options={options}
        onChange={(value, option) => {
          // Pass the selected customer ID or full object up to your main order form
          onSelectCustomer(value, option.userObj);
        }}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
      />
    </div>
  );
};

export default CustomerSelect