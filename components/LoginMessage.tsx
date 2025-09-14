"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginMessage() {
  const [success, setSuccess] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams?.get("message");
    if (message === "Registration successful") {
      setSuccess("Registracija je uspešna! Sada se možete prijaviti.");
    }
  }, [searchParams]);

  if (!success) return null;

  return (
    <div className="text-green-600 text-sm text-center">{success}</div>
  );
}
