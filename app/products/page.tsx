/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
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
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError("Greška pri učitavanju proizvoda");
      }
    } catch {
      setError("Greška pri učitavanju proizvoda");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsSearch = async (searchTerm: string) => {
    try {
      const response = await fetch(`/api/products/search?name=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError("Greška pri učitavanju proizvoda");
      }
    } catch {
      setError("Greška pri učitavanju proizvoda");
    } finally {
      setLoading(false);
    }
  };


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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Nema slike</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-2xl font-bold text-green-600 mb-4">
                    {product.price.toFixed(2)} RSD
                  </p>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingToCart === product.id}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart === product.id ? "Dodajem..." : "Dodaj u korpu"}
                  </button>

                </div>

              </div>
            ))}
          </div>
        )}
      </div>
       <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Naziv proizvoda za pretragu
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Naziv proizvoda"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
               <button
                    onClick={() => fetchProductsSearch(searchTerm)}
                    className="mt-2 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200"
                  >
                    Pronađi slične
                  </button>
            </div>
    </div>
  );
}