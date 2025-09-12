/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import '../i18n/i18n'; // Dodaj ovo na vrh fajla
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { ShoppingCartIcon, Bars3Icon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Session } from "next-auth";
import { useTranslation } from "react-i18next";


interface NavigationProps {
  onSidebarChange?: (open: boolean) => void;
}

export default function Navigation({ onSidebarChange }: NavigationProps) {
  const { data: session, status } = useSession();
  const { cart } = useCart();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (sidebarOpen) {
      timer = setTimeout(() => setSidebarOpen(false), 5000);
    }
    if (onSidebarChange) {
      onSidebarChange(sidebarOpen);
    }
    return () => clearTimeout(timer);
  }, [sidebarOpen, onSidebarChange]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Dodaj logiku za pretragu proizvoda
    // npr. router.push(`/products?search=${search}`)
  };

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng); // Sada radi
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
        <span className="text-gray-700">
          {t('greeting', { name: session?.user?.name || session?.user?.email })}
        </span>
      </div>
      {/* Search bar sa ikonicom */}
      <form onSubmit={handleSearch} className="flex-1 flex justify-center">
        <div className="relative w-60 sm:w-80 md:w-96 lg:w-1/2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pretraži proizvode..."
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
          />
          <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
      </form>
      <div className="flex items-center gap-4">
        {session ? (
          <>
            {session.user.role === 'admin' && (
              <Link
                href="/admin"
                className="hidden sm:block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition duration-200"
              >
                Admin
              </Link>
            )}
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

          </>
        ) : (
          <>


          </>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleLanguageChange('en')}
          className="text-2xl mx-2 text-gray-700 hover:text-gray-900"
          aria-label="English"
        >
          🇬🇧
        </button>
        <button
          onClick={() => handleLanguageChange('sr')}
          className="text-2xl mx-2 text-gray-700 hover:text-gray-900"
          aria-label="Montenegro"
        >
          🇲🇪
        </button>
      </div>
      {sidebarOpen && (
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          isAuthenticated={!!session}
          handleLogout={handleLogout}
          session={session}
        />
      )}
    </nav>
  );
}


