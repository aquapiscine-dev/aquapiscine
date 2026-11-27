import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-navy text-white mt-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Image src="/logo.webp" alt="Aquapiscine" width={169} height={31} className="h-8 w-auto brightness-0 invert" />
            <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xs">
              Echipamente și materiale complete pentru piscine, saune și spa. Catalog actualizat din rețeaua de furnizori parteneri.
            </p>
          </div>
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white/90">Magazin</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li><Link href="/produse" className="hover:text-white transition-colors">Toate produsele</Link></li>
              <li><Link href="/produse?sort=noutati" className="hover:text-white transition-colors">Noutăți</Link></li>
              <li><Link href="/servicii" className="hover:text-white transition-colors">Servicii</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white/90">Informații</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li><Link href="/despre-noi" className="hover:text-white transition-colors">Despre noi</Link></li>
              <li><Link href="/termeni" className="hover:text-white transition-colors">Termeni și condiții</Link></li>
              <li><Link href="/politica-confidentialitate" className="hover:text-white transition-colors">Confidențialitate</Link></li>
              <li><Link href="/retururi" className="hover:text-white transition-colors">Retururi</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white/90">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li>contact@aquapiscine.ro</li>
              <li>Luni–Vineri: 09:00–18:00</li>
              <li>Livrare în toată România</li>
              <li>Plată online securizată (Netopia)</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image src="/badges/anpc-sal1-1.webp" alt="ANPC - Soluționarea alternativă a litigiilor" width={500} height={124} className="h-10 w-auto" />
            <Image src="/badges/anpc-sol.webp" alt="ANPC" width={500} height={124} className="h-10 w-auto" />
          </div>
          <div className="text-xs text-white/40 flex flex-col sm:flex-row gap-2 sm:gap-4">
            <span>© {new Date().getFullYear()} Aquapiscine. Toate drepturile rezervate.</span>
            <span>Prețurile includ TVA.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
