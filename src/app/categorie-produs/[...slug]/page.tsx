import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { queryProducts, getCategorySubtreeIds, type ProductFilters } from "@/lib/products";
import { getDb } from "@/lib/db";
import { ProductTile } from "@/components/ProductTile";

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function brandsInCategory(ids: number[]) {
  const db = getDb();
  return db
    .prepare(
      `SELECT b.id, b.name, b.slug, COUNT(*) AS product_count
       FROM products p JOIN brands b ON b.id = p.brand_id
       WHERE p.is_active = 1 AND p.category_id IN (SELECT value FROM json_each(?))
       GROUP BY b.id ORDER BY product_count DESC LIMIT 20`
    )
    .all(JSON.stringify(ids)) as { id: number; name: string; slug: string; product_count: number }[];
}

// /categorie-produs/{parinte}/{copil}/ — slug-ul categoriei e ultimul segment
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const leaf = slug[slug.length - 1];
  const res = getCategorySubtreeIds(leaf);
  if (!res) return { title: "Categorie" };
  return {
    title: res.cat.name,
    description: `${res.cat.name} — echipamente și produse pentru piscină, saună și spa. Livrare în toată România.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: SP;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const leaf = slug[slug.length - 1];
  const res = getCategorySubtreeIds(leaf);
  if (!res) notFound();
  const { cat, ids } = res;

  const filters: ProductFilters = {
    categoryIds: ids,
    q: one(sp.q) || undefined,
    brand: one(sp.brand) || undefined,
    minPrice: one(sp.min) ? parseFloat(one(sp.min)!) : undefined,
    maxPrice: one(sp.max) ? parseFloat(one(sp.max)!) : undefined,
    inStock: one(sp.stoc) === "1" || undefined,
    sort: (one(sp.sort) as ProductFilters["sort"]) || "noutati",
    page: one(sp.page) ? parseInt(one(sp.page)!, 10) : 1,
    perPage: 24,
  };

  const { products, total, page, totalPages } = queryProducts(filters);
  const brands = brandsInCategory(ids);
  const basePath = `/categorie-produs/${slug.join("/")}/`;

  const withParams = (extra: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      q: filters.q,
      min: filters.minPrice?.toString(),
      max: filters.maxPrice?.toString(),
      stoc: filters.inStock ? "1" : undefined,
      brand: filters.brand,
      sort: filters.sort !== "noutati" ? filters.sort : undefined,
      ...extra,
    };
    for (const [k, v] of Object.entries(merged)) if (v) q.set(k, v);
    const qs = q.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };

  const crumbs = [...(cat.parent ? [cat.parent.name] : []), cat.name];

  return (
    <div className="depth-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <nav className="font-cta text-xs text-slate mb-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary-deep">Acasă</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{cat.parent ? (
            <>
              <Link href={`/categorie-produs/${slug.slice(0, -1).join("/")}/`} className="hover:text-primary-deep">
                {cat.parent.name}
              </Link>
              <span className="mx-2">/</span>
            </>
          ) : null}
          {cat.name}
          </span>
        </nav>

        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                {cat.name}
              </h1>
              <p className="font-cta text-sm text-slate mt-2">
                {total.toLocaleString("ro-RO")} produse
                {cat.children.length > 0 && ` · ${cat.children.length} subcategorii`}
              </p>
            </div>
            {cat.image && (
              <div className="relative w-full sm:w-56 aspect-[16/9] overflow-hidden rounded-sm border border-grout bg-white shrink-0">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="224px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
          {cat.children.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {cat.children.map((k) => (
                <Link
                  key={k.id}
                  href={`/categorie-produs/${slug.join("/") === cat.slug ? cat.slug : `${slug.join("/")}/${k.slug}`}/`}
                  className="font-cta text-xs px-3 py-1.5 rounded-full border border-grout bg-white text-slate hover:border-primary hover:text-primary-deep transition-colors"
                >
                  {k.name}
                </Link>
              ))}
            </div>
          )}
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* FILTRE */}
          <aside className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <form method="GET" action={basePath} className="space-y-5">
                {filters.brand ? <input type="hidden" name="brand" value={filters.brand} /> : null}

                <div>
                  <h3 className="font-display text-xs font-bold uppercase tracking-widest text-ink mb-2">Căutare</h3>
                  <input
                    type="search"
                    name="q"
                    defaultValue={filters.q ?? ""}
                    placeholder="În această categorie…"
                    className="w-full h-9 rounded-lg border border-grout bg-white px-3 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <h3 className="font-display text-xs font-bold uppercase tracking-widest text-ink mb-2">Preț (RON)</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="min"
                      defaultValue={filters.minPrice ?? ""}
                      placeholder="Min"
                      min={0}
                      className="w-full h-9 rounded-lg border border-grout bg-white px-3 text-sm focus:outline-none focus:border-primary"
                    />
                    <span className="text-slate text-sm">–</span>
                    <input
                      type="number"
                      name="max"
                      defaultValue={filters.maxPrice ?? ""}
                      placeholder="Max"
                      min={0}
                      className="w-full h-9 rounded-lg border border-grout bg-white px-3 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                  <input type="checkbox" name="stoc" value="1" defaultChecked={filters.inStock} className="accent-[#1495e9]" />
                  Doar în stoc
                </label>

                <button type="submit" className="btn-pill btn-primary w-full py-2.5 text-xs">
                  Aplică filtrele
                </button>
                <Link href={basePath} className="block text-center font-cta text-xs text-slate hover:text-primary-deep">
                  Resetează
                </Link>
              </form>

              {brands.length > 0 && (
                <div>
                  <h3 className="font-display text-xs font-bold uppercase tracking-widest text-ink mb-2">Branduri</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {brands.map((b) => (
                      <Link
                        key={b.id}
                        href={withParams({ brand: filters.brand === b.slug ? undefined : b.slug, page: undefined })}
                        className={`font-cta text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                          filters.brand === b.slug
                            ? "bg-primary text-white border-primary"
                            : "border-grout bg-white text-slate hover:border-primary hover:text-primary-deep"
                        }`}
                      >
                        {b.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* LISTING */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <p className="font-cta text-sm text-slate">{total.toLocaleString("ro-RO")} produse</p>
              <form method="GET" action={basePath} className="flex items-center gap-2">
                {filters.q ? <input type="hidden" name="q" value={filters.q} /> : null}
                {filters.brand ? <input type="hidden" name="brand" value={filters.brand} /> : null}
                {filters.minPrice != null ? <input type="hidden" name="min" value={filters.minPrice} /> : null}
                {filters.maxPrice != null ? <input type="hidden" name="max" value={filters.maxPrice} /> : null}
                {filters.inStock ? <input type="hidden" name="stoc" value="1" /> : null}
                <label htmlFor="sort" className="font-cta text-xs text-slate">Sortează:</label>
                <select
                  id="sort"
                  name="sort"
                  defaultValue={filters.sort}
                  className="h-9 rounded-lg border border-grout bg-white px-2 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="noutati">Cele mai noi</option>
                  <option value="price-asc">Preț crescător</option>
                  <option value="price-desc">Preț descrescător</option>
                  <option value="name">Nume A–Z</option>
                </select>
                <button type="submit" className="btn-pill btn-ghost px-4 py-2 text-xs">OK</button>
              </form>
            </div>

            {products.length === 0 ? (
              <div className="tile p-12 text-center">
                <p className="font-display text-lg font-bold text-ink">Niciun produs găsit</p>
                <p className="mt-2 text-sm text-slate">Încearcă alte filtre sau un alt termen de căutare.</p>
                <Link href={basePath} className="btn-pill btn-primary mt-6 inline-flex px-6 py-3 text-xs">
                  Resetează filtrele
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-grout border border-grout">
                  {products.map((p, i) => (
                    <div key={p.id} className="bg-white">
                      <ProductTile product={p} index={i} />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Paginare">
                    {page > 1 && (
                      <Link href={withParams({ page: String(page - 1) })} className="btn-pill btn-ghost px-4 py-2 text-xs">← Înapoi</Link>
                    )}
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                      const p = start + i;
                      if (p > totalPages) return null;
                      return (
                        <Link
                          key={p}
                          href={withParams({ page: String(p) })}
                          className={`font-cta text-xs px-3 py-2 rounded-full border ${
                            p === page
                              ? "bg-primary text-white border-primary"
                              : "border-grout text-slate hover:border-primary"
                          }`}
                        >
                          {p}
                        </Link>
                      );
                    })}
                    {page < totalPages && (
                      <Link href={withParams({ page: String(page + 1) })} className="btn-pill btn-ghost px-4 py-2 text-xs">Înainte →</Link>
                    )}
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
