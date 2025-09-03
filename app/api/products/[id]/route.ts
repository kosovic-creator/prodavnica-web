import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";

// GET - Fetch single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ error: "Proizvod nije pronađen" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Greška pri učitavanju proizvoda" }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 401 });
    }

    const { name, price, image } = await request.json();

    const updateData: {
      name?: string;
      price?: number;
      image?: string | null;
    } = {};

    if (name) updateData.name = name;
    if (price !== undefined) {
      if (typeof price !== 'number' || price <= 0) {
        return NextResponse.json(
          { error: "Cena mora biti pozitivan broj" },
          { status: 400 }
        );
      }
      updateData.price = price;
    }
    if (image !== undefined) updateData.image = image || null;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Greška pri ažuriranju proizvoda" }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 401 });
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Proizvod je uspešno obrisan" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Greška pri brisanju proizvoda" }, { status: 500 });
  }
}
