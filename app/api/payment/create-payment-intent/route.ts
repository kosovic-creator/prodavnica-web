// filepath: /Users/drasko/prodavnica-web/app/api/payment/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const secretKey = process.env.SECRET_KEY;
if (!secretKey) {
  throw new Error('Stripe secret key is not defined in environment variables.');
}
const stripe = new Stripe(secretKey, { apiVersion: '2025-08-27.basil' });

export async function POST(req: NextRequest) {
  const { amount, currency, orderId } = await req.json();
  let finalAmount = amount;
  if (orderId) {
    // Dohvati iznos porudžbine iz baze
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      return NextResponse.json({ error: 'Porudžbina nije pronađena' }, { status: 404 });
    }
    finalAmount = Math.round(order.total * 100); // Stripe amount in cents
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency,
    });
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}