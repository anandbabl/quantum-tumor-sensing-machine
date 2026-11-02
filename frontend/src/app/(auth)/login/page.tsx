"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#080B14] flex items-center justify-center text-xs text-[#94A3B8]">
      Redirecting to Quantum Tumor Sensing Dashboard...
    </div>
  );
}
