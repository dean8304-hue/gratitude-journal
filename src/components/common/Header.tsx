"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { profile } = useAuth();
  const today = new Date();

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-amber-100 z-40">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-amber-900">감사일기</h1>
          <p className="text-xs text-amber-600">
            {format(today, "yyyy년 M월 d일 EEEE", { locale: ko })}
          </p>
        </div>
        <Link
          href="/settings"
          className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-sm hover:bg-amber-200 transition"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <span>{profile?.nickname?.[0] || "👤"}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
