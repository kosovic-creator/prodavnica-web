import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 401 });
  }
  const url = new URL(request.url);
  const orderId = url.pathname.split("/").pop();
  if (!orderId) {
    return NextResponse.json({ error: "Nedostaje orderId" }, { status: 400 });
  }
  // Pronađi korisnika
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "Korisnik nije pronađen" }, { status: 404 });
  }
  // Pronađi porudžbinu
  const order = await prisma.order.findUnique({
    where: { id: orderId, userId: user.id },
    include: {
      orderItems: {
        include: { product: true },
      },
    },
  });
  if (!order) {
    return NextResponse.json({ error: "Porudžbina nije pronađena" }, { status: 404 });
  }
  return NextResponse.json(order);
}
