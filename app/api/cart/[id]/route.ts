import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

// PUT - Update cart item quantity
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
      const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 401 });
    }

    const { id } = await context.params;
    const { quantity } = await request.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: "Količina mora biti pozitivna" }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "Korisnik nije pronađen" }, { status: 404 });
    }

    // Update cart item (only if it belongs to the user)
    const cartItem = await prisma.cartItem.updateMany({
      where: {
        id: id,
        userId: user.id
      },
      data: { quantity }
    });

    if (cartItem.count === 0) {
      return NextResponse.json({ error: "Stavka korpe nije pronađena" }, { status: 404 });
    }

    // Get updated cart item with product info
    const updatedItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: true }
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json({ error: "Greška pri ažuriranju korpe" }, { status: 500 });
  }
}

// DELETE - Remove item from cart
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
      const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 401 });
    }

    const { id } = await context.params;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "Korisnik nije pronađen" }, { status: 404 });
    }

    // Delete cart item (only if it belongs to the user)
    const deletedItem = await prisma.cartItem.deleteMany({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (deletedItem.count === 0) {
      return NextResponse.json({ error: "Stavka korpe nije pronađena" }, { status: 404 });
    }

    return NextResponse.json({ message: "Stavka je uklonjena iz korpe" });
  } catch (error) {
    console.error("Error removing cart item:", error);
    return NextResponse.json({ error: "Greška pri uklanjanju iz korpe" }, { status: 500 });
  }
}
