import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

// GET - Get user's cart items
export async function GET() {
  try {
      const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "Korisnik nije pronađen" }, { status: 404 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate total
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const total = cartItems.reduce((sum: number, item: any) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    return NextResponse.json({
      items: cartItems,
      total: total,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      itemCount: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Greška pri učitavanju korpe" }, { status: 500 });
  }
}

// POST - Add item to cart
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("SESSION:", session);
    if (!session?.user?.email) {
      console.log("Niste prijavljeni");
      return NextResponse.json({ error: "Niste prijavljeni" }, { status: 401 });
    }
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    if (!user) {
      return NextResponse.json({ error: "Korisnik nije pronađen" }, { status: 404 });
    }
    const { productId, quantity } = await request.json();
    console.log("productId:", productId, "quantity:", quantity);
    if (!productId || !quantity) {
      console.log("Nedostaju podaci");
      return NextResponse.json({ error: "Nedostaju podaci" }, { status: 400 });
    }
    // Dodaj u korpu ili ažuriraj količinu
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId: user.id,
        productId,
        quantity,
      },
    });
    return NextResponse.json({ success: true, cartItem });
  } catch (error) {
    console.log("Greška pri dodavanju u korpu:", error);
    return NextResponse.json({ error: "Greška pri dodavanju u korpu" }, { status: 500 });
  }
}
