"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardPage from "@/app/dashboard/page";
import BrainIntro from "@/components/intro/brain-intro";

function RootContent() {
  const searchParams = useSearchParams();
  const forceIntro = searchParams.get("intro") === "true";
  const [showIntro, setShowIntro] = useState<boolean | null>(null);

  useEffect(() => {
    if (forceIntro) {
      setShowIntro(true);
      return;
    }

    try {
      const seen = sessionStorage.getItem("quantum_intro_seen");
      if (seen === "true") {
        setShowIntro(false);
      } else {
        setShowIntro(true);
      }
    } catch {
      setShowIntro(false);
    }
  }, [forceIntro]);

  const handleIntroComplete = () => {
    try {
      sessionStorage.setItem("quantum_intro_seen", "true");
    } catch {
      // ignore storage failure
    }
    setShowIntro(false);
  };

  // Avoid flash of content before reading session state
  if (showIntro === null) {
    return <div className="fixed inset-0 bg-[#000000]" />;
  }

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
