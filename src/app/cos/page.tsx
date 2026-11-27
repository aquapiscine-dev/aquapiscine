"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCart, type CartProduct } from "@/components/AddToCartButton";

export default function CosPage() {
  const [items, setItems] = useState<CartProduct[] | null>(null);

  useEffect(() => {
    setItems(getCart());
    const onUpdate = () => setItems(getCart());
    window.addEventListener("cart:updated", onUpdate);
    return () => window.removeEventListener("cart:updated", onUpdate);
  }, []);

  if (items === null) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-slate">Se încarcă…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-ink">Coșul tău este gol</h1>
        <p className="mt-3 text-slate">Adaugă produse din catalog pentru a continua.</p>
        <Link href="/produse" className="btn-pill btn-primary mt-8 inline-flex px-8 py-3.5 text-sm">
          Vezi produsele
        </Link>
      </div>
    );
  }

  const total = items.reduce((s, i) => s + i.price, 0);

  return (
    <div className="depth-bg min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Coșul tău</h1>
        <p className="font-cta text-sm text-slate mt-1">{items.length} produse</p>

        <div className="mt-8 space-y-px bg-grout border border-grout">
          {items.map((item) => (
            <div key={item.id} className="bg-white flex items-center gap-4 p-4">
              <Link href={`/produse/${item.slug}`} className="w-20 h-20 tile bg-water-50 shrink-0 relative overflow-hidden">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} className="absolute inset-0 h-full w-full object-contain p-2" />
                ) : null}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/produse/${item.slug}`} className="font-display text-sm font-semibold text-ink hover:text-primary-deep line-clamp-2">
                  {item.name}
                </Link>
                <div className="font-cta text-xs text-slate mt-1">SKU {item.sku}</div>
              </div>
              <div className="font-cta text-base font-bold text-ink whitespace-nowrap">
                {item.price.toLocaleString("ro-RO", { minimumFractionDigits: 2 })} RON
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = getCart().filter((i) => i.id !== item.id);
                  localStorage.setItem("aquapiscine_cart", JSON.stringify(next));
                  window.dispatchEvent(new Event("cart:updated"));
                }}
                className="font-cta text-xs text-slate hover:text-sale px-2"
                aria-label={`Șterge ${item.name}`}
              >
                Șterge
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-cta text-sm text-slate">
            Total: <span className="text-2xl font-bold text-ink">{total.toLocaleString("ro-RO", { minimumFractionDigits: 2 })} RON</span>
          </div>
          <Link href="/checkout" className="btn-pill btn-primary px-10 py-4 text-sm">
            Continuă la comandă
          </Link>
        </div>
      </div>
    </div>
  );
}
