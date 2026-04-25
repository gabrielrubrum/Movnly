import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nexrice.com'
  const now = new Date()

  const routes = [
    '',
    '/services',
    '/como-funciona',
    '/tours',
    '/rotas',
    '/parceiros',
    '/parceiros/agencias',
    '/parceiros/hoteis',
    '/termos',
    '/privacidade',
    '/login',
    '/motorista/login'
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' : 'monthly',
    priority: route === '' ? 1 : route.startsWith('/parceiros') ? 0.4 : 0.7,
  }))
}
