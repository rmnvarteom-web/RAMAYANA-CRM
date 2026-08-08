import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The invoice PDF route reads a font file from disk at runtime; make sure
  // Vercel's build tracer bundles it into the serverless function.
  outputFileTracingIncludes: {
    "/**": ["./src/features/invoices/fonts/**"],
  },
};

export default nextConfig;
