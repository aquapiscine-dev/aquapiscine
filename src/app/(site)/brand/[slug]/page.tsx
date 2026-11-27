import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandBySlug } from "@/lib/products";
import { CatalogBrowser } from "@/components/CatalogBrowser";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBrandBySlug(slug);
  if (!b) return { title: "Brand" };
  return {
    title: `Produse ${b.name}`,
    description: `Toate produsele ${b.name} din catalogul Aquapiscine.`,
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();
  return (
    <CatalogBrowser
      basePath={`/brand/${slug}`}
      sp={await searchParams}
      lockedBrand={slug}
      title={brand.name}
    />
  );
}
