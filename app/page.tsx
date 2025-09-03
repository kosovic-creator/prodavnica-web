"use client";

import Navigation from "../components/Navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Dobrodošli u našu prodavnicu
          </h1>
          {session ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-600">
                Zdravo {session.user?.name || session.user?.email}!
              </p>
              <p className="text-gray-600">
                Uspešno ste se prijavili na vaš račun.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-600">
                Prijavite se ili registrujte da biste počeli kupovinu.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
