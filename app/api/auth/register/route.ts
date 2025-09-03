import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { 
  sendEmail, 
  generateVerificationToken, 
  generateVerificationUrl,
  generateVerificationEmailHtml,
  generateVerificationEmailText
} from "../../../../lib/email";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Sva polja su obavezna" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Lozinka mora imati najmanje 6 karaktera" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Korisnik sa ovom email adresom već postoji" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24); // 24 hours from now

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
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
      html: generateVerificationEmailHtml(name, verificationUrl),
      text: generateVerificationEmailText(name, verificationUrl),
    });

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      // Continue with registration even if email fails
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, emailVerifyToken, ...userWithoutSensitiveData } = user;

    return NextResponse.json(
      { 
        message: "Korisnik je uspešno registrovan. Proverite email za potvrdu.", 
        user: userWithoutSensitiveData,
        emailSent: emailResult.success
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Interna greška servera" },
      { status: 500 }
    );
  }
}
