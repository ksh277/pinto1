
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  webpack: (config) => {
    config.resolve.alias['@opentelemetry/exporter-jaeger'] = false;
    config.resolve.alias['@genkit-ai/firebase'] = false;
    config.resolve.alias['@genkit-ai/core'] = false;
    config.resolve.alias['genkit'] = false;
    config.resolve.alias['dotprompt'] = false;
    config.resolve.alias['handlebars'] = false;
    return config;
  },
};

export default nextConfig;
