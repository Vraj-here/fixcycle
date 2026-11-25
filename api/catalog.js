import { BRANDS, getTotalModelCount } from '../src/data/brands.js';
import { INITIAL_SHOPS } from '../src/data/shops.js';
import { PUNE_CENTER, DEMO_LOCATIONS } from '../src/data/problems.js';

/**
 * Vercel Serverless Catalog Endpoint (GET /api/catalog)
 * Returns public Pune shop listings & smartphone catalog cleanly without exposing any user credentials.
 */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return res.status(200).json({
    city: 'Pune, Maharashtra',
    mapCenter: PUNE_CENTER,
    brandCount: BRANDS.length,
    modelCount: getTotalModelCount(),
    shopCount: INITIAL_SHOPS.length,
    areas: DEMO_LOCATIONS,
    brands: BRANDS,
    shops: INITIAL_SHOPS,
  });
}
