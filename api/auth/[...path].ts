import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../../server/db';
import { extractAuthUser, AuthenticatedRequest } from '../../server/auth';
import { connectMongo, isMongoActive } from '../../server/mongodb';
import { UserModel, SessionModel } from '../../server/models';
import { HARDCODED_USERS, HARDCODED_CREDENTIALS } from '../../server/hardcodedData';

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
  try {
    await runMiddleware(req, res, extractAuthUser);
    const authReq = req as unknown as AuthenticatedRequest;

    await connectMongo();

    const { path } = req.query;
    const action = Array.isArray(path) ? path[0] : path;

    if (action === 'login') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Check hardcoded credentials first for instantaneous zero-latency sign-in
      const normEmail = email.toLowerCase().trim();
      const expectedPass = HARDCODED_CREDENTIALS[normEmail];
      if (expectedPass && expectedPass === password) {
        const foundUser = HARDCODED_USERS.find((u) => u.email.toLowerCase() === normEmail);
        if (foundUser) {
          const session = db.createSession(foundUser);
          res.setHeader('Set-Cookie', `ti_session=${session.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure`);
          return res.status(200).json({
            token: session.token,
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

      // Check MongoDB if active
      if (isMongoActive()) {
        const userDoc = await UserModel.findOne({ email: normEmail });
        if (userDoc) {
          const valid = await bcrypt.compare(password, userDoc.passwordHash);
          if (valid) {
            const token = `ti_sess_${crypto.randomBytes(24).toString('hex')}`;
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            await SessionModel.create({
              token,
              userId: userDoc.userId,
              email: userDoc.email,
              role: userDoc.role,
              tier: userDoc.tier,
              expiresAt,
            });

            db.createSession({
              id: userDoc.userId,
              email: userDoc.email,
              role: userDoc.role,
              tier: userDoc.tier,
              createdAt: userDoc.createdAt.toISOString(),
              updatedAt: userDoc.updatedAt.toISOString(),
            });

            res.setHeader('Set-Cookie', `ti_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure`);
            return res.status(200).json({
              token,
              user: {
                id: userDoc.userId,
                email: userDoc.email,
                role: userDoc.role,
                tier: userDoc.tier,
                createdAt: userDoc.createdAt.toISOString(),
              },
            });
          }
        }
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
        if (isMongoActive()) {
          await SessionModel.deleteOne({ token: authReq.authToken });
        }
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
  } catch (err: any) {
    console.error('Error in /api/auth/[...path] handler:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
