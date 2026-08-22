import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs", "pdf-parse"],
  experimental: {
    // Support messages allow up to 3 x 5 MB images. Base64 transport adds
    // roughly 33%, so keep both Server Action and Proxy buffering bounded
    // while leaving enough room for the serialized action payload.
    serverActions: {
      bodySizeLimit: "24mb",
    },
    proxyClientMaxBodySize: "24mb",
  },
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
