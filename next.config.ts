import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  //will not show the userName or Password in the console log in development
  // logging: {
  //   serverFunctions: false,
  // },
};

export default nextConfig;
