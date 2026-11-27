import Link from "next/link";
import Image from "next/image";
import { getCategoryTree } from "@/lib/products";

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
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Caută pompe, filtre, piscine..."
                  className="w-full h-10 rounded-lg border border-grout bg-water-50 px-4 pr-10 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
                className="text-sm font-medium text-slate hover:text-primary-deep transition-colors"
              >
                Conectează-te
              </Link>
              <Link
                href="/cont/register"
                className="text-sm font-medium text-slate hover:text-primary-deep transition-colors"
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
            {/* Left nav */}
            <div className="flex items-center gap-1">
              {/* Produse + dropdown categorii — hover pe întregul grup */}
              <div className="group relative">
                <Link
                  href="/produse"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Produse
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                <div className="absolute left-0 top-full w-72 bg-white border border-grout shadow-lg rounded-b-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {categories.map((c) => (
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
                        <span className="flex-1">{c.name}</span>
                        <span className="text-xs text-slate/40">{c.product_count}</span>
                        {c.children.length > 0 && (
                          <svg className="w-3 h-3 text-slate/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </Link>
                      {/* Subcategorii — flyout la hover, ca pe totalwater */}
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
                  <div className="border-t border-grout mt-2 pt-2 px-4">
                    <Link href="/produse" className="block text-sm font-semibold text-primary-deep hover:underline">
                      Vezi tot catalogul →
                    </Link>
                  </div>
                </div>
              </div>

              {NAV.slice(1).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Phones — right side */}
            <div className="hidden lg:flex items-center gap-4 text-xs">
              {PHONES.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
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
