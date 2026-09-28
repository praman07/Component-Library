import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  HARDCODED_USERS,
  HARDCODED_CREDENTIALS,
  parseAuth,
  createSessionToken,
  removeSessionToken,
} from '../serverlessStore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { path } = req.query;
    const action = Array.isArray(path) ? path[0] : path;

    if (action === 'login') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const normEmail = (email || '').toLowerCase().trim();
      const expectedPass = HARDCODED_CREDENTIALS[normEmail];

      if (expectedPass && expectedPass === password) {
        const foundUser = HARDCODED_USERS.find((u) => u.email.toLowerCase() === normEmail);
        if (foundUser) {
          const token = createSessionToken(foundUser);
          res.setHeader(
            'Set-Cookie',
            `ti_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure`
          );
          return res.status(200).json({
            token,
            user: {
              id: foundUser.id,
              email: foundUser.email,
              role: foundUser.role,
              tier: foundUser.tier,
              createdAt: foundUser.createdAt,
            },
          });
        }
      }

      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    const auth = parseAuth(req);

    if (action === 'logout') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      if (auth.authToken) {
        removeSessionToken(auth.authToken);
      }
      res.setHeader('Set-Cookie', `ti_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`);
      return res.status(200).json({ success: true, message: 'Logged out successfully' });
    }

    if (action === 'me') {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      if (!auth.user) {
        return res.status(200).json({ user: null });
      }
      return res.status(200).json({
        user: {
          id: auth.user.id,
          email: auth.user.email,
          role: auth.user.role,
          tier: auth.user.tier,
          createdAt: auth.user.createdAt,
        },
      });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err: any) {
    console.error('Error in /api/auth/[...path] handler:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
