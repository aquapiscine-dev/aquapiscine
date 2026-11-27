"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { CategoryNode } from "@/lib/products";

export function ProduseMenu({ categories }: { categories: CategoryNode[] }) {
  const [open, setOpen] = useState(false);
  const [openCat, setOpenCat] = useState<number | null>(null);

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
        aria-expanded={open}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Produse
        <svg
          className={`w-3 h-3 ml-1 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full w-72 max-w-[85vw] bg-white border border-grout shadow-lg rounded-b-lg py-2 z-50 max-h-[75vh] overflow-y-auto">
          {categories.map((c) => (
            <div key={c.id}>
              <div className="flex items-center">
                <Link
                  href={`/categorie-produs/${c.slug}/`}
                  onClick={() => setOpen(false)}
                  className="flex-1 flex items-center gap-3 px-4 py-2.5 text-sm text-slate hover:bg-water-50 hover:text-primary-deep transition-colors min-w-0"
                >
                  {c.image ? (
                    <Image src={c.image} alt="" width={24} height={24} className="h-6 w-6 rounded object-cover shrink-0" />
                  ) : (
                    <span className="w-6 h-6 rounded bg-water-100 flex items-center justify-center text-slate/40 shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-slate/40 shrink-0">{c.product_count}</span>
                </Link>
                {c.children.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setOpenCat(openCat === c.id ? null : c.id)}
                    className="px-3 py-2.5 text-ink hover:text-primary-deep transition-colors shrink-0"
                    aria-label={`Subcategorii ${c.name}`}
                  >
                    <svg
                      className={`w-3.5 h-3.5 transition-transform ${openCat === c.id ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>

              {openCat === c.id && c.children.length > 0 && (
                <div className="bg-water-50/60 border-y border-grout/60 py-1.5">
                  <Link
                    href={`/categorie-produs/${c.slug}/`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-1.5 text-[13px] font-semibold text-primary-deep hover:bg-water-50"
                  >
                    Toate — {c.name}
                  </Link>
                  {c.children.map((k) => (
                    <Link
                      key={k.id}
                      href={`/categorie-produs/${c.slug}/${k.slug}/`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate hover:bg-water-50 hover:text-primary-deep transition-colors"
                    >
                      {k.image ? (
                        <Image src={k.image} alt="" width={20} height={20} className="h-5 w-5 rounded object-cover shrink-0" />
                      ) : (
                        <span className="w-5 h-5 rounded bg-white shrink-0" />
                      )}
                      <span className="flex-1 truncate">{k.name}</span>
                      <span className="text-xs text-slate/40 shrink-0">{k.product_count}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="border-t border-grout mt-2 pt-2 px-4">
            <Link
              href="/produse"
              onClick={() => setOpen(false)}
              className="block text-sm font-semibold text-primary-deep hover:underline"
            >
              Vezi tot catalogul →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
