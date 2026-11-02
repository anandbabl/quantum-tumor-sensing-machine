import type { Metadata } from "next";
import "./tailwind-built.css";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "QUANTUM TUMOR SENSING MACHINE — Intelligent Brain MRI Analysis & Tumor Classification",
  description: "Intelligent Brain MRI Analysis & Tumor Classification Platform. Powered by verified 96.24% EfficientNetB3 deep neural network, true Grad-CAM explainability, Groq AI Medical Assistant, and Quantum Machine Learning (QML) research.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-[#000000]">
      <body className="bg-[#000000] text-[#ffffff] antialiased selection:bg-[#8052ff] selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
