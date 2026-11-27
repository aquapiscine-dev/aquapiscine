import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByLegacyPath } from "@/lib/products";
import { ProductDetail } from "@/components/ProductDetail";
import { CatalogBrowser } from "@/components/CatalogBrowser";

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug[0] === "page") return { title: "Magazin" };
  const p = await getProductByLegacyPath(`/magazin/${slug.join("/")}`);
  if (!p) return { title: "Produs" };
  return {
    title: p.name,
    description: p.short_description || `${p.name} — ${p.brand_name ?? ""} la Aquapiscine`,
    alternates: { canonical: p.legacy_path ?? `/magazin/${slug.join("/")}` },
  };
}

export default async function MagazinSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: SP;
}) {
  const { slug } = await params;

  // /magazin/page/N/ — paginare ca pe WooCommerce
  if (slug[0] === "page") {
    const n = slug.length === 1 ? 1 : parseInt(slug[1] ?? "", 10);
    if (slug.length <= 2 && Number.isFinite(n) && n >= 1) {
      return <CatalogBrowser basePath="/magazin" sp={await searchParams} pageOverride={n} title="Magazin" />;
    }
    notFound();
  }

  // /magazin/{categorie}/{sub}/{slug-produs}/ — URL vechi identic
  const product = await getProductByLegacyPath(`/magazin/${slug.join("/")}`);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
