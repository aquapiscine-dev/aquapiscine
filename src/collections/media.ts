import path from "path";
import { fileURLToPath } from "url";
import type { CollectionConfig } from "payload";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// fisierele urcate se salveaza in ./media (dev). Pe Vercel -> adapter S3/Supabase Storage.
export const media: CollectionConfig = {
  slug: "media",
  upload: {
    staticDir: path.resolve(dirname, "../../media"),
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "thumbnail", width: 300, height: 300, position: "centre" },
      { name: "card", width: 600, height: 600, position: "centre" },
    ],
  },
  admin: { useAsTitle: "filename", defaultColumns: ["filename", "alt", "updatedAt"] },
  fields: [{ name: "alt", type: "text" }],
};
