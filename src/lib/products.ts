import { getDb } from "./db";

export type Product = {
  id: number;
  sku: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  stock: number;
  in_stock: number;
  brand_id: number | null;
  category_id: number | null;
  image_url: string | null;
  images: string;
  description: string | null;
  short_description: string | null;
  availability: string | null;
  is_active: number;
  source_updated: string | null;
  brand_name: string | null;
  brand_slug: string | null;
  category_name: string | null;
  category_slug: string | null;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  image: string | null;
  product_count: number;
};

export type Brand = { id: number; name: string; slug: string; product_count: number };

const PRODUCT_SELECT = `
  SELECT p.*, b.name AS brand_name, b.slug AS brand_slug,
         c.name AS category_name, c.slug AS category_slug
  FROM products p
  LEFT JOIN brands b ON b.id = p.brand_id
  LEFT JOIN categories c ON c.id = p.category_id
`;

export type ProductFilters = {
  q?: string;
  category?: string;
  categoryIds?: number[];
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: "relevant" | "price-asc" | "price-desc" | "name" | "noutati";
  page?: number;
  perPage?: number;
};

export function queryProducts(f: ProductFilters = {}) {
  const db = getDb();
  const { whereSql, params, order, page, perPage } = buildWhere(f);

  const countStmt = db.prepare(
    `SELECT COUNT(*) AS c FROM products p
     LEFT JOIN brands b ON b.id = p.brand_id
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${whereSql}`
  );
  const total = (countStmt.get(params) as { c: number }).c;

  const stmt = db.prepare(
    `${PRODUCT_SELECT} WHERE ${whereSql} ORDER BY ${order} LIMIT @limit OFFSET @offset`
  );
  const products = stmt.all({ ...params, limit: perPage, offset: (page - 1) * perPage }) as Product[];

  return { products, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

function buildWhere(f: ProductFilters) {
  const where: string[] = ["p.is_active = 1"];
  const params: Record<string, unknown> = {};

  if (f.q) {
    where.push("(p.name LIKE @q OR p.sku LIKE @q OR p.description LIKE @q)");
    params.q = `%${f.q}%`;
  }
  if (f.category) {
    where.push("c.slug = @category");
    params.category = f.category;
  }
  if (f.categoryIds && f.categoryIds.length > 0) {
    where.push(`c.id IN (${f.categoryIds.join(",")})`);
  }
  if (f.brand) {
    where.push("b.slug = @brand");
    params.brand = f.brand;
  }
  if (f.minPrice != null) {
    where.push("p.price >= @minPrice");
    params.minPrice = f.minPrice;
  }
  if (f.maxPrice != null) {
    where.push("p.price <= @maxPrice");
    params.maxPrice = f.maxPrice;
  }
  if (f.inStock) where.push("p.in_stock = 1");

  const order =
    f.sort === "price-asc" ? "p.price ASC"
    : f.sort === "price-desc" ? "p.price DESC"
    : f.sort === "name" ? "p.name COLLATE NOCASE ASC"
    : f.sort === "noutati" ? "p.id DESC"
    : "p.id DESC";

  const page = Math.max(1, f.page ?? 1);
  const perPage = Math.min(60, Math.max(12, f.perPage ?? 24));

  return { whereSql: where.join(" AND "), params, order, page, perPage };
}

export function getProductBySlug(slug: string): Product | undefined {
  const db = getDb();
  return db
    .prepare(`${PRODUCT_SELECT} WHERE p.slug = ? AND p.is_active = 1`)
    .get(slug) as Product | undefined;
}

export function listCategories(): Category[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT c.id, c.name, c.slug, c.parent_id, c.image,
              COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
       GROUP BY c.id
       HAVING product_count > 0
       ORDER BY product_count DESC, c.name COLLATE NOCASE`
    )
    .all() as Category[];
}

export function listBrands(): Brand[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT b.id, b.name, b.slug, COUNT(p.id) AS product_count
       FROM brands b
       JOIN products p ON p.brand_id = b.id AND p.is_active = 1
       GROUP BY b.id
       ORDER BY product_count DESC, b.name COLLATE NOCASE
       LIMIT 40`
    )
    .all() as Brand[];
}

export function getCategoryBySlug(slug: string) {
  const db = getDb();
  return db.prepare("SELECT * FROM categories WHERE slug = ?").get(slug) as
    | { id: number; name: string; slug: string; parent_id: number | null; image: string | null }
    | undefined;
}

export type CategoryNode = Category & { children: Category[] };

// Ierarhia reala aquapiscine: parinti cu copii + count produse in subtree
export function getCategoryTree(): CategoryNode[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT c.id, c.name, c.slug, c.parent_id, c.image, c.legacy_path,
              COUNT(DISTINCT p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
       GROUP BY c.id`
    )
    .all() as (Category & { legacy_path: string | null })[];

  // count per parinte = suma copiilor + directi
  const byParent = new Map<number | null, typeof rows>();
  for (const r of rows) {
    const arr = byParent.get(r.parent_id) ?? [];
    arr.push(r);
    byParent.set(r.parent_id, arr);
  }
  const countWithKids = (id: number): number => {
    const self = rows.find((r) => r.id === id);
    const kids = byParent.get(id) ?? [];
    return (self?.product_count ?? 0) + kids.reduce((s, k) => s + countWithKids(k.id), 0);
  };
  const descendantIds = (id: number): number[] => {
    const out: number[] = [];
    const stack = (byParent.get(id) ?? []).map((k) => k.id);
    while (stack.length) {
      const k = stack.pop()!;
      out.push(k);
      stack.push(...(byParent.get(k) ?? []).map((x) => x.id));
    }
    return out;
  };
  const imgStmt = db.prepare(
    `SELECT image_url FROM products
     WHERE category_id IN (SELECT value FROM json_each(?)) AND image_url IS NOT NULL AND is_active = 1
     LIMIT 1`
  );
  const resolveImage = (node: { id: number; image: string | null }) => {
    if (node.image) return node.image;
    const ids = JSON.stringify([node.id, ...descendantIds(node.id)]);
    return (imgStmt.get(ids) as { image_url: string } | undefined)?.image_url ?? null;
  };

  const parents = (byParent.get(null) ?? [])
    .map((p) => ({
      ...p,
      image: resolveImage(p),
      product_count: countWithKids(p.id),
      children: (byParent.get(p.id) ?? []).map((k) => ({
        ...k,
        image: resolveImage(k),
        product_count: countWithKids(k.id),
        children: [],
      })),
    }))
    .filter((p) => p.product_count > 0)
    .sort((a, b) => b.product_count - a.product_count);

  return parents;
}

// ID-urile categoriei + ale tuturor urmasilor (subtree)
export function getCategorySubtreeIds(slug: string): { cat: NonNullable<ReturnType<typeof getCategoryWithChildren>>; ids: number[] } | null {
  const cat = getCategoryWithChildren(slug);
  if (!cat) return null;
  const db = getDb();
  const all = db.prepare("SELECT id, parent_id FROM categories").all() as { id: number; parent_id: number | null }[];
  const childrenOf = new Map<number | null, number[]>();
  for (const r of all) {
    const arr = childrenOf.get(r.parent_id) ?? [];
    arr.push(r.id);
    childrenOf.set(r.parent_id, arr);
  }
  const ids = [cat.id];
  const queue = [cat.id];
  while (queue.length) {
    const id = queue.pop()!;
    for (const kid of childrenOf.get(id) ?? []) {
      ids.push(kid);
      queue.push(kid);
    }
  }
  return { cat, ids };
}

// Categorii copil dupa slug parinte (pentru pagini de categorie)
export function getCategoryWithChildren(slug: string) {
  const db = getDb();
  const cat = db.prepare("SELECT * FROM categories WHERE slug = ?").get(slug) as
    | { id: number; name: string; slug: string; parent_id: number | null; image: string | null; legacy_path: string | null }
    | undefined;
  if (!cat) return null;
  const children = db
    .prepare("SELECT * FROM categories WHERE parent_id = ? ORDER BY name COLLATE NOCASE")
    .all(cat.id) as { id: number; name: string; slug: string }[];
  const parent = cat.parent_id
    ? (db.prepare("SELECT * FROM categories WHERE id = ?").get(cat.parent_id) as { id: number; name: string; slug: string } | undefined)
    : null;
  return { ...cat, children, parent };
}
