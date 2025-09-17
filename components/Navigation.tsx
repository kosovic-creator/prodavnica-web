/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { ShoppingCartIcon, Bars3Icon, MagnifyingGlassIcon, ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Session } from "next-auth";
import { useTranslation } from "react-i18next";
import { useRouter } from 'next/navigation';
import '../i18n/i18n';


interface NavigationProps {
  onSidebarChange?: (open: boolean) => void;
}

export default function Navigation({ onSidebarChange }: NavigationProps) {
  const { data: session, status } = useSession();
  const { cart } = useCart();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState('');
  const router = useRouter();
  interface Product {
    id: string;
    name: string;
    price: number;
    image?: string;
  }

  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation('home'); // koristi home namespace

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
    if (query.trim()) {
      router.push(`/products/ime/${encodeURIComponent(query)}`);
    }
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
                {t("shop")}
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
        <span className="text-gray-700 hidden sm:block pr-5">
          {session?.user?.name || session?.user?.email}
        </span>
      </div>
      {/* Search bar sa ikonicom */}
      <form onSubmit={handleSearch} className="flex-1 flex justify-center">
        <div className="relative w-80 sm:w-96 md:w-[300px] lg:w-[500px]">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t("searchProducts")}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
          />
          <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
      </form>
      <div className="flex items-center gap-4 justify-end w-full">
        {session ? (
          <>
            {session.user.role === 'admin' && (
              <Link
                href="/admin"
                className="hidden sm:block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition duration-200"
              >
                {t("admin")}
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
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-700 px-3 py-2 rounded-md transition duration-200"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              {t("logout")}
            </button>
          </>
        ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 text-green-700 hover:text-green-500 px-3 py-2 rounded-md transition duration-200"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 text-blue-950 px-3 py-2 rounded-md transition duration-200"
              >
                <PlusCircleIcon className="h-5 w-5" />
                {t("register")}
              </Link>
            </>
        )}
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => handleLanguageChange('en')}
          className="text-2xl mx-2 text-gray-700 hover:text-gray-900"
          aria-label="English"
        >
          🇬🇧
        </button>
        <button
          onClick={() => handleLanguageChange('sr')}
          className="text-2xl mx-2 text-gray-700 hover:text-gray-900 pl-0.5 mr-4 pr-4"
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
      {loading && <div>{t("searching")}</div>}
      {results.length > 0 && (
        <ul className="bg-white border rounded w-full max-w-md mt-2">
          {results.map(product => (
            <li key={product.id} className="flex items-center p-2 border-b last:border-b-0">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded mr-3"
                />
              )}
              <div className="flex-1">
                <Link href={`/products/${product.id}`} className="font-semibold hover:underline">
                  {product.name}
                </Link>
                <div className="text-sm text-gray-600">{product.price} EUR</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}


