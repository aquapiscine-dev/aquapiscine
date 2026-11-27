import type { CollectionConfig } from "payload";

export const produse: CollectionConfig = {
  slug: "produse",
  labels: { singular: "Produs", plural: "Produse" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "sku", "price", "salePrice", "stock", "brand", "category"],
    livePreview: {
      url: ({ data }) =>
        data?.legacyPath
          ? String(data.legacyPath)
          : data?.slug
            ? `/produse/${data.slug}`
            : "/",
    },
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, index: true, admin: { description: "Slug intern (URL /produse/...)" } },
    { name: "sku", type: "text", index: true },
    {
      name: "legacyPath",
      type: "text",
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: "URL vechi indexat Google: /magazin/{categorie}/{sub}/{slug}/ — nu se modifica",
      },
    },
    { name: "price", type: "number", required: true, min: 0 },
    { name: "salePrice", type: "number", min: 0 },
    { name: "stock", type: "number", defaultValue: 0, min: 0 },
    { name: "inStock", type: "checkbox", defaultValue: true },
    { name: "availability", type: "text", admin: { description: "Ex: La comanda 2-3 saptamani" } },
    { name: "brand", type: "relationship", relationTo: "branduri" },
    { name: "category", type: "relationship", relationTo: "categorii" },
    {
      name: "gallery",
      type: "array",
      fields: [
        { name: "image", type: "upload", relationTo: "media", admin: { description: "Urleaza o imagine din Media" } },
        { name: "url", type: "text", admin: { description: "URL direct — folosit de produsele importate" } },
        { name: "alt", type: "text" },
      ],
    },
    { name: "shortDescription", type: "textarea" },
    { name: "description", type: "richText" },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "metaTitle", type: "text" },
        { name: "metaDescription", type: "textarea" },
        { name: "ogImage", type: "text" },
      ],
    },
  ],
};
