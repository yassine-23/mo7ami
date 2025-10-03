/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['ar', 'fr'],
    defaultLocale: 'ar',
  },
  images: {
    domains: ['lh3.googleusercontent.com'], // For Google OAuth profile images
  },
};

export default nextConfig;
