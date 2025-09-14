import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Ovo je primjer, zamijeni sa tvojom bazom ili fetch funkcijom
// const products = [
//   { id: '1', name: 'Laptop', price: 1000, image: '/laptop.jpg' },
//   { id: '2', name: 'Telefon', price: 500, image: '/telefon.jpg' },
//   // ...ostali proizvodi...
// ];

export async function GET(request: Request, { params }: { params: { name: string } }) {
  const { name } = params;
  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: decodeURIComponent(name),
        mode: 'insensitive',
      },
    },
  });

  if (!products || products.length === 0) {
    return NextResponse.json({ error: 'Proizvod nije pronađen' }, { status: 404 });
  }

  return NextResponse.json(products);
}