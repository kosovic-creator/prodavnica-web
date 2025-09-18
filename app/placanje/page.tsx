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
              {/* Ikone za metode */}
              {method === 'PayPal' && (
                <span style={{ marginRight: '0.5rem' }}>
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="6" fill="#fff" /><path d="M10.5 21.5L12 10.5H20C22.5 10.5 23.5 12.5 22.5 15.5C21.5 18.5 19.5 21.5 16 21.5H10.5Z" fill="#003087" /><path d="M12.5 21.5L14 13.5H19C20.5 13.5 21 15.5 20 18.5C19 21.5 17.5 21.5 15.5 21.5H12.5Z" fill="#009CDE" /></svg>
                </span>
              )}
              {(method.toLowerCase().includes('visa') || method === 'Stripe') && (
                <span style={{ marginRight: '0.5rem' }}>
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="6" fill="#fff" /><text x="6" y="22" fontSize="14" fontWeight="bold" fill="#1A1F71">VISA</text></svg>
                </span>
              )}
              {(method.toLowerCase().includes('master') || method === 'Stripe') && (
                <span style={{ marginRight: '0.5rem' }}>
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="6" fill="#fff" /><circle cx="13" cy="16" r="6" fill="#EB001B" /><circle cx="19" cy="16" r="6" fill="#F79E1B" /><text x="7" y="28" fontSize="8" fontWeight="bold" fill="#333">MasterCard</text></svg>
                </span>
              )}
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
