import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";

function fmtPrice(v: number | null | undefined) {
  if (v == null) return "—";
  return new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

export function ProductTile({ product, index }: { product: Product; index?: number }) {
  const img = product.image_url;
  const inStock = product.in_stock === 1;
  const plateNo = String(product.id).padStart(4, "0");

  return (
    <Link
      href={`/produse/${product.slug}`}
      className="tile tile-hover group flex flex-col overflow-hidden focus-visible:outline-2 focus-visible:outline-primary"
    >
      <div className="relative aspect-square bg-water-50 overflow-hidden">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate/40">Fără imagine</div>
        )}
        {!inStock && (
          <span className="absolute top-2 left-2 bg-ink/80 text-white text-[10px] font-cta font-medium uppercase tracking-wider px-2 py-1">
            Stoc epuizat
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="tile-legend truncate">
          Nr. {plateNo}
          {product.brand_name ? ` · ${product.brand_name}` : ""}
        </div>
        <h3 className="font-display text-[13px] font-semibold leading-snug text-ink line-clamp-2 group-hover:text-primary-deep transition-colors min-h-[2.4em]">
          {product.name}
        </h3>
        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
          <div>
            {product.sale_price != null && product.sale_price < product.price ? (
              <>
                <span className="font-cta text-lg font-bold text-sale leading-none">{fmtPrice(product.sale_price)} RON</span>
                <span className="ml-1.5 font-cta text-xs text-slate line-through">{fmtPrice(product.price)}</span>
              </>
            ) : (
              <span className="font-cta text-lg font-bold text-ink leading-none">{fmtPrice(product.price)} RON</span>
            )}
          </div>
          <span
            className={`font-cta text-[10px] uppercase tracking-wider ${
              inStock ? "text-success" : "text-slate/60"
            }`}
          >
            {inStock ? "În stoc" : "La comandă"}
          </span>
        </div>
      </div>
    </Link>
  );
}
