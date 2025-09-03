import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: "Token nije pronađen" }, { status: 400 });
    }

    // Find user by verification token
    const user = await prisma.user.findUnique({
      where: {
        emailVerifyToken: token,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Nevažeći token" }, { status: 400 });
    }

    // Check if token is expired (24 hours)
    if (user.emailVerifyExpiry && user.emailVerifyExpiry < new Date()) {
      return NextResponse.json({ error: "Token je istekao" }, { status: 400 });
    }

    // Verify user email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });

    // Redirect to success page or login
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('verified', 'true');
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json({ 
      error: "Greška pri verifikaciji email-a" 
    }, { status: 500 });
  }
}
