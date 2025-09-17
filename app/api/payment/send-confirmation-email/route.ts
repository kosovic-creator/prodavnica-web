import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { to, amount } = await request.json();
    if (!to || !amount) {
      return NextResponse.json({ error: 'Email i iznos su obavezni.' }, { status: 400 });
    }
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
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Greška pri slanju email-a:', error);
    return NextResponse.json({ error: 'Greška pri slanju email-a.' }, { status: 500 });
  }
}
