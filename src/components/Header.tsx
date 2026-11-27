import Link from "next/link";
import Image from "next/image";
import { getCategoryTree } from "@/lib/products";
import { ProduseMenu } from "@/components/ProduseMenu";

const NAV = [
  { href: "/produse", label: "Produse", hasDropdown: true },
  { href: "/servicii", label: "Construcție" },
  { href: "/calculatoare", label: "Calculatoare" },
  { href: "/blog", label: "Blog" },
  { href: "/despre-noi", label: "Despre noi" },
];

const PHONES = [
  { label: "VÂNZĂRI", number: "0772 273 503" },
  { label: "TEHNIC - VÂNZĂRI", number: "0773 321 535" },
];

export async function Header() {
  const categories = await getCategoryTree();

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* TOP BAR — logo | search | auth + cart */}
      <div className="border-b border-grout">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0" aria-label="Aquapiscine — acasă">
              <Image
                src="/logo.webp"
                alt="Aquapiscine"
                width={169}
                height={31}
                priority
                className="h-8 w-auto"
              />
            </Link>

            {/* Search bar — centered */}
            <div className="flex-1 max-w-xl mx-4 min-w-0">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Caută pompe, filtre, piscine..."
                  className="w-full min-w-0 h-10 rounded-lg border border-grout bg-water-50 px-4 pr-10 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Auth + cart */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/cont/login"
                className="hidden sm:inline text-sm font-medium text-slate hover:text-primary-deep transition-colors"
              >
                Conectează-te
              </Link>
              <Link
                href="/cont/register"
                className="hidden sm:inline text-sm font-medium text-slate hover:text-primary-deep transition-colors"
              >
                Înregistrează-te
              </Link>
              <Link
                href="/cos"
                className="flex items-center gap-2 text-sm font-medium text-slate hover:text-primary-deep transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="hidden sm:inline">0 produse</span>
                <span className="text-slate/60">0,00 RON</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* NAV BAR — dark navy */}
      <nav className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11">
            {/* Produse + meniu categorii — click/tap, în afara containerului scrollabil ca să nu fie decupat */}
            <ProduseMenu categories={categories} />

            {/* Left nav — scroll orizontal pe mobil */}
            <div className="flex items-center gap-1 overflow-x-auto min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {NAV.slice(1).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Phones — right side */}
            <div className="hidden lg:flex items-center gap-4 text-xs">
              {PHONES.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-white/60">{p.label}</span>
                  <span className="font-medium text-white">{p.number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
