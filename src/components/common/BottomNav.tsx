"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/journal", label: "감사목록", icon: "📝" },
  { href: "/meditation", label: "명상", icon: "🧘" },
  { href: "/community", label: "커뮤니티", icon: "👥" },
  { href: "/meetings", label: "모임안내", icon: "📋" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-100 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto flex">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center py-2 pt-3 transition-colors ${
                isActive
                  ? "text-amber-600"
                  : "text-gray-400 hover:text-amber-400"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span
                className={`text-[10px] mt-0.5 ${
                  isActive ? "font-semibold" : ""
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
