import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/products/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function ProductDetailsPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) return <div className="py-12 text-center">Proizvod nije pronađen.</div>;

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      {product.image ? (
        <Image src={product.image} alt={product.name} width={400} height={300} className="mb-4 rounded" />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center mb-4">
          <span className="text-gray-500">Nema slike</span>
        </div>
      )}
      <div className="mb-2 text-lg">Cijena: {product.price.toFixed(2)} EUR</div>
      <div className="mb-2">{product.description || "Nema opisa."}</div>
    </div>
  );
}
