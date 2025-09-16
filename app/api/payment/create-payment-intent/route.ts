// filepath: /Users/drasko/prodavnica-web/app/api/payment/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { getServerSession } from "next-auth/next";

const secretKey = process.env.SECRET_KEY;
if (!secretKey) {
  throw new Error('Stripe secret key is not defined in environment variables.');
}
const stripe = new Stripe(secretKey, { apiVersion: '2025-08-27.basil' });

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
  const { amount, currency, orderId } = await req.json();
  let finalAmount = amount;
  let userEmail = '';
  if (orderId) {
    // Dohvati iznos porudžbine iz baze
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        userId: true,
        total: true,
        paymentIntentId: true, // Dodaj polje za PaymentIntent
      },
    });
    if (!order) {
      return NextResponse.json({ error: 'Porudžbina nije pronađena' }, { status: 404 });
    }
    finalAmount = Math.round(order.total * 100); // Stripe amount in cents
    const session = await getServerSession();
    userEmail = session?.user?.email ?? '';
    // Proveri da li već postoji PaymentIntent
    if (order.paymentIntentId) {
      // Vrati postojeći clientSecret
      const existingIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
      return NextResponse.json({ clientSecret: existingIntent.client_secret });
    }
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: finalAmount,
        currency,
        metadata: { orderId },
      });
      // Sačuvaj PaymentIntentId u bazi
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentIntentId: paymentIntent.id },
      });
      // Pošalji email potvrdu korisniku
      if (userEmail) {
        await sendConfirmationEmail(userEmail, finalAmount);
      }
      return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }
}