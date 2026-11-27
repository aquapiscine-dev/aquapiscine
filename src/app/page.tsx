import Link from "next/link";
import Image from "next/image";
import { queryProducts, getCategoryTree, getCategorySubtreeIds } from "@/lib/products";
import { ProductTile } from "@/components/ProductTile";
import { Waterline } from "@/components/Waterline";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = await getCategoryTree();

  const [aspirRes, pompeRes] = await Promise.all([
    getCategorySubtreeIds("aspiratoare-automate"),
    getCategorySubtreeIds("pompe-piscina"),
  ]);
  const [{ products: aspiratoare }, { products: pompe }] = await Promise.all([
    queryProducts({ categoryIds: aspirRes?.ids ?? [], perPage: 12, sort: "noutati" }),
    queryProducts({ categoryIds: pompeRes?.ids ?? [], perPage: 12, sort: "noutati" }),
  ]);

  return (
    <>
      {/* HERO — sidebar categorii stânga + banner dreapta */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar categorii — stânga */}
            <aside className="border border-grout rounded-xl bg-white h-fit">
              <div className="px-4 py-3 border-b border-grout bg-water-50 rounded-t-xl">
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                  Categorii
                </h2>
              </div>
              <nav className="divide-y divide-grout">
                {categories.slice(0, 10).map((c) => (
                  <div key={c.id} className="group/cat relative">
                    <Link
                      href={`/categorie-produs/${c.slug}/`}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate hover:bg-water-50 hover:text-primary-deep transition-colors"
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
                      <span className="text-xs text-slate/40">{c.product_count}</span>
                      {c.children.length > 0 && (
                        <svg className="w-3 h-3 text-slate/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </Link>
                    {/* Subcategorii — flyout la hover */}
                    {c.children.length > 0 && (
                      <div className="absolute left-full top-0 w-60 bg-white border border-grout shadow-lg rounded-r-lg py-2 opacity-0 invisible group-hover/cat:opacity-100 group-hover/cat:visible transition-all duration-150 z-50 -ml-px">
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
            </aside>

            {/* Banner hero — dreapta: text stânga + imagine dreapta */}
            <div className="relative rounded-2xl overflow-hidden border border-grout grid md:grid-cols-2 bg-white">
              <div className="bg-gradient-to-br from-navy via-[#123a7a] to-primary-deep p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                <p className="font-cta text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 mb-3">
                  Echipamente · Piscine · Saune · Spa
                </p>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                  Echipamente pentru<br />piscina ta
                </h1>
                <p className="mt-3 text-sm text-white/70 leading-relaxed max-w-sm hidden sm:block">
                  Peste 1400 de produse de la producători verificați: filtrare, pompe de căldură, acoperiri, accesorii saună.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/produse"
                    className="btn-pill inline-flex bg-white text-navy px-6 py-3 text-sm font-semibold hover:bg-water-100 transition-colors"
                  >
                    Vezi catalogul →
                  </Link>
                  <Link
                    href="/servicii"
                    className="btn-pill inline-flex border border-white/30 text-white px-6 py-3 text-sm font-semibold hover:bg-white/10 transition-colors"
                  >
                    Servicii
                  </Link>
                </div>

              </div>
              <div className="relative bg-white flex items-center justify-center p-6 lg:p-10 min-h-[220px]">
                <Image
                  src="/uploads/products/kitsp/0.webp"
                  alt="Kit de accesorii pentru saună"
                  width={600}
                  height={600}
                  className="max-h-[280px] lg:max-h-[340px] w-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Trust badges — full width, în interiorul hero-ului */}
          <div className="mt-6 bg-navy rounded-xl px-6 py-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
            {[
              ["LIVRARE ÎN 24-48H", "Rapid și sigur, oriunde în țară"],
              ["CONSULTANȚĂ TEHNICĂ", "Te ghidăm spre echipamentul potrivit"],
              ["EXPERIENȚĂ 15+ ANI", "Specialiști în echipamente de piscină"],
              ["CELE MAI BUNE PREȚURI", "Raport calitate-preț excelent"],
            ].map(([t, d], i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-display text-xs font-bold text-white tracking-wide">{t}</div>
                  <div className="text-[11px] text-white/60">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORII — un rând orizontal cu scroll */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-end justify-between mb-5">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              Cumpără pe categorii
            </h2>
            <Link href="/produse" className="font-cta text-sm font-medium text-primary-deep hover:underline shrink-0">
              Toate produsele →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categorie-produs/${c.slug}/`}
                className="group relative shrink-0 w-44 snap-start bg-white border border-grout rounded-xl overflow-hidden hover:border-primary transition-colors"
              >
                <div className="relative aspect-square bg-water-50 overflow-hidden">
                  {c.image ? (
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      sizes="176px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center font-display text-4xl font-extrabold text-grout">
                      {c.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                  <span className="font-display text-[13px] font-bold text-ink group-hover:text-primary-deep transition-colors leading-tight">
                    {c.name}
                  </span>
                  <svg className="w-4 h-4 shrink-0 text-slate/40 group-hover:text-primary-deep transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ASPIRATOARE AUTOMATE — 12 produse, 6 pe rând */}
      {aspiratoare.length > 0 && (
        <section className="bg-water-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-end justify-between mb-5">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
                  Aspiratoare automate
                </h2>
                <p className="mt-1 text-sm text-slate">Roboți pentru curățenia piscinei — Zodiac, Dolphin și alții.</p>
              </div>
              <Link href="/categorie-produs/curatare-piscina/aspiratoare-automate/" className="font-cta text-sm font-medium text-primary-deep hover:underline shrink-0">
                Vezi toate →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-grout border border-grout">
              {aspiratoare.map((p, i) => (
                <div key={p.id} className="bg-white">
                  <ProductTile product={p} index={i} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CPA — banner promo între secțiuni */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold">Echipamente profesionale pentru piscină</h3>
            <p className="mt-1 text-sm text-white/70">Peste 1400 de produse — pompe, filtre, tratamente, accesorii.</p>
          </div>
          <Link href="/produse" className="btn-pill inline-flex bg-white text-navy px-6 py-3 text-sm font-semibold hover:bg-water-100 transition-colors shrink-0">
            Explorează catalogul →
          </Link>
        </div>
      </section>

      {/* POMPE — 12 produse, 6 pe rând */}
      {pompe.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-end justify-between mb-5">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
                  Pompe pentru piscină
                </h2>
                <p className="mt-1 text-sm text-slate">Pompe de circulație, dozatoare și de caldă — cele mai căutate modele.</p>
              </div>
              <Link href="/categorie-produs/filtrare-piscina/pompe-piscina/" className="font-cta text-sm font-medium text-primary-deep hover:underline shrink-0">
                Vezi toate →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-grout border border-grout">
              {pompe.map((p, i) => (
                <div key={p.id} className="bg-white">
                  <ProductTile product={p} index={i} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
