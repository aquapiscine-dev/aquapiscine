# DESIGN.md — Aquapiscine (2027)

Lume vizuală: **interiorul piscinei ca interfață** — mozaic, rost (grout), adâncime, lumină subacvatică. Brandul Aquapiscine existent, execuție ridicată la standard 2027. Nu e un reskin WooCommerce.

Mode: **Persuade** (vitrină) + **Operate** (catalog, coș, checkout, admin).
Dialele: VARIANCE 7 / MOTION 5 / DENSITY 4.

---

## 1. Lumea: „Placuta de mozaic"

Produsele sunt prezentate ca **specimene numerotate** într-un catalog de finisaje, nu ca rânduri într-un tabel de produse. Fiecare produs primeunr. de placă, o legendă în margine (brand, SKU, stare stoc, proveniență feed), o imagine ca „fața plăcuței". Gridul de produse = foaie de mozaic: rosturi subtile între tile-uri, nu carduri cu umbră.

### Semnătura: WATERLINE

O linie orizontală continuă (rostul de mozaic, 1px, `#e8e8e8` → devine `#1495e9` la hover/scroll) traversează pagina. Deasupra ei: zona „uscată" — alb, aer, browsare. Sub ea: catalogul coboară — fundalul trece printr-un gradient de adâncime `#ffffff → #eef6fd → #d8ecfa → #b9d9f2` cu nuanțe spre navy `#0d2b6e` pe măsură ce scroll-ul intră în listing. Senzația: intri în apă.

### Adâncimea ca material

Fundalurile de secțiuni nu sunt albe plate — sunt **straturi de apă**: gradiente subtile alb→albastru-foarte-deschis, cu o a doua foaie translucidă (ca lumina care trece prin apă) folosită cu parcimonie pe hero și secțiuni premium. O singură undă de caustici (SVG animat, nu imagine) sub titlul hero — singurul moment „magic", restul e disciplinat.

---

## 2. Paleta (brand-pinned + extins pentru adâncime)

| Token | Hex | Rol |
|---|---|---|
| `water-50` | `#f2f9fe` | Cea mai deschisă adâncime (sub waterline, top) |
| `water-100` | `#e3f1fc` | Strat 2 adâncime |
| `water-200` | `#c8e3f8` | Strat 3 |
| `water-300` | `#a5d2f2` | Strat 4 (hover states profunde) |
| `primary` | `#1495e9` | Acțiuni, waterline activ, iconițe |
| `primary-deep` | `#0261b4` | Text pe apă, linkuri |
| `navy` | `#0d2b6e` | Adâncimea maximă: footer, zone dark, „camera utilajului" |
| `ink` | `#101820` | Text principal (înlocuiește negrul pur — mai puțin dur) |
| `slate` | `#4a5568` | Text secundar |
| `grout` | `#eceff1` | Rosturile: borders, separatoare — rece, nu bej |
| `surface` | `#ffffff` | Plăcuțe produs, carduri |
| `sale` | `#dd3333` | DOAR preț reducere / badge -X% |
| `star` | `#eeee22` | Stele review |
| `gold` | `#eaba6b` | Păstrat pentru detalii decorative rare (badge „instalator", promo) |

Reguli: un singur accent acțiune = `primary`. `sale` nu apare niciodată pe butoane. `navy` e singurul dark — folosit pentru footer, secțiunea „servicii/instalare" și eventual bandă mid-page (singura inversiune de temă, o singură dată, cu tranziție deliberate).

## 3. Tipografie

- **Display/Headere: Montserrat** (700/800, tracking -0.02em) — pinned de brand. Headerele mari sunt statement-uri: „Echipamente pentru piscina ta." cu cuvântul-cheie evidențiat prin *italic aceeași familie* sau greutate, nu font străin.
- **Etichete/Date/CTA: Roboto** (500) — pinned. Folosit pentru: prețuri, SKU, badge-uri, butoane pill, metadate plăcuțe.
- **Body: system sans** (`-apple-system, "Segoe UI", Roboto...`) — ca originalul, lizibil și zero cost de font. Doar dacă se simte slab în test, fallback Montserrat 400.
- **Numerotarea plăcuțelor**: Roboto Mono sau tabular-nums Roboto — „Nr. 0142" în margine, datele tehnice aliniate.

Scala: hero `clamp(2.75rem, 6vw, 5.5rem)`, h2 `clamp(2rem,4vw,3.25rem)`, h3 `1.5rem`, body `1rem/1.65`, small `0.8125rem` uppercase tracking `0.08em` pentru legendă plăcuțe.

## 4. Layout & structură

- **Grid asimetric controlat**: secțiunile folosesc coloane 12 cu offset-uri intenționate; plăcuțele produselor stau pe un grid cu **gutters care par rosturi** (gap 1px-2px `grout` între tile-uri, nu 24px de aer).
- **Plăcuța produs (signature component)**: imagine full-bleed, colțuri 0 sau 2px (mozaicul nu are colțuri rotunjite), legendă în marginea inferioară sau stânga: `Nr. 0142 · AstralPool · kit4.d750`, preț Roboto, stoc ca text („În stoc" verde-slim sau „La comandă" gri — fără iconițe-haos), buton pill `primary` mic. Fără umbră, fără border-radius mare — separarea e făcută de rost, nu de umbră.
- **Filtrele**: stânga, ca un „cuprins de capitol" — categorii cu indent pe ierarhie, preț ca dublu slider, brand ca tag-uri mici. Pe mobil: drawer.
- **Header**: alb, sticky, logo stânga, meniu centrat sau stânga, căutare vizibilă (magazinul e catalog — search e funcție primară), coș+cont dreapta. Sub header, waterline vizibilă la scroll.
- **Footer**: `navy` — singura zonă dark. Coloanede linkuri, date firmă, program, plată (iconițe Netopia etc.).

## 5. Interacțiuni & motion (MOTION 5 — motivat, nu decorativ)

- **Caustici hero**: un singur SVG cu path animat (ușoară deformare ca lumina pe nisip) — comunică „apă", o singură dată, `prefers-reduced-motion` → static.
- **Waterline**: linia de 1px urmărșăte scroll — sub ea fundalul intră în gradient de adâncime (transform Y + opacity, GPU-only).
- **Plăcuțe**: hover = imaginea face un zoom 1.04 lent + legenda „alunecă" 4px — ca o plăcuță ridicată din mozaic. Fără bounce.
- **Adăugare în coș**: butonul face o „scufundare" — pill se închide 2px și revine, mini-feedback în colțul coșului (badge count).
- **Filtre**: plăcuțele reale arată un skeleton de „rost" (pulse subtil) la refresh, nu spinner.
- **Checkout**: pașii sunt etichetați ca în întunericul develop-ul: `01 Date · 02 Livrare · 03 Plată · 04 Confirmare` — fiecare pas confirmat marchează „punctul ireversibil" (donat de darkroom): butonul „Continuă" devine „Punct de fără întoarcere" doar la pasul final de plată.
- **Interzis**: loop-uri infinite, parallax greu, cursor custom, scroll-jacking, marquee.

## 6. Conținut & copy (română)

- Voce: directă, de meșteșug — „Echipamente pentru piscina ta", „Kit filtrare 22 m³/h — pentru ape de 85–160 m³". Fără superlative goale.
- Plăcuțele au legendă scurtă: `Nr.`, brand, SKU, stare — datele sunt acolo pentru instalatori (B2B le citesc).
- Stoc: text explicit mereu („În stoc", „Stoc limitat", „La comandă 3–5 zile") — niciodată doar iconiță.
- Badge-uri: `-30%` (sale), `BESTSELLER` (gold), `INSTALATOR` (pentru variante B2B viitoare).

## 7. Suprafețe

| Suprafață | Mode | Notițe |
|---|---|---|
| Homepage | Persuade | Hero cu titlu mare + caustici + waterline; secțiuni: categorii-popular, „alegeri instalatori", produse noi, servicii (bandă navy), trust strip (livrare, retur, suport) |
| /produse | Operate | Grid-mozaic + filtre stânga; densitate crescută dar ordine de rost |
| /produse/[slug] | Operate | Imagine mare stânga, legendă+preț+CTA dreapta; specificații ca carduri-grupate (nu tabel lung — regula 4.9); descriere HTML sanitizată |
| /cos, /checkout | Operate | Pași numerotați, waterline vizibilă, sumar permanent |
| /cont | Operate | Tabele curate, comenzi ca plăcuțe orizontale |
| /admin | Operate | Utilitar, dens, aceeași paletă, fără decor — datele pornesc din feed |

## 8. Ce NU facem (anti-slop explicit)

- Niciun card alb cu umbră pe fundal gri — separarea e prin rost `grout`, nu box-shadow
- Niciun gradient albastru-violet AI, niciun glassmorphism
- Niciun eyebrow deasupra fiecărei secțiuni (max 1 la 3 secțiuni)
- Niciun serif, niciun font dincolo de Montserrat/Roboto/system
- Niciun dark mode complet — `navy` e accent de secțiune, nu temă
- Fără imagini stock — produsele vin din feed (imagini reale furnizori); hero poate folosi o imagine generată de piscină reală, dar mai întâi verificăm dacă există asset-uri proprii

## 9. Risk onest

- Mozaicul poate părea „prea discret" pentru un magazin de utilaje — contrabalansat de: titlurile mari Montserrat, prețurile mari Roboto, și secțiunea navy de servicii care sparge ritmul
- Adâncimea (gradient albastru) poate părea „inconsistently applied" dacă nu e strict legată de scroll — regula: gradientul există DOAR sub waterline, deasupra e alb curat
- Feed-ul are descrieri HTML inconsistente — vom avea nevoie de o regulă de fallback vizuală pentru produsele fără specificații (carduri goale interzise)

## 10. Donațiile challenger-elor (ridicături aplicate)

- **Couture atelier** (competitive): plăcuțe numerotate + legendă în margine — specimene, nu rânduri
- **Darkroom** (declined): pașii checkout ca etape ireversibile marcate
- **Treasure map** (declined): proveniență pe plăcuțe — `Sursa: feed TotalWater · actualizat <data>` în legendă (mic, discret)
- **Silk canopy** (declined): suprapunere straturi alb→albastru = adâncimea
- **Neon** (declined): o linie continuă — waterline/rostul
- **Zine** (declined): specificații explicate prin carduri grupe + diagrame simple, nu tabele
