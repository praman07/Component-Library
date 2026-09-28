import { Router } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../auth';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.verifyCredentials(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
  }

  const session = db.createSession(user);

  res.cookie('ti_session', session.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    token: session.token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
      createdAt: user.createdAt,
    },
  });
});

router.post('/logout', (req: AuthenticatedRequest, res) => {
  if (req.authToken) {
    db.deleteSession(req.authToken);
  }
  res.clearCookie('ti_session');
  return res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  return res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      tier: req.user.tier,
      createdAt: req.user.createdAt,
    },
  });
});

export default router;
