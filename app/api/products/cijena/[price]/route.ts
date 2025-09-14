import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';



export async function GET(request: Request, { params }: { params: { price: string } }) {
  const { price } = params;
  const products = await prisma.product.findMany({
    where: {
      price: Number(decodeURIComponent(price)),
    },
  });

  if (!products || products.length === 0) {
    return NextResponse.json({ error: 'Proizvod nije pronađen' }, { status: 404 });
  }

  return NextResponse.json(products);
}