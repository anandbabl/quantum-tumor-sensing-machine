"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardPage from "@/app/dashboard/page";
import BrainIntro from "@/components/intro/brain-intro";

function RootContent() {
  const searchParams = useSearchParams();
  const forceIntro = searchParams.get("intro") === "true";
  const [showIntro, setShowIntro] = useState<boolean>(true);

  useEffect(() => {
    if (forceIntro) {
      setShowIntro(true);
    }
  }, [forceIntro]);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <>
      {showIntro && <BrainIntro onComplete={handleIntroComplete} />}
      <DashboardPage />
    </>
  );
}

export default function RootPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#000000]" />}>
      <RootContent />
    </Suspense>
  );
}
