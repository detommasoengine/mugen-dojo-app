import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow importing from the @mugen/shared workspace package
  transpilePackages: ['@mugen/shared'],
  // Avoid static analysis errors for pages that use server-only env vars
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
};

export default nextConfig;
