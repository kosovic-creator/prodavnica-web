/* eslint-disable @typescript-eslint/prefer-as-const */
'use client';
import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '@/components/CheckoutForm';

const stripePromise = loadStripe('pk_test_51QzXjhGsYKIy68At6fXHC8XTKOsEwwPcC8M3bkQaaSFFmgSymnndIqk2ZJD8xEtNDWF2TdYPyfd6Ah7j0XYgKT1z005tFoGnFq'); // koristi svoj publishable key

function PlacanjePage() {
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    fetch('/api/payment/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100, currency: 'eur' }),
    })
      .then(res => res.json())
        .then(data => {
            setClientSecret(data.clientSecret);
            console.log(data.clientSecret); // OVDE dodaj log
        });
  }, []);

    const options = {
        clientSecret,
        appearance: { theme: "stripe" as "stripe" },
    };

  return (
    <div>
      <h2>Plaćanje</h2>
          {clientSecret && (
              <Elements stripe={stripePromise} options={options}>
                  <CheckoutForm clientSecret={clientSecret} />
              </Elements>
          )}
    </div>
  );
}

export default PlacanjePage;