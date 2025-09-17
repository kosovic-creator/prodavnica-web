'use client';

export const dynamic = "force-dynamic";
/* eslint-disable @typescript-eslint/prefer-as-const */
export const fetchCache = "force-no-store";

import React, { Suspense, useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '@/components/CheckoutForm';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from "react-i18next";
import { t } from 'i18next';

const stripePromise = loadStripe('pk_test_51QzXjhGsYKIy68At6fXHC8XTKOsEwwPcC8M3bkQaaSFFmgSymnndIqk2ZJD8xEtNDWF2TdYPyfd6Ah7j0XYgKT1z005tFoGnFq'); // koristi svoj publishable key

function PlacanjePageContent() {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [orderAmount, setOrderAmount] = useState<number | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');
  const { t } = useTranslation('payment');

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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {paymentSuccess ? (
          <>
            <div className="text-green-600 text-lg font-semibold mb-4 text-center">
              {t("paymentSuccess")}
            </div>
            <Link href="/" className="block text-center text-blue-600 hover:underline font-medium mt-4">
              {t("backToHome")}
            </Link>
          </>
        ) : (
          <>
              <h2 className="text-2xl font-bold text-center mb-6">{t("payment")}</h2>
              {orderAmount && <div className="text-lg text-center mb-4">{t("amountToPay")}: <span className="font-semibold">{orderAmount.toFixed(2)} EUR</span></div>}
              {clientSecret && (
                <Elements stripe={stripePromise} options={options}>
                  <CheckoutForm clientSecret={clientSecret} onSuccess={() => setPaymentSuccess(true)} />
                </Elements>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PlacanjePage() {
  return (
    <Suspense fallback={<div>{t('loading')}</div>}>
      <PlacanjePageContent />
    </Suspense>
  );
}