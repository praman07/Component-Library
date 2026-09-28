import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './server/routes/authRoutes';
import componentsRoutes from './server/routes/componentsRoutes';
import adminRoutes from './server/routes/adminRoutes';
import { extractAuthUser } from './server/auth';
import { db } from './server/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // Read port from CLI flags (--port=XXXX, --port XXXX), positional numeric arg (e.g. 3001), or PORT env
  const positionalPort = process.argv.slice(2).find(arg => /^\d{4,5}$/.test(arg));
  const portArg = process.argv.find(arg => arg.startsWith('--port=') || arg.startsWith('--port:'))?.split(/[=:]/)[1]
    || (process.argv.indexOf('--port') !== -1 ? process.argv[process.argv.indexOf('--port') + 1] : undefined)
    || positionalPort
    || process.env.PORT
    || '3000';
  const PORT = parseInt(portArg, 10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Body parsing and auth context
  app.use(express.json({ limit: '2mb' }));
  app.use(extractAuthUser);

  // Mount API endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/components', componentsRoutes);
  app.use('/api/admin', adminRoutes);

  // API Health / info
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      name: 'Tech Inject Design Library API',
      version: '1.0.0',
      time: new Date().toISOString(),
    });
  });

  if (!isProduction) {
    // Development mode: attach Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true' ? {
          port: PORT + 20000,
        } : false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Tech Inject Server] Running at http://0.0.0.0:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('[Server Start Error]:', err);
  process.exit(1);
});
