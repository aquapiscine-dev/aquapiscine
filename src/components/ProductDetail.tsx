import Link from "next/link";
import sanitizeHtml from "sanitize-html";
import { queryProducts, type Product } from "@/lib/products";
import { ProductTile } from "@/components/ProductTile";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Waterline } from "@/components/Waterline";

export async function ProductDetail({ product }: { product: Product }) {
  const images = safeJsonArray(product.images);
  const allImages = images.length ? images : product.image_url ? [product.image_url] : [];
  const price = product.sale_price ?? product.price;
  const inStock = product.in_stock === 1;

  const { products: related } = await queryProducts({
    category: product.category_slug ?? undefined,
    perPage: 5,
  });
  const relatedFiltered = related.filter((r) => r.id !== product.id).slice(0, 4);

  const cleanDescription = product.description
    ? sanitizeHtml(toHtmlDescription(product.description), {
        allowedTags: [
          "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li",
          "h2", "h3", "h4", "a", "table", "thead", "tbody", "tr", "td", "th",
          "img", "span", "div", "sub", "sup",
        ],
        allowedAttributes: {
          a: ["href", "target", "rel"],
          img: ["src", "alt", "width", "height"],
          td: ["colspan", "rowspan"],
          th: ["colspan", "rowspan"],
        },
        allowedSchemes: ["http", "https", "mailto"],
      })
    : null;

  return (
    <div className="depth-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="font-cta text-xs text-slate mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary-deep">Acasă</Link>
          <span className="mx-2">/</span>
          <Link href="/produse" className="hover:text-primary-deep">Produse</Link>
          {product.category_slug && (
            <>
              <span className="mx-2">/</span>
              <Link href={`/produse?category=${product.category_slug}`} className="hover:text-primary-deep">
                {product.category_name}
              </Link>
            </>
          )}
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Galerie */}
          <div>
            <div className="tile aspect-square relative bg-white overflow-hidden">
              {allImages[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={allImages[0]}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-contain p-6"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-slate/40">Fără imagine</div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {allImages.slice(0, 8).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`${product.name} — imagine ${i + 1}`}
                    className="tile aspect-square w-full object-contain bg-white p-2"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Informații */}
          <div>
            <div className="tile-legend">
              Nr. {String(product.id).padStart(4, "0")}
              {product.brand_name ? ` · ${product.brand_name}` : ""}
              {product.sku ? ` · SKU ${product.sku}` : ""}
            </div>

            <h1 className="font-display mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-ink leading-tight">
              {product.name}
            </h1>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-cta text-4xl font-bold text-ink">
                {fmt(price)} <span className="text-lg font-medium text-slate">RON</span>
              </span>
              {product.sale_price != null && product.sale_price < product.price && (
                <span className="font-cta text-lg text-slate line-through">{fmt(product.price)} RON</span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-4 font-cta text-sm">
              <span className={inStock ? "text-success font-medium" : "text-slate"}>
                {inStock ? "În stoc" : "La comandă"}
              </span>
              {product.availability && (
                <span className="text-slate/70 text-xs">{product.availability}</span>
              )}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <AddToCartButton
                product={{
                  id: product.id,
                  sku: product.sku,
                  name: product.name,
                  price,
                  image: allImages[0] ?? null,
                  slug: product.slug,
                }}
                disabled={!inStock}
              />
              <Link href="/contact" className="btn-pill btn-ghost px-6 py-3.5 text-xs">
                Întreabă despre produs
              </Link>
            </div>

            {product.short_description && (
              <p className="mt-6 text-sm text-slate leading-relaxed">{product.short_description}</p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-px bg-grout border border-grout text-sm">
              <div className="bg-white p-3">
                <div className="tile-legend">Producător</div>
                <div className="mt-1 font-medium text-ink">{product.brand_name ?? "—"}</div>
              </div>
              <div className="bg-white p-3">
                <div className="tile-legend">Categorie</div>
                <div className="mt-1 font-medium text-ink">{product.category_name ?? "—"}</div>
              </div>
              <div className="bg-white p-3">
                <div className="tile-legend">SKU</div>
                <div className="mt-1 font-medium text-ink">{product.sku}</div>
              </div>
              <div className="bg-white p-3">
                <div className="tile-legend">Stoc</div>
                <div className="mt-1 font-medium text-ink">
                  {inStock ? (product.stock > 0 ? `${product.stock} buc.` : "Disponibil") : "La comandă"}
                </div>
              </div>
            </div>

            <p className="mt-4 font-cta text-[11px] text-slate/60">
              Sursa: feed partener · actualizat {product.source_updated?.slice(0, 10) ?? "—"}
            </p>
          </div>
        </div>

        {cleanDescription && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink mb-4">Descriere</h2>
            <div className="tile p-6 sm:p-8">
              <div className="product-desc" dangerouslySetInnerHTML={{ __html: cleanDescription }} />
            </div>
          </section>
        )}

        {relatedFiltered.length > 0 && (
          <>
            <Waterline className="my-14" />
            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink mb-6">
                Produse similare
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-grout border border-grout">
                {relatedFiltered.map((p, i) => (
                  <div key={p.id} className="bg-white">
                    <ProductTile product={p} index={i} />
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// Descrierile din feed sunt text plat (fara taguri, fara newline-uri).
// Le impartim in paragrafe la final de fraza, max ~600 caractere, ca sa nu fie pereti de text.
function toHtmlDescription(raw: string): string {
  if (/<[a-z][\s\S]*>/i.test(raw)) return raw; // deja HTML
  const sentences = raw
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-ZĂÂÎȘȚ])/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length <= 1) return `<p>${escapeHtml(raw.trim())}</p>`;
  const paras: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if (cur && cur.length + s.length > 600) {
      paras.push(`<p>${escapeHtml(cur)}</p>`);
      cur = s;
    } else {
      cur = cur ? `${cur} ${s}` : s;
    }
  }
  if (cur) paras.push(`<p>${escapeHtml(cur)}</p>`);
  return paras.join("\n");
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeJsonArray(raw: string): string[] {
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function fmt(v: number) {
  return new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}
