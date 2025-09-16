/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";


import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { data: session } = useSession();
  const { t } = useTranslation('home'); // koristi home namespace
 console.log('to je :', process.env.EMAIL_PASS);
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {t("welcome")}
          </h1>
          {session ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-600">
                {t("hello")}  {session.user?.name || session.user?.email}!
              </p>
              <p className="text-gray-600">
                {t("success")}
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
