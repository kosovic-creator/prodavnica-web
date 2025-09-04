import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  sendEmail,
  generateVerificationToken,
  generateVerificationUrl,
  generateVerificationEmailHtml,
  generateVerificationEmailText
} from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email je obavezan" }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Korisnik sa ovom email adresom ne postoji" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email je već verifikovan" }, { status: 400 });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24); // 24 hours from now

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken: verificationToken,
        emailVerifyExpiry: verificationExpiry,
      },
    });

    // Generate verification URL
    const verificationUrl = generateVerificationUrl(verificationToken);

    // Send verification email
    const emailResult = await sendEmail({
      to: email,
      subject: "Potvrda email adrese - Prodavnica",
      html: generateVerificationEmailHtml(user.name || "Korisniče", verificationUrl),
      text: generateVerificationEmailText(user.name || "Korisniče", verificationUrl),
    });

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      return NextResponse.json({ error: "Greška pri slanju email-a" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Verifikacijski email je ponovo poslat. Proverite vaš email."
    });

  } catch (error) {
    console.error("Error resending verification email:", error);
    return NextResponse.json({
      error: "Greška servera"
    }, { status: 500 });
  }
}
