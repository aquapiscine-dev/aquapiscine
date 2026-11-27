// Migrare SQLite -> Supabase Postgres (o singura data)
// ruleaza: DATABASE_URL="postgresql://..." node scripts/migrate-to-supabase.mjs
import Database from "better-sqlite3";
import postgres from "postgres";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sqlite = new Database(join(root, "data/aquapicine.db"), { readonly: true });
const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 1 });

const BATCH = 500;

async function migrateTable(name, table, columns) {
  const rows = sqlite.prepare(`SELECT ${columns.join(",")} FROM ${table}`).all();
  console.log(`${table}: ${rows.length} randuri`);
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    await sql`INSERT INTO ${sql(table)} ${sql(chunk, ...columns)} ON CONFLICT (id) DO NOTHING`;
    process.stdout.write(`  ${Math.min(i + BATCH, rows.length)}/${rows.length}\r`);
  }
  console.log(`  ${table} gata`);
}

try {
  await migrateTable("brands", "brands", ["id", "name", "slug"]);
  await migrateTable("categories", "categories", ["id", "name", "slug", "parent_id", "image", "sort_order", "legacy_slug", "legacy_path"]);
  await migrateTable("products", "products", [
    "id", "sku", "name", "slug", "price", "sale_price", "stock", "in_stock",
    "brand_id", "category_id", "image_url", "images", "description", "short_description",
    "availability", "is_active", "source", "source_updated", "created_at", "legacy_path", "legacy_slug",
  ]);

  // verificare
  const counts = await sql`
    SELECT
      (SELECT COUNT(*) FROM brands) AS brands,
      (SELECT COUNT(*) FROM categories) AS categories,
      (SELECT COUNT(*) FROM products) AS products`;
  console.log("Postgres:", counts[0]);
} finally {
  await sql.end();
  sqlite.close();
}
