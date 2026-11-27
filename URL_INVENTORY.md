# Inventar URL-uri aquapiscine.ro — obligatoriu de replicat identic

Extras 25 Nov 2026 din: `sitemap_index.xml` (Rank Math) + `wp-json/wc/store/v1` (API WooCommerce public).
Date salvate: `~/Desktop/AQUAPISCINE/api/` — `all-products.json` (1200 produse), `all-pages.json` (6399 pagini), `categories.json` (79), `brands.json` (12), `matches.json` (916 perechi feed↔aquapiscine).

## Structura URL obligatorie

### Produse — 1184 URL indexate
```
/magazin/{categorie-parinte}/{categorie}/{slug-produs}/
```
- Trailing slash obligatoriu
- `slug-produs` = slug-ul WooCommerce (din `permalink` din Store API — NU slug-ul din feed totalwater)
- Exemplu: `/magazin/filtrare-piscina/pompe-piscina/pompa-de-filtrare-saci-supra-300-pentru-52-mc-h-230v-400v/`
- Unele produse sunt direct sub categorie-părinte: `/magazin/aquapiscine/pompa-de-caldura-nano-.../` (1 nivel)
- Categorii folosite de produse: 68 din 79
- Paginare listing: `/magazin/page/2/` (și probabil `/categorie-produs/.../page/N/`)

### Categorii — 79 URL
```
/categorie-produs/{categorie-parinte}/{categorie}/
```
- Ierarhie părinte→copil (parent_id din API)
- 16 categorii top-level: accesorii-piscine, acoperire-piscina, aquapiscine, componente-abs-si-pvc, curatare-piscina, filtrare-piscina, incalzire-piscina, lichidari-de-stoc, oferte, placare-piscina, pompa-de-caldura-inverboost-rezidentiala-aer-apa, sauna-si-spa, tipuri-de-piscine, tratare-piscina (+posibile altele)

### Branduri — 12 URL
```
/brand/{slug}/
```
Albixon, AQUATICS, AstralPool, CCEI France, Helo Sauna, Isomat, Kloer, Peraqua, Pool Zone, Star Pool Gre, STARSTONE, Vitra
- Există și variantă veche `/atribut-produs/brand/{slug}/` (redirijare probabil spre /brand/)

### Coș / Cont / Checkout
```
/cart-2/                  — coș ȘI checkout (Flatsome: checkout e în pagină, /checkout/ 301 → /cart-2/)
/contul-meu/              — cont client
/contul-meu/parola-pierduta/
/checkout/                — 301 → /cart-2/
```

### Pagini statice (din sitemap)
- `/` homepage, `/despre-noi/`, `/contact/`, `/livrare-si-returnare/`, `/termeni-si-conditii/`, `/politica-confidentialitate/`, `/politica-privind-cookie-urile-ue/`, `/formular-retur/`, `/producatori/`, `/portofoliu/`, `/configurator-piscine/`, `/oferte/`, `/revista-aquapiscine/` (blog, 24 articole), `/feed/` (RSS)

### Pagini programatice (SEO local) — ~6300 URL
- `/tratare-apa-{localitate}-{n}/`, `/jacuzzi-spa-{localitate}-{n}/`, `/piscina-fibra-sticla-{localitate}-{n}/`, `/constructii-piscine-{sector}/`
- ~16 servicii × ~300 localități × număr pagină = mii de pagini doorway generate în WP
- Decizie necesară: replici static la lansare sau generator; NU sunt în sitemap separat — sunt în page-sitemap

### Alte
- `/magazin/` — baza magazinului
- `?add-to-cart=` — interzis în robots (parametru acțiune)
- `/wp-json/` — API public (de închis pe noul site)

## Match feed totalwater ↔ catalog aquapiscine

- 1200 produse extrase din Store API; 916 matched cu feed-ul totalwater (820 SKU exact, 27 nume, 69 fuzzy ≥0.6) — `api/matches.json`
- **284 produse există DOAR pe aquapiscine** (Wellis, Zodiac, borduri travertin etc.)
- **~485 produse există DOAR în feed totalwater** (nu sunt pe aquapiscine)

## Concluzie arhitectură

Catalogul final = **uniunea**:
1. Toate cele 1200 produse aquapiscine (date complete din Store API: nume, descriere, imagini, prețuri, categorii, URL exact) → URL identic `/magazin/...`
2. + produsele feed-only totalwater (~485) → URL generat în același pattern `/magazin/{categorie-mapata}/{sub}/{slug}/`
3. Categorii: se folosește ierarhia reală aquapiscine (79 categorii, parent_id) — feed-ul totalwater (81 categorii string plat) se mapează pe ea
4. Imagini: se descărcă local de pe ambele surse

Field nou în DB: `legacy_path` (calea completă `/magazin/...`) + `source` (`aquapiscine-api` vs `totalwater-feed`). Ruta Next.js: `/magazin/[...slug]` rezolvă produsul după `legacy_path`.

## Ce trebuie replicat în rute

```
/magazin/[...slug]          → produs (sau /magazin/ listing + /magazin/page/N/)
/categorie-produs/[...slug] → listing categorie
/brand/[slug]               → listing brand
/cart-2                     → coș+checkout
/contul-meu/*               → cont client
/*                          → pagini statice + doorway pages (CMS/generator)
```

Toate cu trailing slash — middleware/redirect pentru variante fără slash.
