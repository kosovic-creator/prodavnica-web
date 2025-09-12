"use client";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
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
            <a
              href="/products"
              className="hover:bg-gray-100 rounded px-3 py-2 block"
            >
              Proizvodi
            </a>
          </li>
         
          <li>
            <a
              href="/orders"
              className="hover:bg-gray-100 rounded px-3 py-2 block"
            >
              Porudžbine
            </a>
          </li>
          <li>
            <a
              href="/profile"
              className="hover:bg-gray-100 rounded px-3 py-2 flex items-center gap-2"
            >
              <UserIcon className="h-5 w-5" />
              {/* Profil */}
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}