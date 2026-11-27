import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/CatalogBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Magazin",
  description: "Catalog complet echipamente piscine, saune și spa.",
};

export default async function MagazinPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CatalogBrowser basePath="/magazin" sp={await searchParams} title="Magazin" />;
}
