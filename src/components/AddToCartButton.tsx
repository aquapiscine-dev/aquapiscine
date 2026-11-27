"use client";

import { useState } from "react";

export type CartProduct = {
  id: number;
  sku: string;
  name: string;
  price: number;
  image: string | null;
  slug: string;
};

const CART_KEY = "aquapiscine_cart";

export function getCart(): CartProduct[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function cartCount(): number {
  return getCart().length;
}

export function AddToCartButton({ product, disabled }: { product: CartProduct; disabled?: boolean }) {
  const [added, setAdded] = useState(false);

  if (disabled) {
    return (
      <span className="btn-pill px-7 py-3.5 text-sm bg-grout text-slate cursor-not-allowed">
        Indisponibil
      </span>
    );
  }

  return (
    <button
      type="button"
      className="btn-pill btn-primary px-8 py-3.5 text-sm"
      onClick={() => {
        const cart = getCart();
        const existing = cart.find((i) => i.id === product.id);
        if (existing) {
          // qty tracked separately — keep simple: replace
          localStorage.setItem(CART_KEY, JSON.stringify(cart.map((i) => (i.id === product.id ? product : i))));
        } else {
          localStorage.setItem(CART_KEY, JSON.stringify([...cart, product]));
        }
        window.dispatchEvent(new Event("cart:updated"));
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
      }}
    >
      {added ? "Adăugat ✓" : "Adaugă în coș"}
    </button>
  );
}
