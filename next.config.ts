import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  trailingSlash: true,
  // Redirecturi de la URL-urile vechi WooCommerce (aquapiscine.ro)
  async redirects() {
    return [
      { source: "/cart-2", destination: "/cos/", permanent: true },
      { source: "/contul-meu", destination: "/cont/", permanent: true },
      { source: "/contul-meu/parola-pierduta", destination: "/cont/login/", permanent: true },
      { source: "/atribut-produs/brand/:slug", destination: "/brand/:slug/", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withPayload(nextConfig);
