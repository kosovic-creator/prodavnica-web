import { getProductByName } from "@/lib/products";
import Image from "next/image";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductByName(slug);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Proizvod nije pronađen.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={192}
            className="w-full h-48 object-cover mb-4 rounded"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center mb-4 rounded">
            <span className="text-gray-500">Nema slike</span>
          </div>
        )}
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        <p className="text-lg text-green-600 mb-4">{product.price.toFixed(2)} RSD</p>
        <p className="text-sm text-gray-500">Kreirano: {new Date(product.createdAt).toLocaleDateString()}</p>
        <p className="text-sm text-gray-500">Ažurirano: {new Date(product.updatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}