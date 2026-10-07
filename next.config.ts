import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Reuse a visited tab for 30s instead of refetching on every switch.
    // Server actions that call revalidatePath still invalidate it immediately.
    staleTimes: { dynamic: 30 },
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
