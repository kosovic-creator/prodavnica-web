/* eslint-disable @typescript-eslint/prefer-as-const */
'use client';
import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '@/components/CheckoutForm';
import { useSearchParams } from 'next/navigation';

const stripePromise = loadStripe('pk_test_51QzXjhGsYKIy68At6fXHC8XTKOsEwwPcC8M3bkQaaSFFmgSymnndIqk2ZJD8xEtNDWF2TdYPyfd6Ah7j0XYgKT1z005tFoGnFq'); // koristi svoj publishable key

function PlacanjePage() {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [orderAmount, setOrderAmount] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    async function fetchOrderAndCreateIntent() {
      if (!orderId) return;
      // Fetch order info
      const res = await fetch(`/api/orders/${orderId}`);
      const order = await res.json();
      setOrderAmount(order.total);
      // Create payment intent with order amount
      const paymentRes = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(order.total * 100), currency: 'eur', orderId }),
      });
      const data = await paymentRes.json();
      setClientSecret(data.clientSecret);
      console.log(data.clientSecret); // OVDE dodaj log
    }
    if (orderId) {
      fetchOrderAndCreateIntent();
    }
  }, [orderId]);

  const options = {
    clientSecret,
    appearance: { theme: "stripe" as "stripe" },
  };

  return (
    <div>
      <h2>Plaćanje</h2>
      {orderAmount && <div>Iznos za plaćanje: {orderAmount.toFixed(2)} RSD</div>}
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      )}
    </div>
  );
}

export default PlacanjePage;