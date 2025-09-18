/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCart } from "../../components/CartContext";
import { PAGE_SIZE } from "@/lib/constants";
import { useTranslation } from "react-i18next";
import Link from "next/link";

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
  const { t } = useTranslation('product');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetchProducts(page);
  }, [page]);

  const fetchProducts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products?page=${pageNum}&pageSize=${PAGE_SIZE}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.items);
        setTotalPages(data.totalPages || 1);
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
      const response = await fetch(`/api/products/${searchTerm}`);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Prikaz samo jednog proizvoda ako je rezultat pretrage jedan */}
        {products.length === 1 ? (
          <div className="flex justify-center">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow w-96">
              {products[0].image ? (
                <Image
                  src={products[0].image}
                  alt={products[0].name}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{products[0].name}</h3>
                <p className="text-2xl font-bold text-green-600 mb-4">
                  {products[0].price.toFixed(2)} EUR
                </p>
                <button
                  onClick={() => handleAddToCart(products[0].id)}
                  disabled={addingToCart === products[0].id}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart === products[0].id ? "Dodajem..." : "Dodaj u korpu"}
                </button>
              </div>
            </div>
          </div>
        ) : products.length === 0 ? (
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    <Link href={`/products/id/${product.id}`} className="hover:underline">
                      {product.name}
                    </Link>
                  </h3>
                  <p className="text-2xl font-bold text-green-600 mb-4">
                    {product.price.toFixed(2)} EUR
                  </p>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingToCart === product.id}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart === product.id ? "Dodajem..." : t('addToCart')}
                  </button>

                </div>

              </div>
            ))}
          </div>
        )}

        {/* Paginacija */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              Prethodna
            </button>
            <span className="px-3 py-1">Strana {page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              Sledeća
            </button>
          </div>
        )}
      </div>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
        <div className="mb-2">{t('price')}: 19.99 EUR</div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded">
          {t('addToCart')}
        </button>
      </div>
    </div>
  );
}