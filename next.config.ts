import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Plain static site in out/, can be hosted anywhere (GitHub Pages, Vercel, ...)
  output: "export",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
