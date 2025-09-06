import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Prodavnica'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      ...options,
    });

    console.log('Email sent: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateVerificationUrl(token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/api/auth/verify-email?token=${token}`;
}

export function generateVerificationEmailHtml(name: string, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Potvrda email adrese</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4f46e5;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f9fafb;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .button {
          display: inline-block;
          background-color: #4f46e5;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Dobrodošli u Prodavnicu!</h1>
      </div>
      <div class="content">
        <h2>Zdravo ${name || 'Korisniče'}!</h2>
        <p>Hvala vam što ste se registrovali u našoj prodavnici. Da biste završili proces registracije, molimo vas da potvrdite vašu email adresu klikom na dugme ispod.</p>

        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">Potvrdi email adresu</a>
        </div>

        <p>Ili kopirajte i nalepite sledeći link u vaš browser:</p>
        <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 4px;">
          ${verificationUrl}
        </p>

        <p><strong>Napomena:</strong> Ovaj link je valjan 24 sata. Ako ne potvrdite email u tom periodu, trebalo bi da se ponovo registrujete.</p>

        <div class="footer">
          <p>Ako niste vi kreırali ovaj nalog, možete ignorisati ovaj email.</p>
          <p>© 2025 Prodavnica. Sva prava zadržana.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateVerificationEmailText(name: string, verificationUrl: string): string {
  return `
Zdravo ${name || 'Korisniče'}!

Hvala vam što ste se registrovali u našoj prodavnici. Da biste završili proces registracije, molimo vas da potvrdite vašu email adresu.

Kliknite na sledeći link da potvrdite email:
${verificationUrl}

Napomena: Ovaj link je valjan 24 sata.

Ako niste vi kreırali ovaj nalog, možete ignorisati ovaj email.

© 2025 Prodavnica. Sva prava zadržana.
  `;
}
