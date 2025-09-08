// filepath: /Users/drasko/prodavnica-web/app/api/payment/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51QzXjhGsYKIy68At7D8v49TucuCB1G0H8HIF9Pr6fnd4gelPTS8DsrHjPiYtCmomcHYRXKIyLztmTdv5eEUbUVFP006ubmRBuL', { apiVersion: '2025-08-27.basil' });

export async function POST(req: NextRequest) {
  const { amount, currency } = await req.json();
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}