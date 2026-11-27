import type { CollectionConfig } from "payload";

// Utilizatori admin (login in /admin)
export const authCollection: CollectionConfig = {
  slug: "users",
  labels: { singular: "Utilizator", plural: "Utilizatori" },
  auth: true,
  admin: { useAsTitle: "email" },
  fields: [
    { name: "name", type: "text" },
  ],
};
