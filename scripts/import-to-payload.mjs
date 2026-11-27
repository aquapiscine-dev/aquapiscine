// Import Supabase (products/brands/categories) -> Payload REST API
// Ruleaza: node scripts/import-to-payload.mjs
import fs from "fs";
import postgres from "postgres";

const env = fs.readFileSync(".env.local", "utf8");
const DB_URL = env.match(/DATABASE_URL=["']?([^"'\n]+)/)[1].trim();
const BASE = process.env.PAYLOAD_URL || "http://localhost:3000/api";
const EMAIL = "admin@aquapiscine.ro";
const PASS = "Admin2026!";

const sql = postgres(DB_URL, { ssl: "require", max: 2 });

async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `JWT ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 300)}`);
  return json;
}

// --- HTML -> Lexical JSON (brief: paragrafe text, pastreaza continutul) ---
function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/&apos;/g, "'");
}
function htmlToLexical(html) {
  if (!html) return null;
  // sparge pe taguri de bloc, strip restul
  const blocks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .split(/<\/?(?:p|div|h[1-6]|li|ul|ol|tr|table|section|article)[^>]*>/gi)
    .map((b) => decodeEntities(b.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()))
    .filter(Boolean);
  const unique = [...new Set(blocks)];
  if (!unique.length) return null;
  const para = (text) => ({
    type: "paragraph",
    children: [{ type: "text", text, format: 0, detail: 0, mode: "normal", style: "", version: 1 }],
    direction: "ltr", format: "", indent: 0, version: 1,
  });
  return { root: { type: "root", children: unique.map(para), direction: "ltr", format: "", indent: 0, version: 1 } };
}

async function pool(items, size, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (i < items.length) { const j = i++; out[j] = await fn(items[j], j); }
  }));
  return out;
}

async function cleanCollection(name, token) {
  // sterge toate doc-urile din colectie (idempotent)
  let page = 1, deleted = 0;
  for (;;) {
    const res = await api(`/${name}/?limit=100&page=${page}&depth=0`, { token });
    if (!res.docs?.length) break;
    for (const d of res.docs) {
      await api(`/${name}/${d.id}`, { method: "DELETE", token });
      deleted++;
    }
    if (!res.hasNextPage) break;
    page++;
  }
  return deleted;
}

async function main() {
  // 1. Login
  const login = await api("/users/login/", { method: "POST", body: { email: EMAIL, password: PASS } });
  const token = login.token;
  console.log("Login OK");

  // curata datele de test din spike
  for (const col of ["produse", "categorii", "branduri"]) {
    const n = await cleanCollection(col, token);
    if (n) console.log(`Curatat ${col}: ${n} docst`);
  }

  // 2. Categorii (parinti intai, dupa legaturi parinte)
  const cats = await sql`SELECT * FROM categories ORDER BY parent_id NULLS FIRST, id`;
  const catMap = {};
  for (const c of cats) {
    const doc = await api("/categorii/", {
      method: "POST", token,
      body: {
        name: c.name, slug: c.slug,
        imageUrl: c.image || undefined,
        sortOrder: c.sort_order ?? 0,
        legacyPath: c.legacy_path || undefined,
      },
    });
    catMap[c.id] = doc.doc.id;
  }
  console.log(`Categorii: ${cats.length} create`);
  // parinti
  for (const c of cats) {
    if (c.parent_id && catMap[c.parent_id]) {
      await api(`/categorii/${catMap[c.id]}`, { method: "PATCH", token, body: { parent: catMap[c.parent_id] } });
    }
  }
  console.log("Parinti legati");

  // 3. Branduri
  const brands = await sql`SELECT * FROM brands`;
  const brandMap = {};
  for (const b of brands) {
    const doc = await api("/branduri/", {
      method: "POST", token,
      body: { name: b.name, slug: b.slug, legacyPath: `/brand/${b.slug}` },
    });
    brandMap[b.id] = doc.doc.id;
  }
  console.log(`Branduri: ${brands.length} create`);

  // 4. Produse
  const products = await sql`SELECT * FROM products WHERE is_active = 1`;
  console.log(`Produse de importat: ${products.length}`);
  let ok = 0, fail = 0;
  await pool(products, 8, async (p) => {
    try {
      let images = [];
      try { images = JSON.parse(p.images || "[]"); } catch {}
      const body = {
        name: p.name,
        slug: p.slug,
        sku: p.sku || undefined,
        legacyPath: p.legacy_path || undefined,
        price: Number(p.price ?? p.sale_price ?? 0),
        salePrice: p.sale_price != null ? Number(p.sale_price) : undefined,
        stock: p.stock ?? 0,
        inStock: p.in_stock === 1,
        availability: p.availability || undefined,
        brand: p.brand_id && brandMap[p.brand_id] ? brandMap[p.brand_id] : undefined,
        category: p.category_id && catMap[p.category_id] ? catMap[p.category_id] : undefined,
        gallery: images.filter(Boolean).map((url) => ({ url, alt: p.name })),
        shortDescription: p.short_description || undefined,
        description: htmlToLexical(p.description),
      };
      await api("/produse/", { method: "POST", token, body });
      ok++;
      if (ok % 100 === 0) console.log(`  ${ok}/${products.length}`);
    } catch (e) {
      fail++;
      if (fail <= 5) console.log(`  EROARE ${p.slug}: ${e.message.slice(0, 200)}`);
    }
  });
  console.log(`GATA: ${ok} ok, ${fail} esuate`);
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
