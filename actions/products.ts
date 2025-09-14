import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

// GET - Fetch single product
export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// Removed duplicate prisma declaration

export async function getProductByName(name: string): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: {
      name: {
        contains: name,
        mode: "insensitive", // nije bitno veliko/malo slovo
      },
    },
  });
  if (!product) return null;
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image === null ? undefined : product.image,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
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

