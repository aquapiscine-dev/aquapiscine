import type { CollectionConfig } from "payload";

export const branduri: CollectionConfig = {
  slug: "branduri",
  labels: { singular: "Brand", plural: "Branduri" },
  admin: { useAsTitle: "name", defaultColumns: ["name", "slug"] },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "logoUrl", type: "text" },
    { name: "legacyPath", type: "text", admin: { readOnly: true, description: "/brand/..." } },
  ],
};
