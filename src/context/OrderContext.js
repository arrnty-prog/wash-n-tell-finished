import React, { createContext, useContext, useEffect, useState }from 'react'

const OrderDraftContext = createContext(null);
const STORAGE_KEY = 'orderDraft';
export const DELIVERY_FEE = 50;
 export const TAX_RATE= 0.12;

const emptyDraft = {
  orderCart: {},
  customerId: null,
  customerDetails: null,
  fulfillment: 'pickup'
};

const OrderContext = ({children}) => {
    const [draft, setDraft] = useState(() =>{
        try{
            const saved = sessionStorage.getItem(STORAGE_KEY)
            return saved ? JSON.parse(saved) : emptyDraft;
        } catch {
            return emptyDraft;
        }
    })

    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }, [draft]);

    const updateDraft = (changes) => setDraft((prev) => ({ ...prev, ...changes }));

    const setOrderCart = (updater) =>
        setDraft((prev) => ({
        ...prev,
        orderCart: typeof updater === 'function' ? updater(prev.orderCart) : updater,
        }));

    const clearDraft = () => setDraft(emptyDraft);

  return (
    <OrderDraftContext.Provider value={{ draft, updateDraft, setOrderCart, clearDraft }}>
      {children}
    </OrderDraftContext.Provider>
  )
}
export const useOrderDraft = () => useContext(OrderDraftContext);

// Whole-cent maths, identical to computeTotals() in server/controllers/OrderController.js.
export const getTotals = (draft) => {
  const subtotalCents = Object.values(draft.orderCart)
    .reduce((sum, c) => sum + Math.round(c.price * 100 * c.qty), 0);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const deliveryCents = draft.fulfillment === 'delivery' ? DELIVERY_FEE * 100 : 0;
  return {
    subtotal: subtotalCents / 100,
    taxAmount: taxCents / 100,
    deliveryFee: deliveryCents / 100,
    total: (subtotalCents + taxCents + deliveryCents) / 100, // VAT is part of what the customer pays
  };
};

export default OrderContext