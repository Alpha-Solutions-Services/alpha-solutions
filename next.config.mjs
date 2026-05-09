import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  compress: true,
  images: {
    formats: ["image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "landline.media" },
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "play-lh.googleusercontent.com" },
      { protocol: "https", hostname: "d1c73bf43ozp9u.cloudfront.net" },
      { protocol: "https", hostname: "cdn.prod.website-files.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "alphasolutions.software" }],
        destination: "https://www.alphasolutions.software/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "alphasolutions.online" }],
        destination: "https://www.alphasolutions.software/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.alphasolutions.online" }],
        destination: "https://www.alphasolutions.software/:path*",
        permanent: true,
      },
      {
        source: "/webdevservices",
        destination: "/services/custom-web-development",
        permanent: true,
      },
      {
        source: "/aichatbot",
        destination: "/services/ai-chatbot",
        permanent: true,
      },
      {
        source: "/mobileapp",
        destination: "/services/mobile-app-development",
        permanent: true,
      },
      {
        source: "/portal",
        destination: "/portal/login",
        permanent: true,
      },
      {
        source: "/services/freight",
        destination: "/freight",
        permanent: true,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
