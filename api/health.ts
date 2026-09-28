import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    status: 'healthy',
    name: 'Tech Inject Design Library API',
    version: '1.0.0',
    time: new Date().toISOString(),
  });
}
