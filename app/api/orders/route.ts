/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { sendOrderConfirmationEmail } from "@/controlers/orderController";
import { PAGE_SIZE } from "@/lib/constants";

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

// GET - Fetch orders with pagination (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || PAGE_SIZE;
    const skip = (page - 1) * pageSize;
    const isAdmin = searchParams.get('admin') === 'true';

    if (isAdmin) {
    // Check if user is admin (for admin access to all orders)
      const session = await getServerSession(authOptions);

      if (!session?.user?.email) {
        return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 401 });
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true },
      });

      if (user?.role !== 'admin') {
        return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 403 });
      }

      // Get all orders for admin with pagination
      const [items, totalCount] = await Promise.all([
        prisma.order.findMany({
          skip,
          take: pageSize,
          include: {
            user: { select: { id: true, name: true, email: true } },
            orderItems: { include: { product: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.order.count(),
      ]);
      const totalPages = Math.ceil(totalCount / pageSize);
      return NextResponse.json({ items, totalPages, totalCount });

    } else {
      const session = await getServerSession(authOptions);

      if (!session?.user?.email) {
        return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 401 });
      }

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

