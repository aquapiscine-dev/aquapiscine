"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const query = q.trim();
        router.push(query ? `/produse?q=${encodeURIComponent(query)}` : "/produse");
      }}
      className="relative"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Caută produse (pompa, filtru, sauna…)"
        className="w-full h-10 rounded-full border border-grout bg-water-50 pl-4 pr-12 text-sm text-ink placeholder:text-slate/60 focus:outline-none focus:border-primary focus:bg-white transition-colors"
        aria-label="Caută produse"
      />
      <button
        type="submit"
        className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-deep transition-colors"
        aria-label="Caută"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}
