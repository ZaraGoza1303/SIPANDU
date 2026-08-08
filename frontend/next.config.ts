import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ddlkvqkawftfvyifszym.supabase.co",
      },
    ],
  },
};

export default nextConfig;