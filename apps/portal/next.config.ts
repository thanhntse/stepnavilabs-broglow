import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      'example.com',
      'localhost',
      'res.cloudinary.com',
      'images.unsplash.com',
      'cf.shopee.vn',
      'down-vn.img.susercontent.com',
      'shopee.vn',
      'lh3.googleusercontent.com',
    ],
  },
  // Các cấu hình khác
};

export default nextConfig;
