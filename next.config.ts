import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
const sanitizedBasePath = rawBasePath.replace(/^\/|\/$/g, "");
const normalizedBasePath = sanitizedBasePath
  ? `/${sanitizedBasePath}`
  : undefined;

const shouldExport =
  isProd && typeof normalizedBasePath === "string" && normalizedBasePath.length;

const baseConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
    };
    return config;
  },
};

const exportOverrides: NextConfig | null = shouldExport
  ? {
      output: "export",
      trailingSlash: true,
      images: {
        unoptimized: true,
      },
      basePath: normalizedBasePath,
      assetPrefix: normalizedBasePath,
    }
  : null;

export default {
  ...baseConfig,
  ...(exportOverrides ?? {}),
} satisfies NextConfig;
