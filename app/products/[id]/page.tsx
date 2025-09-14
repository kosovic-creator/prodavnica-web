/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import Image from "next/image";

async function getProduct(id: string) {
  const baseUrl ="https://prodavnica-web.vercel.app";
  const res = await fetch(`${baseUrl}/api/products/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({ params }: any) {
  const id = Array.isArray(params.id) ? params.id[0] : params.id; // string
  const product = await getProduct(id);
  if (!product) return notFound();


  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      {product.image ? (
        <Image src={product.image} alt={product.name} width={400} height={300} />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Nema slike</span>
        </div>
      )}
      <p className="text-2xl text-green-600 mt-4">{product.price} EUR</p>
    </div>
  );
}