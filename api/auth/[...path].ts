import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../server/db';
import { extractAuthUser, AuthenticatedRequest } from '../../server/auth';

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await runMiddleware(req, res, extractAuthUser);
  const authReq = req as unknown as AuthenticatedRequest;

  const { path } = req.query;
  const action = Array.isArray(path) ? path[0] : path;

  if (action === 'login') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = db.verifyCredentials(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }
    const session = db.createSession(user);
    res.setHeader('Set-Cookie', `ti_session=${session.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure`);
    return res.status(200).json({
      token: session.token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tier: user.tier,
        createdAt: user.createdAt,
      },
    });
  }

  if (action === 'logout') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (authReq.authToken) {
      db.deleteSession(authReq.authToken);
    }
    res.setHeader('Set-Cookie', `ti_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`);
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  }

  if (action === 'me') {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (!authReq.user) {
      return res.status(200).json({ user: null });
    }
    return res.status(200).json({
      user: {
        id: authReq.user.id,
        email: authReq.user.email,
        role: authReq.user.role,
        tier: authReq.user.tier,
        createdAt: authReq.user.createdAt,
      },
    });
  }

  return res.status(404).json({ error: 'Not found' });
}
