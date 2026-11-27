import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Cont" };

export default function ContPage() {
  return (
    <div className="depth-bg min-h-screen">
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-ink">Contul meu</h1>
        <p className="mt-3 text-slate">Autentificarea va fi disponibilă în faza a doua.</p>
        <Link href="/produse" className="btn-pill btn-primary mt-8 inline-flex px-8 py-3.5 text-sm">
          Continuă cumpărăturile
        </Link>
      </div>
    </div>
  );
}
