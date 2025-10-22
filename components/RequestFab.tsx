"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRequest } from "@/components/providers/RequestProvider";

export function RequestFab() {
  const { items } = useRequest();
  const pathname = usePathname();

  if (items.length === 0) return null;
  if (pathname === "/request") return null;

  const total = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link
      href="/request"
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(8,15,40,0.45)] backdrop-blur transition hover:border-white/45 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
    >
      <span>Заявка</span>
      <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full border border-white/30 bg-white/20 px-2 text-xs font-bold text-white">
        {total}
      </span>
    </Link>
  );
}
