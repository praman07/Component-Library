import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../server/db';
import { extractAuthUser, AuthenticatedRequest } from '../../server/auth';
import { connectMongo, isMongoActive } from '../../server/mongodb';
import { ComponentModel } from '../../server/models';
import { HARDCODED_COMPONENTS } from '../../server/hardcodedData';
import { generateAiAgentPrompt } from '../../server/generator';
import { ComponentSummary, ComponentRecord, AccessLevel } from '../../src/packages/types';

// Helper to run express-style middleware
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

async function getComponentFromStore(slug: string, includeUnpublished = false): Promise<ComponentRecord | null> {
  if (isMongoActive()) {
    const query: any = { slug: slug.toLowerCase() };
    if (!includeUnpublished) {
      query.status = 'PUBLISHED';
    }
    const doc = await ComponentModel.findOne(query).lean();
    if (doc) {
      return {
        id: (doc as any).componentId || (doc as any)._id.toString(),
        name: doc.name,
        slug: doc.slug,
        description: doc.description,
        category: doc.category as any,
        version: doc.version,
        accessLevel: doc.accessLevel,
        status: doc.status,
        dependencies: doc.dependencies instanceof Map ? Object.fromEntries(doc.dependencies) : (doc.dependencies || {}),
        devDependencies: doc.devDependencies instanceof Map ? Object.fromEntries(doc.devDependencies) : (doc.devDependencies || {}),
        propsSchema: doc.propsSchema || [],
        files: doc.files || [],
        mainFile: doc.mainFile,
        usageDocs: doc.usageDocs,
        previewStates: doc.previewStates || [],
        tags: doc.tags || [],
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
        publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : null,
      };
    }
  }
  const comp = db.getComponentBySlug(slug, includeUnpublished);
  if (comp) return comp;
  const hardcoded = HARDCODED_COMPONENTS.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
  if (hardcoded) {
    if (!includeUnpublished && hardcoded.status !== 'PUBLISHED') return null;
    return hardcoded;
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    try {
      await runMiddleware(req, res, extractAuthUser);
    } catch (e) {
      // Non-fatal
    }
    const authReq = req as unknown as AuthenticatedRequest;

    try {
      await connectMongo();
    } catch (e) {
      // Non-fatal
    }

    // Normalize path query or URL
    const { path } = req.query;
    const pathParts = Array.isArray(path) ? path : (path ? [path] : []);

    // Root: /api/components
    if (pathParts.length === 0) {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { category, accessLevel, search } = req.query;

      if (isMongoActive()) {
        const query: any = { status: 'PUBLISHED' };
        if (category && category !== 'all') query.category = category;
        if (accessLevel) query.accessLevel = accessLevel;
        if (search && typeof search === 'string') {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } },
          ];
        }
        const mongoComps = await ComponentModel.find(query).lean();
        if (mongoComps && mongoComps.length > 0) {
          const summaries: ComponentSummary[] = mongoComps.map((c: any) => ({
            id: c.componentId || c._id.toString(),
            name: c.name,
            slug: c.slug,
            description: c.description,
            category: c.category,
            version: c.version,
            accessLevel: c.accessLevel,
            status: c.status,
            tags: c.tags || [],
            dependenciesCount: c.dependencies ? (c.dependencies instanceof Map ? c.dependencies.size : Object.keys(c.dependencies).length) : 0,
            filesCount: c.files ? c.files.length : 0,
            publishedAt: c.publishedAt ? new Date(c.publishedAt).toISOString() : null,
            updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
          }));
          return res.status(200).json({ components: summaries });
        }
      }

      let components = db.listComponents({
        category: typeof category === 'string' ? category : undefined,
        accessLevel: typeof accessLevel === 'string' ? (accessLevel as AccessLevel) : undefined,
        search: typeof search === 'string' ? search : undefined,
        includeDrafts: false,
      });

      if (!components || components.length === 0) {
        components = HARDCODED_COMPONENTS.filter((c) => c.status === 'PUBLISHED');
        if (category && category !== 'all') {
          components = components.filter((c) => c.category === category);
        }
        if (accessLevel) {
          components = components.filter((c) => c.accessLevel === accessLevel);
        }
        if (search && typeof search === 'string') {
          const q = search.toLowerCase();
          components = components.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
        }
      }

      const summaries: ComponentSummary[] = components.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        category: c.category,
        version: c.version,
        accessLevel: c.accessLevel,
        status: c.status,
        tags: c.tags,
        dependenciesCount: Object.keys(c.dependencies).length,
        filesCount: c.files.length,
        publishedAt: c.publishedAt,
        updatedAt: c.updatedAt,
      }));

      return res.status(200).json({ components: summaries });
    }

    const [slug, subResource] = pathParts;

    // GET /api/components/:slug
    if (!subResource) {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const comp = await getComponentFromStore(slug, false);
      if (!comp) {
        return res.status(404).json({
          error: `Component '${slug}' not found or not published`,
          code: 'COMPONENT_NOT_FOUND',
        });
      }

      const isLocked = comp.accessLevel === 'PREMIUM' && (!authReq.user || authReq.user.tier !== 'premium');

      return res.status(200).json({
        component: {
          id: comp.id,
          name: comp.name,
          slug: comp.slug,
          description: comp.description,
          category: comp.category,
          version: comp.version,
          accessLevel: comp.accessLevel,
          status: comp.status,
          dependencies: comp.dependencies,
          devDependencies: comp.devDependencies,
          propsSchema: comp.propsSchema,
          previewStates: comp.previewStates,
          tags: comp.tags,
          mainFile: comp.mainFile,
          files: isLocked
            ? comp.files.map((f) => ({
                path: f.path,
                content: '// [PREMIUM ACCESS REQUIRED]\n// Upgrade your account to view the full TypeScript source code.',
                description: f.description,
              }))
            : comp.files,
          usageDocs: isLocked
            ? '// [PREMIUM ACCESS REQUIRED]\n// Full usage documentation is available for Pro tier subscribers.'
            : comp.usageDocs,
          createdAt: comp.createdAt,
          updatedAt: comp.updatedAt,
          publishedAt: comp.publishedAt,
          isLocked,
          lockReason: isLocked ? (!authReq.user ? 'SIGN_IN_REQUIRED' : 'PREMIUM_REQUIRED') : undefined,
          installCommand: `npx tech-inject add ${comp.slug}`,
          aiAgentPrompt: generateAiAgentPrompt(comp),
        },
      });
    }

    // GET /api/components/:slug/source
    if (subResource === 'source') {
      const comp = await getComponentFromStore(slug, false);
      if (!comp) {
        return res.status(404).json({ error: `Component '${slug}' not found` });
      }

      if (comp.accessLevel === 'PREMIUM' && (!authReq.user || authReq.user.tier !== 'premium')) {
        return res.status(403).json({
          error: `Access Denied: The '${comp.name}' component requires an active Premium subscription.`,
          code: 'PREMIUM_REQUIRED',
          accessLevel: comp.accessLevel,
        });
      }

      return res.status(200).json({
        slug: comp.slug,
        version: comp.version,
        accessLevel: comp.accessLevel,
        mainFile: comp.mainFile,
        files: comp.files,
        dependencies: comp.dependencies,
      });
    }

    // GET /api/components/:slug/ai-prompt
    if (subResource === 'ai-prompt') {
      const comp = await getComponentFromStore(slug, false);
      if (!comp) {
        return res.status(404).json({ error: `Component '${slug}' not found` });
      }

      if (comp.accessLevel === 'PREMIUM' && (!authReq.user || authReq.user.tier !== 'premium')) {
        return res.status(403).json({
          error: `Access Denied: AI prompt generation for '${comp.name}' requires an active Premium subscription.`,
          code: 'PREMIUM_REQUIRED',
          accessLevel: comp.accessLevel,
        });
      }

      const prompt = generateAiAgentPrompt(comp);
      return res.status(200).json({
        slug: comp.slug,
        name: comp.name,
        prompt,
      });
    }

    // GET /api/components/:slug/preview
    if (subResource === 'preview') {
      const comp = await getComponentFromStore(slug, false);
      if (!comp) {
        return res.status(404).json({ error: `Component '${slug}' not found` });
      }

      if (comp.accessLevel === 'PREMIUM' && (!authReq.user || authReq.user.tier !== 'premium')) {
        return res.status(403).json({
          error: `Access Denied: Live preview for '${comp.name}' requires an active Premium subscription.`,
          code: 'PREMIUM_REQUIRED',
          accessLevel: comp.accessLevel,
        });
      }

      return res.status(200).json({
        slug: comp.slug,
        name: comp.name,
        previewStates: comp.previewStates,
        propsSchema: comp.propsSchema,
      });
    }

    return res.status(404).json({ error: 'Endpoint not found' });
  } catch (err: any) {
    console.error('Error in /api/components/[...path] handler:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
