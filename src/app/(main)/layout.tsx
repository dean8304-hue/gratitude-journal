"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/common/Header";
import BottomNav from "@/components/common/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-warm-50 pb-20">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-4">{children}</main>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
