"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomTabs() {
  const path = usePathname();
  const tabs = [
    { href: "/brackets", label: "Brackets" },
    { href: "/parents", label: "Parents’ Corner" },
    { href: "/site-info", label: "Site Info" },
    { href: "/policies", label: "Policies" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-white/15 bg-black/80 backdrop-blur">
      <div className="mx-auto max-w-md px-2 py-2">
        <div className="grid grid-cols-5 gap-1">
          {tabs.map(t => {
            const active = path === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={[
                  "rounded-xl px-2 py-2 text-center text-xs font-bold",
                  active ? "bg-white text-black" : "text-white/80 hover:bg-white/10"
                ].join(" ")}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
