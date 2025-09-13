"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCart } from "../../components/CartContext";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let url = "";
      if (search.trim()) {
        url = `/api/products/search?name=${encodeURIComponent(search)}`;
      } else {
        url = `/api/products`; // Nova ruta za sve proizvode
      }
      const res = await fetch(url);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    fetchProducts();
  }, [search]);

  const handleAddToCart = async (productId: string) => {
    try {
      setAddingToCart(productId);
      await addToCart(productId, 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg">Učitavam proizvode...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Naši proizvodi</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Trenutno nema dostupnih proizvoda.</p>
          </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="font-semibold text-lg mb-2">{product.name}</div>
                  <div className="text-gray-600 mb-2">{product.price} RSD</div>
                  {/* Dodaj dugme ili link za detalje po potrebi */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
