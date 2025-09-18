"use client"
import React, { useState } from 'react';
import { PAYMENT_METHODS, DEFAULT_PAYMENT_METHOD } from '@/constants/payment';

const PaymentPage: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState(DEFAULT_PAYMENT_METHOD);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMethod(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ...handle payment method selection...
    alert(`Odabrali ste: ${selectedMethod}`);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: '#f7f7f7' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', minWidth: 320 }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>Odaberite način plaćanja</h2>
        {PAYMENT_METHODS.map((method: string) => (
          <div key={method} style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={selectedMethod === method}
                onChange={handleChange}
                style={{ marginRight: '0.7rem', accentColor: '#0070f3' }}
              />
              <span style={{ fontSize: '1rem', color: '#222' }}>{method}</span>
            </label>
          </div>
        ))}
        <button type="submit" style={{ width: '100%', padding: '0.7rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '1.5rem' }}>
          Potvrdi
        </button>
      </form>
    </div>
  );
};

export default PaymentPage;
