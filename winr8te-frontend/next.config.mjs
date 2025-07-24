/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["avatars.steamstatic.com"], // autorise ce domaine
  },
  output: "standalone",
};

export default nextConfig;
