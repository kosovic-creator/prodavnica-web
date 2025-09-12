/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { ShoppingCartIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";


export default function Navigation() {
  const { data: session, status } = useSession();
  const { cart } = useCart();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (sidebarOpen) {
      timer = setTimeout(() => setSidebarOpen(false), 5000);
    }
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

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

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100">
      {/* Hamburger na lijevoj strani */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gray-700 hover:text-gray-900"
        >
          <Bars3Icon className="h-8 w-8" />
        </button>
        <div className="text-xl font-bold">Prodavnica</div>
      </div>
      {/* Ostali elementi navigacije */}
      <div className="flex items-center space-x-4">
        {session ? (
          <>
            <span className="text-gray-700">
              Dobrodošli, {session.user?.name || session.user?.email}
            </span>

            <Link
              href="/admin"
              className="hidden sm:block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition duration-200"
            >
              Admin
            </Link>
            <Link
                  href="/cart"
                  className="relative text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition duration-200"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  {cart.itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.itemCount}
                    </span>
                  )}
                </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200"
            >
              Odjava
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition duration-200"
            >
              Prijava
            </Link>
            <Link
              href="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition duration-200"
            >
              Registracija
            </Link>
          </>
        )}
      </div>
      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}
    </nav>
  );
}
