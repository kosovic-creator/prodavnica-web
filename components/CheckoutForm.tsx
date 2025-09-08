// filepath: /frontend/components/CheckoutForm.tsx
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import React, { FormEvent } from 'react';

interface CheckoutFormProps {
  clientSecret: string;
}

function CheckoutForm({ clientSecret }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (result.error) {
      // Prikazi gresku
      console.error(result.error.message);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        // Uspešno plaćanje
        console.log('Payment succeeded!');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Plati</button>
    </form>
  );
}

export default CheckoutForm;