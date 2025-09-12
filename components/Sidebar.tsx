"use client";
import Link from "next/link";
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  onClose: () => void;
  isAuthenticated: boolean;
  handleLogout: () => void;
}

export default function Sidebar({
  onClose,
  isAuthenticated,
  handleLogout,
}: SidebarProps) {
  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-white text-gray-900 flex flex-col shadow-lg z-50">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
      >
        &#10005;
      </button>
      <div className="p-6 text-2xl font-bold border-b border-gray-200">
        Meni
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-4">
          <li>
            <Link
              href="/"
              className="hover:bg-gray-100 rounded px-3 py-2 block"
            >
              Početna
            </Link>
          </li>
          <li>
            <Link
              href="/products"
              className="hover:bg-gray-100 rounded px-3 py-2 block"
            >
              Proizvodi
            </Link>
          </li>

          <li>
            <Link
              href="/orders"
              className="hover:bg-gray-100 rounded px-3 py-2 block"
            >
              Porudžbine
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              className="hover:bg-gray-100 rounded px-3 py-2 flex items-center gap-2"
            >
              <UserIcon className="h-5 w-5" />
            </Link>
          </li>
        </ul>
        <div className="mt-8 flex flex-col gap-2">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              {/* Odjava */}
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition duration-200"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                {/* Prijava */}
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition duration-200"
              >
                <PlusCircleIcon className="h-5 w-5" />
                {/* Registracija */}
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}