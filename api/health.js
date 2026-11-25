/**
 * Vercel Serverless Health Check Endpoint (GET /api/health)
 * Zero paid API keys required.
 */
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    status: 'ok',
    service: 'FixCycle Marketplace API',
    region: 'Pune, Maharashtra, India',
    timestamp: new Date().toISOString(),
  });
}
