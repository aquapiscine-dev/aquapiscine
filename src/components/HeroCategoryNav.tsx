"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { CategoryNode } from "@/lib/products";

export function HeroCategoryNav({ categories }: { categories: CategoryNode[] }) {
  const [openCat, setOpenCat] = useState<number | null>(null);

  return (
    <nav className="divide-y divide-grout">
      {categories.map((c) => (
        <div key={c.id} className="group/cat relative">
          <div className="flex items-center">
            <Link
              href={`/categorie-produs/${c.slug}/`}
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
              {c.children.length > 0 && (
                <svg className="hidden lg:block w-3 h-3 text-ink shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </Link>
            {c.children.length > 0 && (
              <button
                type="button"
                onClick={() => setOpenCat(openCat === c.id ? null : c.id)}
                className="lg:hidden px-3 py-2.5 text-ink hover:text-primary-deep transition-colors shrink-0"
                aria-label={`Subcategorii ${c.name}`}
                aria-expanded={openCat === c.id}
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

          {/* Subcategorii — accordion inline pe mobil */}
          {openCat === c.id && c.children.length > 0 && (
            <div className="lg:hidden bg-water-50/60 border-y border-grout/60 py-1.5">
              <Link
                href={`/categorie-produs/${c.slug}/`}
                className="block px-4 py-1.5 text-[13px] font-semibold text-primary-deep hover:bg-water-50"
              >
                Toate — {c.name}
              </Link>
              {c.children.map((k) => (
                <Link
                  key={k.id}
                  href={`/categorie-produs/${c.slug}/${k.slug}/`}
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

          {/* Subcategorii — flyout la hover, doar desktop */}
          {c.children.length > 0 && (
            <div className="absolute left-full top-0 w-60 max-lg:hidden bg-white border border-grout shadow-lg rounded-r-lg py-2 opacity-0 invisible group-hover/cat:opacity-100 group-hover/cat:visible transition-all duration-150 z-50 -ml-px">
              <Link
                href={`/categorie-produs/${c.slug}/`}
                className="block px-4 py-2 text-sm font-semibold text-primary-deep hover:bg-water-50"
              >
                Toate — {c.name}
              </Link>
              <div className="border-t border-grout my-1" />
              {c.children.map((k) => (
                <Link
                  key={k.id}
                  href={`/categorie-produs/${c.slug}/${k.slug}/`}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate hover:bg-water-50 hover:text-primary-deep transition-colors"
                >
                  {k.image ? (
                    <Image src={k.image} alt="" width={20} height={20} className="h-5 w-5 rounded object-cover shrink-0" />
                  ) : (
                    <span className="w-5 h-5 rounded bg-water-100 shrink-0" />
                  )}
                  <span className="flex-1 truncate">{k.name}</span>
                  <span className="text-xs text-slate/40">{k.product_count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
