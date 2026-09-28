import { Router } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requirePremiumAccess } from '../auth';
import { generateAiAgentPrompt } from '../generator';
import {
  ComponentSummary,
  ComponentDetailResponse,
  AccessLevel,
} from '../../src/packages/types';

const router = Router();

/**
 * GET /api/components
 * Public catalogue listing.
 * NEVER returns DRAFT or UNPUBLISHED components.
 */
router.get('/', (req: AuthenticatedRequest, res) => {
  const { category, accessLevel, search } = req.query;

  const components = db.listComponents({
    category: typeof category === 'string' ? category : undefined,
    accessLevel: typeof accessLevel === 'string' ? (accessLevel as AccessLevel) : undefined,
    search: typeof search === 'string' ? search : undefined,
    includeDrafts: false, // Strict public separation
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
    dependenciesCount: Object.keys(c.dependencies).length,
    filesCount: c.files.length,
    publishedAt: c.publishedAt,
    updatedAt: c.updatedAt,
  }));

  return res.json({ components: summaries });
});

/**
 * GET /api/components/:slug
 * Component detail route.
 * Enforces Free vs Premium access matrix.
 */
router.get('/:slug', (req: AuthenticatedRequest, res) => {
  const { slug } = req.params;
  const comp = db.getComponentBySlug(slug, false);

  if (!comp) {
    return res.status(404).json({
      error: `Component '${slug}' not found or not published`,
      code: 'COMPONENT_NOT_FOUND',
    });
  }

  const isFree = comp.accessLevel === 'FREE';
  const isPremiumUser = req.user && (req.user.tier === 'premium' || req.user.role === 'admin');

  // If free OR user has premium access -> return UNLOCKED detail
  if (isFree || isPremiumUser) {
    const unlocked: ComponentDetailResponse = {
      id: comp.id,
      name: comp.name,
      slug: comp.slug,
      description: comp.description,
      category: comp.category,
      version: comp.version,
      accessLevel: comp.accessLevel,
      status: comp.status,
      tags: comp.tags,
      dependencies: comp.dependencies,
      devDependencies: comp.devDependencies,
      propsSchema: comp.propsSchema,
      files: comp.files,
      mainFile: comp.mainFile,
      usageDocs: comp.usageDocs,
      previewStates: comp.previewStates,
      isLocked: false,
      installCommand: `npx tech-inject add ${comp.slug}`,
      aiAgentPrompt: generateAiAgentPrompt(comp),
      updatedAt: comp.updatedAt,
      publishedAt: comp.publishedAt,
    };
    return res.json({ component: unlocked });
  }

  // Otherwise -> LOCKED detail. Strictly redact source code, files, and install endpoint!
  const locked: ComponentDetailResponse = {
    id: comp.id,
    name: comp.name,
    slug: comp.slug,
    description: comp.description,
    category: comp.category,
    version: comp.version,
    accessLevel: comp.accessLevel,
    status: comp.status,
    tags: comp.tags,
    dependencies: comp.dependencies,
    propsSchema: comp.propsSchema,
    isLocked: true,
    lockReason: req.user ? 'PREMIUM_REQUIRED' : 'SIGN_IN_REQUIRED',
    staticThumbnail: comp.staticThumbnail,
    updatedAt: comp.updatedAt,
    publishedAt: comp.publishedAt,
  };

  return res.json({ component: locked });
});

/**
 * GET /api/components/:slug/source
 * Direct endpoint for source files download.
 * Verified server-side.
 */
router.get('/:slug/source', (req: AuthenticatedRequest, res) => {
  const { slug } = req.params;
  const comp = db.getComponentBySlug(slug, false);

  if (!comp) {
    return res.status(404).json({ error: 'Component not found' });
  }

  if (comp.accessLevel === 'PREMIUM') {
    if (!req.user) {
      return res.status(401).json({ error: 'Sign-in required', code: 'SIGN_IN_REQUIRED' });
    }
    if (req.user.tier !== 'premium' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Premium subscription required', code: 'PREMIUM_REQUIRED' });
    }
  }

  return res.json({
    slug: comp.slug,
    version: comp.version,
    dependencies: comp.dependencies,
    files: comp.files,
    mainFile: comp.mainFile,
  });
});

/**
 * POST /api/components/:slug/install
 * Installer CLI / direct manifest endpoint.
 * Real validation of caller permissions and files payload.
 */
router.post('/:slug/install', (req: AuthenticatedRequest, res) => {
  const { slug } = req.params;
  const comp = db.getComponentBySlug(slug, false);

  if (!comp) {
    return res.status(404).json({
      error: `Component '${slug}' does not exist or is unpublished`,
      code: 'COMPONENT_NOT_FOUND',
    });
  }

  if (comp.accessLevel === 'PREMIUM') {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication token required for premium component installation',
        code: 'SIGN_IN_REQUIRED',
      });
    }
    if (req.user.tier !== 'premium' && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Active premium subscription required to install this component',
        code: 'PREMIUM_REQUIRED',
      });
    }
  }

  return res.json({
    success: true,
    component: {
      name: comp.name,
      slug: comp.slug,
      version: comp.version,
      category: comp.category,
      dependencies: comp.dependencies,
      devDependencies: comp.devDependencies || {},
      files: comp.files,
      mainFile: comp.mainFile,
    },
    message: `Bundle ready for installation: ${comp.name} v${comp.version}`,
  });
});

/**
 * GET /api/components/:slug/ai-prompt
 * AI Agent prompt endpoint with strict server-side premium validation.
 */
router.get('/:slug/ai-prompt', (req: AuthenticatedRequest, res) => {
  const { slug } = req.params;
  const comp = db.getComponentBySlug(slug, false);

  if (!comp) {
    return res.status(404).json({ error: `Component '${slug}' not found or unpublished`, code: 'COMPONENT_NOT_FOUND' });
  }

  if (comp.accessLevel === 'PREMIUM') {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required for premium component AI prompt',
        code: 'SIGN_IN_REQUIRED',
      });
    }
    if (req.user.tier !== 'premium' && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Active premium subscription required to generate AI agent prompt',
        code: 'PREMIUM_REQUIRED',
      });
    }
  }

  const prompt = generateAiAgentPrompt(comp);
  return res.json({
    slug: comp.slug,
    name: comp.name,
    prompt,
  });
});

/**
 * GET /api/components/:slug/preview
 * Component preview data endpoint with server-side protection.
 */
router.get('/:slug/preview', (req: AuthenticatedRequest, res) => {
  const { slug } = req.params;
  const comp = db.getComponentBySlug(slug, false);

  if (!comp) {
    return res.status(404).json({ error: `Component '${slug}' not found or unpublished`, code: 'COMPONENT_NOT_FOUND' });
  }

  if (comp.accessLevel === 'PREMIUM') {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required for live interactive preview',
        code: 'SIGN_IN_REQUIRED',
      });
    }
    if (req.user.tier !== 'premium' && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Active premium subscription required for live interactive preview',
        code: 'PREMIUM_REQUIRED',
      });
    }
  }

  return res.json({
    slug: comp.slug,
    name: comp.name,
    previewStates: comp.previewStates,
    propsSchema: comp.propsSchema,
  });
});

export default router;
