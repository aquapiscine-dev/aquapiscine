// Migrare categorii: inlocuieste cele 81 categorii plate din feed cu ierarhia
// reala aquapiscine (79 categorii, 14 parinti) + mapeaza produsele.
// Ruleaza: node scripts/migrate-categories.mjs
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const ROOT = process.cwd();
const DB_PATH = path.join(ROOT, "data", "aquapicine.db");
const AQ_API = "/Users/teraki/Desktop/AQUAPISCINE/api";
const CAT_IMG_DIR = path.join(ROOT, "public", "uploads", "categories");
fs.mkdirSync(CAT_IMG_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

db.exec(`
  ALTER TABLE categories ADD COLUMN legacy_slug TEXT;
  ALTER TABLE categories ADD COLUMN legacy_path TEXT;
  ALTER TABLE products ADD COLUMN legacy_path TEXT;
  ALTER TABLE products ADD COLUMN legacy_slug TEXT;
`);

const aqCats = JSON.parse(fs.readFileSync(path.join(AQ_API, "categories.json"), "utf8"));
const aqProducts = JSON.parse(fs.readFileSync(path.join(AQ_API, "all-products.json"), "utf8"));

// --- 1. Import categorii aquapiscine ---
// Mai intai curatam: pastram DOAR randurile care vor fi suprascrise de aq (slug identic)
// Restul categorii vechi raman pana la final (produsele le folosesc inca).

const slugToId = new Map();
const insCat = db.prepare(`
  INSERT INTO categories(name, slug, parent_id, image, legacy_slug, legacy_path, sort_order)
  VALUES (@name, @slug, @parent_id, @image, @legacy_slug, @legacy_path, @sort_order)
  ON CONFLICT(slug) DO UPDATE SET
    name=excluded.name, parent_id=excluded.parent_id, image=excluded.image,
    legacy_slug=excluded.legacy_slug, legacy_path=excluded.legacy_path, sort_order=excluded.sort_order
  RETURNING id
`);

const download = async (url, dest) => {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) return null;
    fs.writeFileSync(dest, buf);
    return `/uploads/categories/${path.basename(dest)}`;
  } catch { return null; }
};

const aqById = new Map(aqCats.map((c) => [c.id, c]));
const parents = aqCats.filter((c) => !c.parent).sort((a, b) => a.name.localeCompare(b.name));
const children = aqCats.filter((c) => c.parent);

for (const c of parents) {
  const localImg = c.image?.src
    ? await download(c.image.src, path.join(CAT_IMG_DIR, `${c.slug}.webp`))
    : null;
  const r = insCat.get({
    name: c.name, slug: c.slug, parent_id: null, image: localImg,
    legacy_slug: c.slug, legacy_path: `/categorie-produs/${c.slug}`, sort_order: 0,
  });
  slugToId.set(c.slug, r.id);
}
for (const c of children) {
  const parentSlug = aqById.get(c.parent)?.slug;
  const localImg = c.image?.src
    ? await download(c.image.src, path.join(CAT_IMG_DIR, `${c.slug}.webp`))
    : null;
  const r = insCat.get({
    name: c.name, slug: c.slug,
    parent_id: parentSlug ? slugToId.get(parentSlug) ?? null : null,
    image: localImg, legacy_slug: c.slug,
    legacy_path: `/categorie-produs/${parentSlug}/${c.slug}`, sort_order: 0,
  });
  slugToId.set(c.slug, r.id);
}
console.log(`Categorii aquapiscine: ${slugToId.size}`);

// --- 2. Mapa feed-slug -> aq-slug ---
const auto = JSON.parse(fs.readFileSync("/tmp/catmap.json", "utf8"));
const MANUAL = {
  "accesorii-liner": "liner-si-accesorii",
  "acoperiri-automate": "acoperire-lamelara",
  "clapeta-de-sens": "piese-schimb-abs",
  "componente-din-inox": "componente-abs",
  "coturi-pvc": "tevi-si-fitinguri",
  "cruci-pvc": "tevi-si-fitinguri",
  "derulatoare-si-accesorii": "prelate-si-derulatoare",
  "dopuri-pvc": "tevi-si-fitinguri",
  "duze": "echipamente-exterioare",
  "gresie-exterior": "dale-si-borduri",
  "holendere-pvc": "tevi-si-fitinguri",
  "kit-constructie-piscina": "piscine-isoblok",
  "liner-3d-premium": "liner-si-accesorii",
  "liner-pvc": "liner-si-accesorii",
  "liner-pvc-antiderapant": "liner-si-accesorii",
  "mufe-pvc": "tevi-si-fitinguri",
  "nipluri-pvc": "tevi-si-fitinguri",
  "piese-schimb-generator-aburi": "generatoare-de-abur",
  "piscine-isoblock": "piscine-isoblok",
  "prelata-iarna": "prelate-si-derulatoare",
  "prelata-vara": "prelate-si-derulatoare",
  "reductii-pvc": "tevi-si-fitinguri",
  "robineti": "tevi-si-fitinguri",
  "schimbatoare-caldura": "schimbatoare-de-caldura",
  "sifone": "echipamente-de-curatare",
  "substante-tratare": "substante-pentru-tratare",
  "teava-presiune-pvc-u": "tevi-si-fitinguri",
  "teuri-pvc": "tevi-si-fitinguri",
  "transformator": "panouri-de-comanda",
  "trusa-analiza": "truse-de-analiza",
};
const catMap = { ...auto, ...MANUAL };
// valideaza: tine doar mapari catre slug-uri aq existente
for (const k of Object.keys(catMap)) {
  if (!slugToId.has(catMap[k])) delete catMap[k];
}

// --- 3. Produse: aq match -> categorie aq; altfel feed cat -> mapare ---
const norm = (s) =>
  String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/&#8211;|&#8217;|&nbsp;/g, " ").replace(/[^a-z0-9]+/g, " ").trim();

const aqBySku = new Map();
const aqByName = new Map();
for (const p of aqProducts) {
  const rec = {
    catSlug: p.categories?.[0]?.slug ?? null,
    perm: p.permalink ? new URL(p.permalink).pathname.replace(/\/$/, "") : null,
    slug: p.slug,
  };
  if (p.sku) aqBySku.set(norm(p.sku), rec);
  aqByName.set(norm(p.name), rec);
}

const products = db.prepare(`
  SELECT p.id, p.sku, p.name, c.slug AS feed_cat_slug
  FROM products p LEFT JOIN categories c ON c.id = p.category_id
`).all();

const upd = db.prepare("UPDATE products SET category_id=?, legacy_path=?, legacy_slug=? WHERE id=?");
let viaAq = 0, viaFeedMap = 0, noCat = 0;
const noCatList = [];

for (const p of products) {
  const aq = aqBySku.get(norm(p.sku)) ?? aqByName.get(norm(p.name));
  if (aq?.catSlug && slugToId.has(aq.catSlug)) {
    upd.run(slugToId.get(aq.catSlug), aq.perm ?? null, aq.slug ?? null, p.id);
    viaAq++;
    continue;
  }
  const targetSlug = p.feed_cat_slug ? catMap[p.feed_cat_slug] : null;
  if (targetSlug && slugToId.has(targetSlug)) {
    upd.run(slugToId.get(targetSlug), null, null, p.id);
    viaFeedMap++;
  } else {
    noCat++;
    if (noCatList.length < 20) noCatList.push(`${p.name} [cat: ${p.feed_cat_slug}]`);
  }
}
console.log(`Produse: ${viaAq} categorie aq, ${viaFeedMap} feed-map, ${noCat} fara categorie`);
if (noCat) noCatList.forEach((s) => console.log("  ??", s));

// --- 4. Sterge categorii vechi nefolosite ---
const usedIds = new Set(
  db.prepare("SELECT DISTINCT category_id FROM products WHERE category_id IS NOT NULL").all().map((r) => r.category_id)
);
const aqIds = new Set(slugToId.values());
const stale = db.prepare("SELECT id FROM categories").all().filter((c) => !aqIds.has(c.id) && !usedIds.has(c.id));
const del = db.prepare("DELETE FROM categories WHERE id=?");
for (const c of stale) del.run(c.id);
console.log(`Categorii vechi sterse: ${stale.length}`);

// --- 5. Rezumat ---
const parentCount = db.prepare("SELECT COUNT(*) c FROM categories WHERE parent_id IS NULL").get().c;
const total = db.prepare("SELECT COUNT(*) c FROM categories").get().c;
const withLegacy = db.prepare("SELECT COUNT(*) c FROM products WHERE legacy_path IS NOT NULL").get().c;
console.log(`Categorii ramase: ${total} (parinti: ${parentCount})`);
console.log(`Produse cu legacy_path (URL aq): ${withLegacy}`);
db.close();
