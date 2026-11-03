import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    optimizePackageImports: [
      "@mantine/core",
      "@mantine/hooks",
      "@mantine/dates",
      "@mantine/notifications",
      "@mantine/tiptap",
      "@mantine/carousel",
      "@mantine/dropzone",
    ],
  },
};

export default nextConfig;
