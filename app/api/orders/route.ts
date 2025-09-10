/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { sendOrderConfirmationEmail } from "@/controlers/orderController";



export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 401 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Korisnik nije pronađen" }, { status: 404 });
    }

    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Korpa je prazna" }, { status: 400 });
    }

    // Calculate total
    const total = cartItems.reduce((sum: number, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    // Create order and order items in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          total: total,
          status: "",
        },
      });

      // Create order items
      const orderItems = await Promise.all(
        cartItems.map((cartItem) =>
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: cartItem.productId,
              quantity: cartItem.quantity,
              price: cartItem.product.price,
            },
          })
        )
      );

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: user.id },
      });

      return { order: newOrder, orderItems };
    });

    // Dodaj poziv funkcije ovdje:

await sendOrderConfirmationEmail(session.user.email, parseInt(result.order.id, 10));

    return NextResponse.json({ message: "Porudžbina potvrđena", order: result.order });

  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Greška servera" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 401 });
    }

    // Check if user is admin (for admin access to all orders)
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    if (isAdmin) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true },
      });

      if (user?.role !== 'admin') {
        return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 403 });
      }

      // Get all orders for admin
      const orders = await prisma.order.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          orderItems: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(orders);

    } else {
      // Get orders for current user
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        return NextResponse.json({ error: "Korisnik nije pronađen" }, { status: 404 });
      }

      const orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(orders);

    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Greška servera" }, { status: 500 });
  }

}

