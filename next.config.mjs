/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  output: "export", // чтобы получить папку out/ для Бегета
};

export default nextConfig;
