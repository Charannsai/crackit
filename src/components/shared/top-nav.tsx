"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Plus, BarChart3, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function TopNav() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const navItems = [
    { href: "/chat", label: "New Session", icon: Plus, highlight: true },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/progress", label: "Progress", icon: BarChart3 },
  ];

  return (
    <header className="h-14 border-b border-[#e5e5e5] bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1d1d1d] rounded-xl flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[#1d1d1d] text-base tracking-tight">CrackIt</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.highlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1d1d1d] text-white hover:bg-[#333333] transition-colors text-xs font-semibold mr-2"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#f5f5f5] text-[#1d1d1d]"
                    : "text-[#6b7280] hover:text-[#1d1d1d] hover:bg-[#fafafa]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {profile && (
          <div className="flex items-center gap-2.5 text-xs text-[#1d1d1d]">
            <span className="font-medium text-[#4b5563] hidden sm:inline">
              {profile.full_name || profile.email}
            </span>
            <button
              onClick={signOut}
              className="p-1.5 rounded-lg hover:bg-[#f5f5f5] text-[#9ca3af] hover:text-[#1d1d1d] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
