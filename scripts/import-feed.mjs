// Import feed CSV totalwater.ro -> SQLite + imagini locale
// Usage: node scripts/import-feed.mjs "PRODUSE TOTAL WATER/feed instalator - feed instalator.csv (1).csv"
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const ROOT = process.cwd();
const CSV_PATH = process.argv[2];
const DB_PATH = path.join(ROOT, "data", "aquapicine.db");
const IMG_DIR = path.join(ROOT, "public", "uploads", "products");

if (!CSV_PATH || !fs.existsSync(CSV_PATH)) {
  console.error("Usage: node scripts/import-feed.mjs <csv-path>");
  process.exit(1);
}

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
fs.mkdirSync(IMG_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS brands (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE);
  CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, image TEXT, sort_order INTEGER DEFAULT 0);
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL UNIQUE, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
    price REAL NOT NULL, sale_price REAL, stock INTEGER DEFAULT 0, in_stock INTEGER DEFAULT 1,
    brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT, images TEXT DEFAULT '[]', description TEXT, short_description TEXT,
    availability TEXT, is_active INTEGER DEFAULT 1, source TEXT, source_updated TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
  CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
  CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
`);

const slugify = (s) =>
  String(s || "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "produs";

const csv = fs.readFileSync(CSV_PATH, "utf8");
const rows = parse(csv, { columns: true, bom: true, relax_quotes: true, relax_column_count: true });
console.log(`Randuri CSV: ${rows.length}`);

const upsertBrand = db.prepare(`INSERT INTO brands(name,slug) VALUES(?,?) ON CONFLICT(slug) DO UPDATE SET name=excluded.name RETURNING id`);
const upsertCat = db.prepare(`INSERT INTO categories(name,slug) VALUES(?,?) ON CONFLICT(slug) DO UPDATE SET name=excluded.name RETURNING id`);
const upsertProduct = db.prepare(`
  INSERT INTO products(sku,name,slug,price,sale_price,stock,in_stock,brand_id,category_id,image_url,images,description,short_description,availability,is_active,source,source_updated)
  VALUES(@sku,@name,@slug,@price,@sale_price,@stock,@in_stock,@brand_id,@category_id,@image_url,@images,@description,@short_description,@availability,@is_active,@source,@source_updated)
  ON CONFLICT(sku) DO UPDATE SET
    name=excluded.name, slug=excluded.slug, price=excluded.price, sale_price=excluded.sale_price,
    stock=excluded.stock, in_stock=excluded.in_stock, brand_id=excluded.brand_id, category_id=excluded.category_id,
    image_url=excluded.image_url, images=excluded.images, description=excluded.description,
    short_description=excluded.short_description, availability=excluded.availability,
    is_active=excluded.is_active, source_updated=excluded.source_updated
`);

const brandCache = new Map();
const catCache = new Map();
const usedSlugs = new Set(
  db.prepare("SELECT slug FROM products").all().map((r) => r.slug)
);

const getBrandId = (name) => {
  if (!name) return null;
  const n = name.trim();
  if (!n) return null;
  const slug = slugify(n);
  if (brandCache.has(slug)) return brandCache.get(slug);
  const id = upsertBrand.get(n, slug).id;
  brandCache.set(slug, id);
  return id;
};

const getCatId = (name) => {
  if (!name) return null;
  const n = name.trim();
  if (!n) return null;
  const slug = slugify(n);
  if (catCache.has(slug)) return catCache.get(slug);
  const id = upsertCat.get(n, slug).id;
  catCache.set(slug, id);
  return id;
};

const imageDirFor = (sku) => path.join(IMG_DIR, slugify(sku));
const downloadImage = async (url, dest) => {
  if (fs.existsSync(dest)) return true;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) return false;
    fs.writeFileSync(dest, buf);
    return true;
  } catch {
    return false;
  }
};

let ok = 0, imgOk = 0, imgFail = 0, skipped = 0;
const CONCURRENCY = 10;
const queue = [...rows];

async function worker() {
  while (queue.length) {
    const row = queue.shift();
    if (!row || !row.sku || !row.name) { skipped++; continue; }
    const isActive = String(row.isActive).toUpperCase() === "TRUE";
    const price = parseFloat(row.price);
    if (!Number.isFinite(price)) { skipped++; continue; }

    const skuSlug = slugify(row.sku);
    let slug = slugify(row.name);
    if (usedSlugs.has(slug)) slug = `${slug}-${skuSlug}`;
    usedSlugs.add(slug);

    // imagine locala
    let localImage = null;
    if (row.imageUrl) {
      const dir = imageDirFor(row.sku);
      fs.mkdirSync(dir, { recursive: true });
      const ext = path.extname(new URL(row.imageUrl).pathname) || ".webp";
      const dest = path.join(dir, `0${ext}`);
      const rel = `/uploads/products/${skuSlug}/0${ext}`;
      if (await downloadImage(row.imageUrl, dest)) { localImage = rel; imgOk++; }
      else imgFail++;
    }

    upsertProduct.run({
      sku: row.sku.trim(),
      name: row.name.trim(),
      slug,
      price,
      sale_price: null,
      stock: 0,
      in_stock: String(row.availability).toLowerCase().includes("stock") ? 1 : 0,
      brand_id: getBrandId(row.brand),
      category_id: getCatId(row.category),
      image_url: localImage || row.imageUrl || null,
      images: JSON.stringify(localImage ? [localImage] : row.imageUrl ? [row.imageUrl] : []),
      description: row.description || null,
      short_description: row.shortDescription || null,
      availability: row.availability || null,
      is_active: isActive ? 1 : 0,
      source: "totalwater-feed",
      source_updated: new Date().toISOString(),
    });
    ok++;
    if (ok % 100 === 0) console.log(`${ok} produse...`);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`GATA: ${ok} produse, ${imgOk} imagini locale, ${imgFail} esuate, ${skipped} skip`);
console.log(`Branduri: ${db.prepare("SELECT COUNT(*) c FROM brands").get().c}, Categorii: ${db.prepare("SELECT COUNT(*) c FROM categories").get().c}`);
db.close();
