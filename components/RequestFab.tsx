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
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
    >
      <span>Заявка</span>
      <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-white/20 px-2 text-xs font-bold">
        {total}
      </span>
    </Link>
  );
}
