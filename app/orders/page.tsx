"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";


interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image?: string;
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
}

function OrdersContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 5;
  const { t } = useTranslation('orders');

  useEffect(() => {
    if (searchParams && searchParams.get('success') === 'true') {
      setSuccess(t("orderSuccess"));
    }
  }, [searchParams, t]);

  useEffect(() => {
    if (session) {
      fetchOrders(page);
    }
  }, [session, page]);

  const fetchOrders = async (pageNum = 1) => {
    try {
      const response = await fetch(`/api/orders?page=${pageNum}&pageSize=${PAGE_SIZE}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setOrders(data);
          setTotalPages(1);
        } else {
          setOrders(data.items || []);
          setTotalPages(data.totalPages || 1);
        }
      } else {
        setError(t("fetchError"));
      }
    } catch {
      setError(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("yourOrders")}</h1>
            <p className="text-gray-600 mb-4">{t("mustBeLoggedIn")}</p>
            <Link
              href="/login"
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              {t("login")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg">{t("loadingOrders")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t("yourOrders")}</h1>
          <p className="text-gray-600 mt-2">{t("ordersOverview")}</p>
        </div>
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("noOrders")}</h2>
            <p className="text-gray-600 mb-6">{t("startShopping")}</p>
            <Link
              href="/products"
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              {t("viewProducts")}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t("order")} #{order.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('sr-RS', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {order.total.toFixed(2)} EUR
                    </p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status === 'completed' ? t("completed") : order.status}
                    </span>
                    {/* Dodaj dugme za plaćanje ako nije završeno */}
                    {order.status !== 'completed' ? (
                      <Link
                        href={`/payment?orderId=${order.id}`}
                        className={`ml-4 px-4 py-1 rounded ${order.status === 'completed' ? 'bg-gray-400 text-gray-300 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        aria-disabled={order.status === 'completed'}
                        tabIndex={order.status === 'completed' ? -1 : 0}
                        onClick={e => {
                          if (order.status === 'completed') e.preventDefault();
                        }}
                      >
                        {t("pay")}
                      </Link>
                    ) : (
                      <span className="text-gray-600 text-xs"></span>
                    )}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">{t("orderItems")}</h4>
                  <div className="space-y-3">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={60}
                            height={60}
                            className="w-15 h-15 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-15 h-15 bg-gray-200 rounded-md flex items-center justify-center">
                              <span className="text-gray-500 text-xs">{t("noImage")}</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                          <p className="text-sm text-gray-600">
                            {t("quantity")}: {item.quantity} × {item.price.toFixed(2)} EUR
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {(item.price * item.quantity).toFixed(2)} EUR
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {orders.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              className="px-4 py-2 mx-2 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              {t("previous")}
            </button>
            <span className="px-4 py-2">{t("page")}
              {page} {t("of")} {totalPages}</span>
            <button
              className="px-4 py-2 mx-2 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              {t("next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Učitavam...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
