import type { NextConfig } from "next";
import { siteConfig } from "./src/shared/config/site";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return siteConfig.isPrototype
      ? [
          {
            source: "/:path*",
            headers: [
              { key: "X-Robots-Tag", value: "noindex, nofollow" },
            ],
          },
        ]
      : [];
  },
};

export default nextConfig;
