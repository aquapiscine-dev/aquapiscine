import type { CollectionConfig } from "payload";

export const categorii: CollectionConfig = {
  slug: "categorii",
  labels: { singular: "Categorie", plural: "Categorii" },
  admin: { useAsTitle: "name", defaultColumns: ["name", "slug", "parent"] },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    {
      name: "parent",
      type: "relationship",
      relationTo: "categorii",
      admin: { description: "Categoria părinte (gol = top-level)" },
    },
    { name: "imageUrl", type: "text", admin: { description: "URL imagine categorie" } },
    { name: "sortOrder", type: "number", defaultValue: 0 },
    // URL vechi indexat in Google — nu se modifica decat intentionat
    { name: "legacyPath", type: "text", admin: { readOnly: true, description: "/categorie-produs/..." } },
  ],
};
