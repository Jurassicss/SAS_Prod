/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const pwaConfig = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
};

const nextConfig = {
  turbopack: {
    experimental: {
      // allowedDevOrigins: ['http://192.168.56.1'],
    },
    reactStrictMode: true,
    // pwa: {
    //   dest: 'public',
    //   register: true,
    //   skipWaiting: true,
    //   dynamicStartUrl: true,  // для iOS
    //   reloadOnOnline: true    // для автообновления
    // }
  },
  
};

export default withPWA(pwaConfig)(nextConfig);