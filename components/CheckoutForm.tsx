// filepath: /frontend/components/CheckoutForm.tsx
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import React, { FormEvent, useState } from 'react';

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess?: () => void;
}

function CheckoutForm({ clientSecret, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);
    if (!stripe || !elements) {
      return;
    }
    setLoading(true);
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });
    setLoading(false);
    if (result.error) {
      setErrorMsg(result.error.message || 'Došlo je do greške pri plaćanju.');
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        setErrorMsg(null);
        if (onSuccess) onSuccess();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement className="mb-4" />
      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Obrada...' : 'Plati'}
      </button>
      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-2 mt-2">
          <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
          </svg>
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}
    </form>
  );
}

export default CheckoutForm;