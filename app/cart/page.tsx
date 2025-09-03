"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import { useCart } from "../../components/CartContext";

export default function CartPage() {
  const { data: session } = useSession();
  const { cart, loading, updateQuantity, removeFromCart, refreshCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const router = useRouter();

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh cart to clear items
        await refreshCart();
        // Redirect to orders page or show success message
        router.push("/orders?success=true");
      } else {
        setCheckoutError(data.error || "Greška pri kreiranju porudžbine");
      }
    } catch {
      setCheckoutError("Greška pri kreiranju porudžbine");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Vaša korpa</h1>
            <p className="text-gray-600 mb-4">Morate biti prijavljeni da vidite korpu.</p>
            <Link
              href="/login"
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              Prijavite se
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-lg">Učitavam korpu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Vaša korpa</h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Vaša korpa je prazna.</p>
            <Link
              href="/products"
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              Idite na kupovinu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Stavke u korpi</h2>
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-gray-500 text-sm">Nema slike</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                        <p className="text-green-600 font-bold">
                          {item.product.price.toFixed(2)} RSD
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {(item.product.price * item.quantity).toFixed(2)} RSD
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-800 text-sm mt-1"
                        >
                          Ukloni
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-4">Rezime narudžbe</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Ukupno stavki:</span>
                    <span>{cart.itemCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{cart.total.toFixed(2)} RSD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dostava:</span>
                    <span>0.00 RSD</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Ukupno:</span>
                    <span>{cart.total.toFixed(2)} RSD</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition duration-200 font-semibold"
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? "Obrada..." : "Nastavite ka plaćanju"}
                </button>
                {checkoutError && (
                  <div className="text-red-600 text-sm mt-2 text-center">
                    {checkoutError}
                  </div>
                )}
                <Link
                  href="/products"
                  className="block w-full text-center bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200 mt-2"
                >
                  Nastavi kupovinu
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
