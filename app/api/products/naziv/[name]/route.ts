// app/api/products/naziv/[name]/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Uzimanje 'name' parametra iz URL-a
  const { pathname } = new URL(request.url);
  // Regex za izdvajanje parametra iz pathname: /api/products/naziv/{name}
  const name = decodeURIComponent(pathname.split('/').pop() || '');

  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: name,
        mode: 'insensitive',
      },
    },
  });

  if (!products || products.length === 0) {
    return NextResponse.json({ error: 'Proizvod nije pronađen' }, { status: 404 });
  }

  return NextResponse.json(products);
}
