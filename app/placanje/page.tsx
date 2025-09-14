'use client';

export const dynamic = "force-dynamic";
/* eslint-disable @typescript-eslint/prefer-as-const */
export const fetchCache = "force-no-store";

import React, { Suspense, useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '@/components/CheckoutForm';
import { useSearchParams } from 'next/navigation';

const stripePromise = loadStripe('pk_test_51QzXjhGsYKIy68At6fXHC8XTKOsEwwPcC8M3bkQaaSFFmgSymnndIqk2ZJD8xEtNDWF2TdYPyfd6Ah7j0XYgKT1z005tFoGnFq'); // koristi svoj publishable key

function PlacanjePageContent() {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [orderAmount, setOrderAmount] = useState<number | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');

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
      console.log(data.clientSecret);
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
      {paymentSuccess && (
        <div style={{ color: 'green', margin: '10px 0' }}>
          Plaćanje je uspješno! Potvrda je poslata na vaš email.
        </div>
      )}
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm clientSecret={clientSecret} onSuccess={() => setPaymentSuccess(true)} />
        </Elements>
      )}
    </div>
  );
}

export default function PlacanjePage() {
  return (
    <Suspense fallback={<div>Učitavanje...</div>}>
      <PlacanjePageContent />
    </Suspense>
  );
}