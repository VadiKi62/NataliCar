/** @type {import('next').NextConfig} */

const nextConfig = {
  basePath: "",
  reactStrictMode: true,
  images: { unoptimized: true },
  env: {
    NEXT_LOCAL_API_BASE_URL: "http://localhost:3000",
    NEXT_PUBLIC_API_BASE_URL: "https://natali-cars.com/",
  },
};

export default nextConfig;
