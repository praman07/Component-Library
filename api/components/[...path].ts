import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getComponentsList,
  getComponentBySlug,
  parseAuth,
  generateAiAgentPrompt,
} from '../serverlessStore';
import { ComponentSummary } from '../../src/packages/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const auth = parseAuth(req);

    // Normalize path query
    const { path } = req.query;
    const pathParts = Array.isArray(path) ? path : (path ? [path] : []);

    // Root: /api/components
    if (pathParts.length === 0) {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { category, accessLevel, search } = req.query;

      const components = getComponentsList({
        category: typeof category === 'string' ? category : undefined,
        accessLevel: typeof accessLevel === 'string' ? (accessLevel as any) : undefined,
        search: typeof search === 'string' ? search : undefined,
        includeDrafts: false,
      });

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
        dependenciesCount: Object.keys(c.dependencies || {}).length,
        filesCount: (c.files || []).length,
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

      const comp = getComponentBySlug(slug, false);
      if (!comp) {
        return res.status(404).json({
          error: `Component '${slug}' not found or not published`,
          code: 'COMPONENT_NOT_FOUND',
        });
      }

      const isLocked = comp.accessLevel === 'PREMIUM' && (!auth.user || auth.user.tier !== 'premium');

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
          lockReason: isLocked ? (!auth.user ? 'SIGN_IN_REQUIRED' : 'PREMIUM_REQUIRED') : undefined,
          installCommand: `npx tech-inject add ${comp.slug}`,
          aiAgentPrompt: generateAiAgentPrompt(comp),
        },
      });
    }

    // GET /api/components/:slug/source
    if (subResource === 'source') {
      const comp = getComponentBySlug(slug, false);
      if (!comp) {
        return res.status(404).json({ error: `Component '${slug}' not found` });
      }

      if (comp.accessLevel === 'PREMIUM' && (!auth.user || auth.user.tier !== 'premium')) {
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
      const comp = getComponentBySlug(slug, false);
      if (!comp) {
        return res.status(404).json({ error: `Component '${slug}' not found` });
      }

      if (comp.accessLevel === 'PREMIUM' && (!auth.user || auth.user.tier !== 'premium')) {
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
      const comp = getComponentBySlug(slug, false);
      if (!comp) {
        return res.status(404).json({ error: `Component '${slug}' not found` });
      }

      if (comp.accessLevel === 'PREMIUM' && (!auth.user || auth.user.tier !== 'premium')) {
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
