import { NextRequest, NextResponse } from "next/server";
import prisma from "../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/authOptions";

// GET - Fetch all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Greška pri učitavanju proizvoda" }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 401 });
    }

    const { name, price, image } = await request.json();

    if (!name || !price) {
      return NextResponse.json(
        { error: "Naziv i cena su obavezni" },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: "Cena mora biti pozitivan broj" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        image: image || null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Greška pri kreiranju proizvoda" }, { status: 500 });
  }
}
