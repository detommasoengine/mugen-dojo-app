import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow importing from the @mugen/shared workspace package
  transpilePackages: ['@mugen/shared'],
  // Moved from experimental.serverComponentsExternalPackages (renamed in Next.js 15+)
  serverExternalPackages: ['@supabase/supabase-js'],
};

export default nextConfig;
