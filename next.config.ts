import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.135"],
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
