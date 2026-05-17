import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'movnly.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/como-funciona',
          '/reservar',
          '/services',
          '/tours',
          '/privacidade',
          '/termos',
          '/reembolsos'
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/motorista',
          '/motorista/*',
          '/parceiros',
          '/parceiros/*',
          '/cliente',
          '/cliente/*',
          '/dashboard',
          '/dashboard/*',
          '/api/*',
          '/*?*' // Disallow query parameters to prevent duplicate pages indexing
        ],
      },
    ],
    sitemap: `https://${rootDomain}/sitemap.xml`,
  };
}
