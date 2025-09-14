import { getProductById } from "@/actions/products";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await getProductById(id);
  if (!response || !response.ok) return notFound();

  const product = await response.json();

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