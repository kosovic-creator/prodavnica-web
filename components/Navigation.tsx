"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useCart } from "./CartContext";

export default function Navigation() {
  const { data: session, status } = useSession();
  const { cart } = useCart();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading") {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                Prodavnica
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const isLoggedIn = session;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-800 mr-8">
              Prodavnica
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <span className="text-gray-700">
                  Dobrodošli, {session.user?.name || session.user?.email}
                </span>
                <Link
                  href="/products"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition duration-200"
                >
                  Proizvodi
                </Link>
                <Link
                  href="/cart"
                  className="relative text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition duration-200"
                >
                  Korpa
                  {cart.itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.itemCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/orders"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition duration-200"
                >
                  Porudžbine
                </Link>
                <div className="nav-buttons flex items-center gap-2 flex-wrap max-w-full">
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200 text-sm sm:text-base"
                  >
                    Odjava
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition duration-200 text-sm sm:text-base"
                >
                  Prijava
                </Link>
                <Link
                  href="/register"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition duration-200 text-sm sm:text-base"
                >
                  Registracija
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
