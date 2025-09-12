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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);
    if (!stripe || !elements) {
      return;
    }
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });
    if (result.error) {
      setErrorMsg(result.error.message || 'Došlo je do greške pri plaćanju.');
      console.error(result.error.message);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        setErrorMsg(null);
        console.log('Payment succeeded!');
        if (onSuccess) onSuccess();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Plati</button>
      {errorMsg && (
        <div style={{ color: 'red', marginTop: '10px' }}>{errorMsg}</div>
      )}
    </form>
  );
}

export default CheckoutForm;