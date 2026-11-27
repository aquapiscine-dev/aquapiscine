# AQUAPICINE NOU — Specificație platformă + identitate vizuală

Proiect: magazin online de echipamente piscine/saune, clonă funcțională a totalwater.ro ca arhitectură, cu identitatea vizuală a aquapiscine.ro (WordPress + WooCommerce + Flatsome).

Data analizei: 25 Nov 2026. Working dir: `~/Desktop/AQUAPICINE NOU/`.

---

## 1. Sursa de produse

Fișier: `PRODUSE TOTAL WATER/feed instalator - feed instalator.csv (1).csv` (~1400 produse, 1.5 MB).

Feed de export totalwater.ro (varianta "instalator"/reseller). Coloane:

- `name` — nume produs complet
- `price` — preț RON (ex: 6113.5)
- `sku` — cod produs (ex: kit4.d750)
- `imageUrl` — imagine webp mare: `https://www.totalwater.ro/media/produse/large/<slug>-<id>.webp`
- `productUrl` — URL pagină produs totalwater.ro
- `availability` — "in stock" / alte variante
- `description` — HTML complet (caracteristici, tabele, uneori text promo)
- `shortDescription` — gol în majoritatea cazurilor
- `category` — string plat, o singură categorie per produs (ex: "Kituri filtrare")
- `brand` — producător (AstralPool, Fairland, Dolphin, Hayward, Rento etc.)
- `isActive` — TRUE/FALSE

Import: script unic din CSV la început + re-import manual la actualizări. Nu există URL public de feed confirmat — sync automat rămâne opțiune viitoare.

Normalize de făcut la import:

- Categorii: string plat → ierarhie părinte/subcategorie (mapare manuală o dată, tabel `category_map`)
- Imagini: descărcare locală în `public/uploads/products/<sku>/` sau proxy cu cache (evităm hotlink către totalwater.ro — se poate rupe oricând)
- `description` HTML: curățare/sanitizare (produsele lor conțin HTML valid, dar trebuie sanitizat înainte de randare)
- `availability` → boolean `inStock`
- Produse `isActive=FALSE` → skip sau import inactive

---

## 2. Identitatea vizuală — preluată de la aquapiscine.ro

### Logo

- Fișier: `~/Desktop/AQUAPISCINE/logo.webp` (descărcat din `wp-content/uploads/2023/03/logo-aquapiscine-1500-279-e1727252927394.webp`)
- Randat: 169×31 px, imagine orizontală, text "Aquapiscine"
- DECIZIE user (25 Nov 2026): folosim fișierul curent acum; variantele la dimensiuni mari vor veni ulterior și se înlocuiesc

### Paletă de culori (extrase din CSS live — sursa: computed styles + CSS vars Flatsome)

| Token | Hex | Utilizare |
|---|---|---|
| `--color-primary` | `#1495e9` | Butoane (Adaugă în coș, Cumpără), linkuri active, badge-uri |
| `--color-primary-dark` | `#0261b4` | Varianta închisă primary (badge-uri mici, hover butoane) |
| `--color-blue-2` | `#2980b9` | Albastru secundar (hover states, iconițe) |
| `--color-blue-3` | `#0077be` | Albastru terțiar |
| `--color-navy` | `#0d2b6e` | Headere h3, elemente dark (echivalent `--fs-color-primary` contexts) |
| `--color-blue-text` | `#1a5276` | Text h3/section titles |
| `--color-accent-gold` | `#eaba6b` | Hover pe linkuri text, detalii decorative |
| `--color-accent-orange` | `#ff6b35` | Accente promo, elemente highlight |
| `--color-sale` | `#dd3333` | Preț reducere, badge "-X%" / "SALE" |
| `--color-star` | `#eeee22` | Stele review (echivalent galben-verde) |
| `--color-bg` | `#ffffff` | Fundal general |
| `--color-bg-alt` | `#f5f5f5` / `#ececec` | Secțiuni alternate, hover cards, input fundal |
| `--color-text` | `#000000` / `#4a4a4a` | Body text; nav e `rgba(74,74,74,0.85)` |
| `--color-border` | `#ececec` / `rgb(0 0 0 / .1)` | Card borders, separatoare |
| `--color-success` | verde (neconfirmat exact, Flatsome default `#4caf50`-ish) | Mesaje succes — de verificat la nevoie |
| `--color-alert` | roșu | Mesaje eroare |

Flatsome CSS vars găsite live: `--fs-color-primary: #1495e9`, `--fs-color-secondary: #0261b4`, headere `h1,h2,h3,h4,h5,h6 { color:#000 }`, butoane `.button { background:#1495e9 !important; color:#fff; text-transform:uppercase; font-weight:700; border-radius:99px (pill) }`, badge sale fundal `rgba(221,51,51,0.7)`, preț vechi `del` gri cu linie, preț nou `ins` roșu `#dd3333`, inputuri border `#ddd` radius mic.

### Fonturi

- **Montserrat** (Google Fonts, wght 400) — folosit în hero slider pentru titluri mari; propunem Montserrat pentru toate headerele/section titles
- **Roboto** (wght 500) — folosit în hero pentru butoane; alternativ pentru butoane/CTA
- **Body**: site-ul original folosește sans-serif de sistem (fără font custom pe body — computed style confirmat). Propunere: **Inter** pentru body ( lizibil, modern) SAU Montserrat peste tot pentru consistență de brand — de decis la design
- Încarcare: `fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Roboto:wght@500&family=Inter:wght@400;500;600&display=swap` (decizie finală la implementare)

### Elemente de stil observate

- Butoane: pill (border-radius 999px), uppercase, bold, albastru `#1495e9`
- Headere secțiuni: `.section-title` cu linie subțire decorativă (`<b>` height 2px, opacity .1) lângă titlu uppercase
- Carduri produs: imagine pătrată-ish, preț, stele galbene, buton "Adaugă în coș"
- Badge "-X%" pe imagini (fundal roșu semi-transparent)
- Header alb sticky cu logo stânga, meniu orizontal, iconițe coș/căutare cont
- Top bar subțire deasupra header-ului (există în Flatsome — de verificat conținutul: telefon, email, program)

---

## 3. Stack tehnic

Decizie: **o singură aplicație Next.js 16** (App Router, Turbopack) cu storefront + admin în `/admin` — varianta "simplu" confirmată de user.

```
Next.js 16 (App Router)
├── Storefront (pagini publice)
│   ├── /                    homepage
│   ├── /produse             listare cu filtre/search
│   ├── /produse/[slug]      pagină produs
│   ├── /categorii/[slug]    listare pe categorie
│   ├── /cos                 coș
│   ├── /checkout            comandă + plată
│   ├── /cont/*              cont client (comenzi, adrese, favorite)
│   ├── /login /register
│   └── /contact, /despre-noi, /termeni etc.
├── /admin                   admin panel (în aceeași app)
│   ├── /admin/produse       CRUD produse
│   ├── /admin/comenzi       listare + status comenzi
│   ├── /admin/ clienti      clienți
│   ├── /admin/feed          import/export CSV feed
│   ├── /admin/categorii     mapare categorii
│   ├── /admin/cuprone       cupoane
│   └── /admin/setari        setări magazin
└── /api/*                   route handlers
    ├── /api/products        catalog public
    ├── /api/search          căutare
    ├── /api/cart            coș (cookie/session)
    ├── /api/orders          comenzi
    ├── /api/auth/*          login/register/refresh
    └── /api/admin/*         endpoint-uri admin (JWT)
```

DB: **Postgres** (sau SQLite pentru dev local, migrare la Postgres la deploy). Tabele minime:

- `products` (id, sku, name, slug, price, salePrice, stock, brandId, categoryId, images json, description, shortDescription, specs json, isActive, feedUpdatedAt)
- `categories` (id, name, slug, parentId, image)
- `brands` (id, name, slug)
- `users` (clienți + admin, role)
- `orders`, `order_items`, `addresses`
- `feed_imports` (istoric importuri CSV: fișier, dată, produs create/actualizate)
- `coupons`

---

## 4. Funcționalități — faze

### Faza 1 — Fundament + vitrină
- [ ] Proiect Next.js 16 + Tailwind, design tokens din secțiunea 2 (logo, culori, fonturi)
- [ ] DB schema + script import CSV feed (1400 produse)
- [ ] Mapare categorii feed → ierarhie site
- [ ] Download imagini produse (local `public/uploads`)
- [ ] Homepage: hero, categorii populare, produse recomandate, secțiuni promo
- [ ] /produse: grid + filtre (categorie, preț, brand, stoc) + sortare + search
- [ ] /produse/[slug]: galerie imagini, preț, stoc, descriere HTML, specificații, ADAUGĂ ÎN COȘ
- [ ] SEO: metadata, OG, sitemap.xml, robots.txt

### Faza 2 — Coș + comandă
- [ ] Coș (cookie anonim → atașat la user la login)
- [ ] Checkout: date client, adresă livrare/facturare, metodă livrare (curier + puncte pickup opțional)
- [ ] Cont client: înregistrare, login JWT, comenzi, adrese, favorite
- [ ] Confirmare comandă + email

### Faza 3 — Plăți + admin
- [ ] Integrare **Netopia** (card + OP; la checkout redirect 3DS)
- [ ] Webhook Netopia → status comandă
- [ ] Admin: dashboard comenzi, management produse, clienți, cupoane
- [ ] Re-import feed din admin (upload CSV)

### Faza 4 — Opțional
- SmartBill (emitere factură automată la comandă)
- Curier AWB (Cargus/DPD/Fancourier/Sameday — ca la totalwater)
- Blog, pagini CMS, recenzii produse, program fidelitate
- Sincronizare automată feed (dacă găsim URL)

---

## 5. Constatări din analiza totalwater.ro (referință arhitectură)

- Next.js 16.4.2 + React 19.2.7, Turbopack, self-hosted nginx, ISR
- Admin separat Vite SPA la /admin (~50 pagini): produse, comenzi, feed import cu mapping+sync, parteneri POS, SmartBill, AWB curieri, blog cu AI, page builder, temă
- API custom /api/* format `{"success","message","data"}`, JWT Bearer + refresh cookie
- Plăți detectate: Netopia, Mobilpay, PayU, EuPlatesc, Stripe, TBI Bank
- Noi facem varianta simplificată: o singură app Next.js, admin în-app, plată Netopia

## 6. Constatări din analiza aquapiscine.ro (identitate)

- WordPress 7.0.9 + WooCommerce + Flatsome + LiteSpeed + Slider Revolution
- Paleta: albastru `#1495e9` primary, `#0261b4` secondary, navy `#0d2b6e`, auriu `#eaba6b`, portocaliu `#ff6b35`, roșu `#dd3333` sale
- Font: Montserrat (headere/hero) + Roboto (CTA) + sans-serif body
- Produsele lor sunt din același segment ca feed-ul totalwater (AstralPool, Fairland, Dolphin) — fit perfect

## 7. Întrebări deschise

- Numele domeniului/brand nou — „AQUAPICINE NOU" e folderul; brand-ul vizual rămâne Aquapiscine? (probabil da — logo-ul lor)
- Hosting: VPS propriu (ca SEVER) sau Vercel + managed DB?
- Au ei voie ca produsele lor să fie revândute? Feed-ul de „instalator" sugerează că da (e făcut pentru reselleri), dar de confirmat cu totalwater.ro
- Prețurile din feed sunt cu sau fără TVA? (de verificat — majoritatea feedurilor B2B sunt fără TVA)
