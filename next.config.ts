import type { NextConfig } from 'next';

const strict = process.env.NEXT_STRICT !== 'false';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: !strict,
  },
  eslint: {
    ignoreDuringBuilds: !strict,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias['@opentelemetry/exporter-jaeger'] = false;
    config.resolve.alias['@genkit-ai/core'] = false;
    config.resolve.alias['genkit'] = false;
    config.resolve.alias['dotprompt'] = false;
    config.resolve.alias['handlebars'] = false;
    // 서버 빌드에서 konva가 node-canvas를 요구하지 않도록
    config.resolve.alias['canvas'] = false;
    return config;
  },
};

export default nextConfig;
