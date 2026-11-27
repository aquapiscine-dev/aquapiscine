# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router, Turbopack) — o singură aplicație: storefront public + admin în `/admin` + API route handlers. DB Postgres (SQLite acceptabil dev). Plată: Netopia. Decis de user 25 Nov 2026.

## Users

- **B2C**: proprietari de case cu piscină/saună/spa — cumpără echipamente, consumabile, accesorii pentru uz propriu
- **B2B**: firme de instalații și construcții piscina — cumpără volum, au nevoie de facturare, prețuri clare, comenzi mari

Ambele audiențe confirmate de user (25 Nov 2026).

## Product Purpose

Magazin online de echipamente și materiale pentru piscine, saune și spa. Succes = comenzi finalizate cu plată online, pentru ambele segmente.

## Positioning

Catalog extins (~1400 produse) importat din feed-ul de reselleri totalwater.ro (produse de la mulți furnizori — AstralPool, Fairland, Dolphin, Hayward, Rento etc.), vândute sub marca Aquapiscine. Avantajul: asortiment complet într-un singur magazin românesc, fără a fi constrâns de un singur furnizor.

## Operating Context

- Piață: România exclusiv, monedă RON, facturare românească
- Plată online: Netopia (card + OP)
- Produsele vin din feed CSV actualizat manual de user (nu există URL public de feed confirmat)
- Imaginile produselor sunt pe totalwater.ro — vor fi descărcate local la import

## Capabilities and Constraints

- Import feed CSV: name, price, sku, imageUrl, productUrl, availability, description (HTML), shortDescription, category (string plat), brand, isActive
- Categorii trebuie mapate din string plat pe ierarhie
- Coș + checkout + cont client + comenzi + admin CRUD produse/comenzi/clienți/cupoane
- Fără integrare curieri/facturare automată în faza 1-3
- Server: self-hosted (VPS) sau Vercel — neconfirmat definitiv

## Brand Commitments

- **Nume + logo**: Aquapiscine — același brand, logo existent folosit acum, variante mari ulterior
- **Identitate vizuală**: preluată de la aquapiscine.ro (vezi DESIGN.md)
- **Paleta**: primary `#1495e9`, secondary `#0261b4`, navy `#0d2b6e`, auriu `#eaba6b`, portocaliu `#ff6b35`, sale `#dd3333`, stele `#eeee22`
- **Fonturi**: Montserrat (headere/hero) + Roboto (CTA) + sans-serif body — decizie finală la DESIGN.md

## Evidence on Hand

- Feed real: `PRODUSE TOTAL WATER/feed instalator - feed instalator.csv (1).csv` (~1400 produse)
- Logo: `~/Desktop/AQUAPISCINE/logo.webp`
- SPEC.md cu analiza completă totalwater.ro + aquapiscine.ro în root-ul proiectului
- Nu există încă: conținut text original (despre noi, termeni), fotografii proprii, recenzii reale — NU se fabrică

## Product Principles

1. Catalogul e produsul — rapid, complet, ușor de navigat pentru ambele audiențe
2. Încredere prin claritate: prețuri clare, stoc vizibil, specificații complete, contact ușor
3. B2B fără fricțiuni: cont firmă, prețuri mari vizibile, comandă simplă
4. Identitatea Aquapiscine se păstrează, dar execuția vizuală e 2027 — nu un WooCommerce reskinuit
