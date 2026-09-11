/** @type {import('next').NextConfig} */
const projectRoot = __dirname;

const REQUIRED_PUBLIC_ENV = ["NEXT_PUBLIC_TELEGRAM_BOT_ID", "NEXT_PUBLIC_TELEGRAM_BOT_USERNAME"];
const missingEnv = REQUIRED_PUBLIC_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.warn(`⚠️  Missing required env vars for build: ${missingEnv.join(", ")}`);
}

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: projectRoot,
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  turbopack: { root: projectRoot },
  async redirects() {
    return [
      {
        destination: "/sell",
        permanent: true,
        source: "/create-vehicle-lot/page",
      },
      {
        destination: "/sell",
        permanent: true,
        source: "/create-vehicle-lot",
      },
    ];
  },
};

module.exports = nextConfig;
