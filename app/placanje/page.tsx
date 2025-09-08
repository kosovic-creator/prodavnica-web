'use client';
import React, { useEffect, useState } from 'react';
import CheckoutForm from '@/components/CheckoutForm';

function PlacanjePage() {
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    fetch('/api/payment/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1000, currency: 'rsd' }), // 1000 RSD
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, []);

  return (
    <div>
      <h2>Plaćanje</h2>
      {clientSecret && <CheckoutForm clientSecret={clientSecret} />}
    </div>
  );
}

export default PlacanjePage;