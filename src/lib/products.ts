import { getSql } from "./db";

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

export async function queryProducts(f: ProductFilters = {}) {
  const sql = getSql();
  const { whereSql, params, order, page, perPage } = buildWhere(f);

  const countRows = (await sql.unsafe(
    `SELECT COUNT(*)::int AS c FROM products p
     LEFT JOIN brands b ON b.id = p.brand_id
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${whereSql}`,
    params as never[]
  )) as { c: number }[];
  const total = countRows[0].c;

  const products = (await sql.unsafe(
    `${PRODUCT_SELECT} WHERE ${whereSql} ORDER BY ${order} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, perPage, (page - 1) * perPage] as never[]
  )) as unknown as Product[];

  return { products, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

function buildWhere(f: ProductFilters) {
  const where: string[] = ["p.is_active = 1"];
  const params: unknown[] = [];
  const push = (cond: string, val: unknown) => {
    params.push(val);
    where.push(cond.replace("?", `$${params.length}`));
  };

  if (f.q) {
    params.push(`%${f.q}%`);
    const n = params.length;
    where.push(`(p.name ILIKE $${n} OR p.sku ILIKE $${n} OR p.description ILIKE $${n})`);
  }
  if (f.category) {
    push("c.slug = ?", f.category);
  }
  if (f.categoryIds && f.categoryIds.length > 0) {
    const ids = f.categoryIds.map((n) => parseInt(String(n), 10)).filter((n) => Number.isFinite(n));
    if (ids.length > 0) where.push(`c.id IN (${ids.join(",")})`);
  }
  if (f.brand) {
    push("b.slug = ?", f.brand);
  }
  if (f.minPrice != null) {
    push("p.price >= ?", f.minPrice);
  }
  if (f.maxPrice != null) {
    push("p.price <= ?", f.maxPrice);
  }
  if (f.inStock) where.push("p.in_stock = 1");

  const order =
    f.sort === "price-asc" ? "p.price ASC"
    : f.sort === "price-desc" ? "p.price DESC"
    : f.sort === "name" ? "LOWER(p.name) ASC"
    : f.sort === "noutati" ? "p.id DESC"
    : "p.id DESC";

  const page = Math.max(1, f.page ?? 1);
  const perPage = Math.min(60, Math.max(12, f.perPage ?? 24));

  return { whereSql: where.join(" AND "), params, order, page, perPage };
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const sql = getSql();
  const rows = (await sql.unsafe(
    `${PRODUCT_SELECT} WHERE p.slug = $1 AND p.is_active = 1 LIMIT 1`,
    [slug] as never[]
  )) as unknown as Product[];
  return rows[0];
}

export async function listCategories(): Promise<Category[]> {
  const sql = getSql();
  return (await sql`
    SELECT c.id, c.name, c.slug, c.parent_id, c.image,
           COUNT(p.id)::int AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
    GROUP BY c.id
    HAVING COUNT(p.id) > 0
    ORDER BY product_count DESC, LOWER(c.name)`
  ) as Category[];
}

export async function listBrands(): Promise<Brand[]> {
  const sql = getSql();
  return (await sql`
    SELECT b.id, b.name, b.slug, COUNT(p.id)::int AS product_count
    FROM brands b
    JOIN products p ON p.brand_id = b.id AND p.is_active = 1
    GROUP BY b.id
    ORDER BY product_count DESC, LOWER(b.name)
    LIMIT 40`) as Brand[];
}

export async function brandsInCategory(ids: number[]): Promise<{ id: number; name: string; slug: string; product_count: number }[]> {
  if (ids.length === 0) return [];
  const sql = getSql();
  return (await sql`
    SELECT b.id, b.name, b.slug, COUNT(*)::int AS product_count
    FROM products p JOIN brands b ON b.id = p.brand_id
    WHERE p.is_active = 1 AND p.category_id = ANY(${ids})
    GROUP BY b.id ORDER BY product_count DESC LIMIT 20`) as { id: number; name: string; slug: string; product_count: number }[];
}

export async function getCategoryBySlug(slug: string) {
  const sql = getSql();
  const rows = await sql`SELECT * FROM categories WHERE slug = ${slug} LIMIT 1`;
  return rows[0] as
    | { id: number; name: string; slug: string; parent_id: number | null; image: string | null }
    | undefined;
}

export type CategoryNode = Category & { children: CategoryNode[] };

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  image: string | null;
  legacy_path: string | null;
  product_count: number;
};

// Ierarhia reala aquapiscine: parinti cu copii + count produse in subtree
export async function getCategoryTree(): Promise<CategoryNode[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT c.id, c.name, c.slug, c.parent_id, c.image, c.legacy_path,
           COUNT(DISTINCT p.id)::int AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
    GROUP BY c.id`) as CategoryRow[];

  const byParent = new Map<number | null, CategoryRow[]>();
  for (const r of rows) {
    const arr = byParent.get(r.parent_id) ?? [];
    arr.push(r);
    byParent.set(r.parent_id, arr);
  }

  const descendantsCache = new Map<number, number[]>();
  const descendantIds = (id: number): number[] => {
    const cached = descendantsCache.get(id);
    if (cached) return cached;
    const out: number[] = [];
    const stack = (byParent.get(id) ?? []).map((k) => k.id);
    while (stack.length) {
      const k = stack.pop()!;
      out.push(k);
      stack.push(...(byParent.get(k) ?? []).map((x) => x.id));
    }
    descendantsCache.set(id, out);
    return out;
  };

  const countCache = new Map<number, number>();
  const countWithKids = (id: number): number => {
    const cached = countCache.get(id);
    if (cached !== undefined) return cached;
    const self = rows.find((r) => r.id === id);
    const kids = byParent.get(id) ?? [];
    const total = (self?.product_count ?? 0) + kids.reduce((s, k) => s + countWithKids(k.id), 0);
    countCache.set(id, total);
    return total;
  };

  // imagini fallback: prima poza de produs din subarbore (un singur query pt toate)
  const allIds = rows.map((r) => r.id);
  const imgRows = (await sql`
    SELECT DISTINCT ON (p.category_id) p.category_id, p.image_url
    FROM products p
    WHERE p.is_active = 1 AND p.image_url IS NOT NULL AND p.category_id = ANY(${allIds})
    ORDER BY p.category_id, p.id`) as { category_id: number; image_url: string }[];
  const imgByCat = new Map(imgRows.map((r) => [r.category_id, r.image_url]));

  const resolveImage = (node: { id: number; image: string | null }) => {
    if (node.image) return node.image;
    for (const id of [node.id, ...descendantIds(node.id)]) {
      const img = imgByCat.get(id);
      if (img) return img;
    }
    return null;
  };

  const toNode = (r: CategoryRow): CategoryNode => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    parent_id: r.parent_id,
    image: resolveImage(r),
    product_count: countWithKids(r.id),
    children: (byParent.get(r.id) ?? []).map(toNode),
  });

  const parents = (byParent.get(null) ?? [])
    .map(toNode)
    .filter((p) => p.product_count > 0)
    .sort((a, b) => b.product_count - a.product_count);

  return parents;
}

// ID-urile categoriei + ale tuturor urmasilor (subtree)
export async function getCategorySubtreeIds(slug: string): Promise<{ cat: Awaited<ReturnType<typeof getCategoryWithChildren>> & object; ids: number[] } | null> {
  const cat = await getCategoryWithChildren(slug);
  if (!cat) return null;
  const sql = getSql();
  const all = (await sql`SELECT id, parent_id FROM categories`) as { id: number; parent_id: number | null }[];
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
export async function getCategoryWithChildren(slug: string) {
  const sql = getSql();
  const rows = await sql`SELECT * FROM categories WHERE slug = ${slug} LIMIT 1`;
  const cat = rows[0] as
    | { id: number; name: string; slug: string; parent_id: number | null; image: string | null; legacy_path: string | null }
    | undefined;
  if (!cat) return null;
  const children = (await sql`SELECT * FROM categories WHERE parent_id = ${cat.id} ORDER BY LOWER(name)`) as { id: number; name: string; slug: string }[];
  const parent = cat.parent_id
    ? ((await sql`SELECT * FROM categories WHERE id = ${cat.parent_id} LIMIT 1`)[0] as { id: number; name: string; slug: string } | undefined)
    : null;
  return { ...cat, children, parent };
}
