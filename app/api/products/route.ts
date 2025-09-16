import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { PAGE_SIZE } from "@/lib/constants";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(3, "Ime mora imati najmanje 3 karaktera"),
  price: z.number().positive("Cena mora biti pozitivan broj"),
  image: z.string()
    .url()
    .or(z.string().regex(/^\/uploads\//, "Slika mora biti validan URL ili path koji počinje sa /uploads/"))
    .optional()
    .or(z.literal(""))
    .or(z.null()),
});

// GET - Fetch products with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || PAGE_SIZE;
    const skip = (page - 1) * pageSize;

    const [items, totalCount] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count(),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({ items, totalPages, totalCount });
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

    const body = await request.json();
    const parse = productSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json({ error: parse.error.errors[0].message }, { status: 400 });
    }

    const { name, price, image } = parse.data;

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
