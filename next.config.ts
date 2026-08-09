import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The invoice PDF route reads a font file from disk at runtime; make sure
  // Vercel's build tracer bundles it into the serverless function.
  outputFileTracingIncludes: {
    "/**": ["./src/features/invoices/fonts/**"],
  },
  // Payment slip photos go through Server Actions as multipart uploads.
  // Next's default 1MB body limit rejects a typical phone photo before our
  // own 8MB validation in uploads.ts even runs.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
