import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Naziv proizvoda je obavezan.' }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: name,
        mode: 'insensitive', // nije bitno veliko/malo slovo
      },
    },
  });

  return NextResponse.json(products);
}