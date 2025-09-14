import { PrismaClient } from "@prisma/client";
export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

const prisma = new PrismaClient();

export async function getProductByName(name: string): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: {
      name: {
        equals: name,
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
  return await prisma.product.findUnique({
    where: { id },
  });
}