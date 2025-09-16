import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

const stripe = new Stripe(process.env.SECRET_KEY!, { apiVersion: '2025-08-27.basil' });

async function sendConfirmationEmail(to: string, amount: number) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Potvrda o plaćanju',
    text: `Vaša uplata u iznosu od ${(amount / 100).toFixed(2)} EUR je uspješno primljena. Hvala na kupovini!`,
  });
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const buf = await req.arrayBuffer();
  let event;
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata.orderId;
    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (order) {
        // Pretpostavljamo da email postoji u order ili user
        let userEmail = '';
        if (order.userId) {
          const user = await prisma.user.findUnique({ where: { id: order.userId } });
          userEmail = user?.email ?? '';
        }
        if (userEmail) {
          await sendConfirmationEmail(userEmail, paymentIntent.amount);
        }
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'completed' },
        });
      }
    }
  }
  return NextResponse.json({ received: true });
}
