import Link from "next/link";
import { queryProducts, getCategoryTree, listBrands, type ProductFilters } from "@/lib/products";
import { ProductTile } from "@/components/ProductTile";

type SP = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export async function CatalogBrowser({
  basePath,
  sp,
  pageOverride,
  title,
  lockedBrand,
}: {
  basePath: string; // "/produse" | "/magazin" | "/brand/{slug}"
  sp: SP;
  pageOverride?: number;
  title?: string;
  lockedBrand?: string;
}) {
  const filters: ProductFilters = {
    q: one(sp.q) || undefined,
    category: one(sp.category) || undefined,
    brand: lockedBrand ?? (one(sp.brand) || undefined),
    minPrice: one(sp.min) ? parseFloat(one(sp.min)!) : undefined,
    maxPrice: one(sp.max) ? parseFloat(one(sp.max)!) : undefined,
    inStock: one(sp.stoc) === "1" || undefined,
    sort: (one(sp.sort) as ProductFilters["sort"]) || "noutati",
    page: pageOverride ?? (one(sp.page) ? parseInt(one(sp.page)!, 10) : 1),
    perPage: 24,
  };

  const [{ products, total, page, totalPages }, categories, brands] = await Promise.all([
    queryProducts(filters),
    getCategoryTree(),
    listBrands(),
  ]);
  const activeCategory = filters.category;
  const activeBrand = filters.brand;

  const pageLink = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      const s = one(v as string | string[] | undefined);
      if (s && k !== "page") params.set(k, s);
    }
    // /magazin pastreaza formatul vechi /magazin/page/N/ (ca pe WooCommerce)
    if (basePath === "/magazin") {
      const qs = params.toString();
      return `/magazin/page/${p}/${qs ? `?${qs}` : ""}`;
    }
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  const homeLink = basePath === "/magazin" ? "/magazin/" : basePath;

  return (
    <div className="depth-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <nav className="font-cta text-xs text-slate mb-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary-deep">Acasă</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{title ?? "Produse"}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtre */}
          <aside className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <form method="GET" action={basePath} className="space-y-5">
                {filters.q ? <input type="hidden" name="q" value={filters.q} /> : null}
                {filters.sort ? <input type="hidden" name="sort" value={filters.sort} /> : null}
                {filters.brand ? <input type="hidden" name="brand" value={filters.brand} /> : null}

                <div>
                  <h3 className="font-display text-xs font-bold uppercase tracking-widest text-ink mb-2">Căutare</h3>
                  <input
                    type="search"
                    name="q"
                    defaultValue={filters.q ?? ""}
                    placeholder="Nume, SKU…"
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
                <Link href={homeLink} className="block text-center font-cta text-xs text-slate hover:text-primary-deep">
                  Resetează
                </Link>
              </form>

              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-widest text-ink mb-2">Categorii</h3>
                <ul className="space-y-1 max-h-80 overflow-y-auto pr-1">
                  <li>
                    <Link
                      href={homeLink}
                      className={`block text-sm py-1 ${!activeCategory ? "text-primary-deep font-semibold" : "text-slate hover:text-primary-deep"}`}
                    >
                      Toate ({total})
                    </Link>
                  </li>
                  {categories.flatMap((c) => [
                    <li key={`p-${c.id}`}>
                      <Link
                        href={`/categorie-produs/${c.slug}/`}
                        className={`block text-sm py-1 font-semibold ${activeCategory === c.slug ? "text-primary-deep" : "text-ink hover:text-primary-deep"}`}
                      >
                        {c.name}
                        <span className="ml-1 text-xs text-slate/50">({c.product_count})</span>
                      </Link>
                    </li>,
                    ...c.children.map((k) => (
                      <li key={`c-${k.id}`} className="pl-3">
                        <Link
                          href={`/categorie-produs/${c.slug}/${k.slug}/`}
                          className={`block text-[13px] py-0.5 ${activeCategory === k.slug ? "text-primary-deep font-semibold" : "text-slate hover:text-primary-deep"}`}
                        >
                          {k.name}
                          <span className="ml-1 text-xs text-slate/50">({k.product_count})</span>
                        </Link>
                      </li>
                    )),
                  ])}
                </ul>
              </div>

              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-widest text-ink mb-2">Branduri</h3>
                <div className="flex flex-wrap gap-1.5">
                  {brands.slice(0, 20).map((b) => (
                    <Link
                      key={b.id}
                      href={lockedBrand ? `/brand/${b.slug}/` : `${basePath}?brand=${b.slug}`}
                      className={`font-cta text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                        activeBrand === b.slug
                          ? "bg-primary text-white border-primary"
                          : "border-grout bg-white text-slate hover:border-primary hover:text-primary-deep"
                      }`}
                    >
                      {b.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Listing */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                  {filters.q ? `Rezultate pentru „${filters.q}"` : (title ?? "Toate produsele")}
                </h1>
                <p className="font-cta text-sm text-slate mt-1">{total.toLocaleString("ro-RO")} produse</p>
              </div>
              <form method="GET" action={basePath} className="flex items-center gap-2">
                {filters.q ? <input type="hidden" name="q" value={filters.q} /> : null}
                {filters.category ? <input type="hidden" name="category" value={filters.category} /> : null}
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
                <Link href={homeLink} className="btn-pill btn-primary mt-6 inline-flex px-6 py-3 text-xs">
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
                      <Link href={pageLink(page - 1)} className="btn-pill btn-ghost px-4 py-2 text-xs">← Înapoi</Link>
                    )}
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      // fereastră simplă în jurul paginii curente
                      const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                      const p = start + i;
                      if (p > totalPages) return null;
                      return (
                        <Link
                          key={p}
                          href={pageLink(p)}
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
                      <Link href={pageLink(page + 1)} className="btn-pill btn-ghost px-4 py-2 text-xs">Înainte →</Link>
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
