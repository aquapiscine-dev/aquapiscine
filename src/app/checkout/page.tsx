import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="depth-bg min-h-screen">
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="tile-legend">Pasul 4 · Confirmare</div>
        <h1 className="font-display mt-2 text-3xl font-bold text-ink">Finalizarea comenzii</h1>
        <p className="mt-3 text-slate">Plata online și comanda vor fi activate în faza a doua.</p>
        <Link href="/cos" className="btn-pill btn-primary mt-8 inline-flex px-8 py-3.5 text-sm">
          Înapoi la coș
        </Link>
      </div>
    </div>
  );
}
