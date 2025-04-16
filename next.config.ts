import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/sleep-data",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
