/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Link from "next/link";
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  PlusCircleIcon,
  HomeIcon,
  ShoppingBagIcon,
  ClipboardIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { Session } from "next-auth";
import NextAuth from "next-auth";
import { useTranslation } from "react-i18next";
import '../i18n/i18n';

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
  }
  interface Session {
    user: User;
  }
}

interface SidebarProps {
  onClose: () => void;
  isAuthenticated: boolean;
  handleLogout: () => void;
  session: Session | null;
}

export default function Sidebar({
  onClose,
  isAuthenticated,
  handleLogout,
  session,
}: SidebarProps) {
  const { t } = useTranslation('side');
  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-white text-gray-900 flex flex-col shadow-lg z-50">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
      >
        &#10005;
      </button>
      <div className="p-6 text-2xl font-bold border-b border-gray-200 text-left flex items-center gap-2">
        <Bars3Icon className="h-6 w-6 text-gray-600" />
        {t("menu")}
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-4 items-start flex flex-col">
          <li>
            <Link href="/" className="flex items-center space-x-2 hover:bg-gray-100 rounded px-3 py-2">
              <HomeIcon className="h-5 w-5 text-gray-600" />
              <span>{t("home")}</span>
            </Link>
          </li>
          <li>
            <Link
              href="/products"
              className="flex items-center space-x-2 hover:bg-gray-100 rounded px-3 py-2"
            >
              <ShoppingBagIcon className="h-5 w-5 text-gray-600" />
              <span>{t("products")}</span>
            </Link>
          </li>

          <li>
            <a href="/orders" className="flex items-center space-x-2 hover:bg-gray-100 rounded px-3 py-2">
              <ClipboardIcon className="h-5 w-5 text-gray-600" />
              <span>{t("orders")}</span>
            </a>
          </li>
          <li>
            <Link
              href="/profile"
              className="hover:bg-gray-100 rounded px-3 py-2 flex items-center gap-2"
            >
              <UserIcon className="h-5 w-5" />
              {t("profile")}
            </Link>
          </li>
        </ul>
        <div className="mt-8 flex flex-col gap-2 items-start w-full">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-700 px-3 py-2 rounded-md transition duration-200 w-full justify-start"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              {t("logout")}
            </button>
          ) : (
            <>
              <Link
                href="/login"
                  className="flex items-center gap-2 text-green-700 hover:text-green-500 px-3 py-2 rounded-md transition duration-200 w-full justify-start"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                  {t("login")}
              </Link>
              <Link
                href="/register"
                  className="flex items-center gap-2 text-blue-950 px-3 py-2 rounded-md transition duration-200 w-full justify-start"
              >
                <PlusCircleIcon className="h-5 w-5" />
                  {t("register")}
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}