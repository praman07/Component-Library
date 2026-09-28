import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { AuthenticatedRequest, requireAdmin } from '../auth';
import { ComponentRecord, ComponentCategory, AccessLevel, ComponentStatus } from '../../src/packages/types';

const router = Router();

// Apply requireAdmin to ALL admin routes
router.use(requireAdmin);

// Zod schema for component validation
const ComponentBundleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(400),
  category: z.enum(['primitives', 'forms', 'data-display', 'feedback', 'navigation', 'overlays']),
  version: z.string().regex(/^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/, 'Version must follow semver format (e.g. 1.0.0)'),
  accessLevel: z.enum(['FREE', 'PREMIUM']),
  status: z.enum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED']).default('DRAFT'),
  dependencies: z.record(z.string(), z.string()).default({}),
  devDependencies: z.record(z.string(), z.string()).optional().default({}),
  propsSchema: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      default: z.string().optional(),
      description: z.string(),
    })
  ).default([]),
  files: z.array(
    z.object({
      path: z.string().refine((p) => !p.includes('..') && !p.startsWith('/'), 'Path must not contain traversal characters'),
      content: z.string().min(5, 'File content cannot be empty').max(500000, 'File content exceeds size limit (500KB)'),
      description: z.string().optional(),
    })
  ).min(1, 'Bundle must contain at least one source file'),
  mainFile: z.string(),
  usageDocs: z.string().min(5, 'Usage documentation is required'),
  previewStates: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      props: z.record(z.string(), z.any()),
    })
  ).default([{ id: 'default', name: 'Default', description: 'Standard preview', props: {} }]),
  tags: z.array(z.string()).default([]),
});

/**
 * GET /api/admin/stats
 */
router.get('/stats', (req: AuthenticatedRequest, res) => {
  const stats = db.getStats();
  return res.json({ stats });
});

/**
 * GET /api/admin/components
 */
router.get('/components', (req: AuthenticatedRequest, res) => {
  const { status, category, accessLevel, search } = req.query;
  const components = db.listComponents({
    status: typeof status === 'string' ? (status as ComponentStatus) : undefined,
    category: typeof category === 'string' ? category : undefined,
    accessLevel: typeof accessLevel === 'string' ? (accessLevel as AccessLevel) : undefined,
    search: typeof search === 'string' ? search : undefined,
    includeDrafts: true, // Admin can view drafts and unpublished
  });
  return res.json({ components });
});

/**
 * GET /api/admin/components/:id
 */
router.get('/components/:id', (req: AuthenticatedRequest, res) => {
  const comp = db.getComponentById(req.params.id);
  if (!comp) {
    return res.status(404).json({ error: 'Component not found' });
  }
  return res.json({ component: comp });
});

/**
 * POST /api/admin/components
 * Create new component draft or published item
 */
router.post('/components', (req: AuthenticatedRequest, res) => {
  const parseResult = ComponentBundleSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Validation failed for component bundle',
      details: parseResult.error.flatten().fieldErrors,
    });
  }

  const existingSlug = db.getComponentBySlug(parseResult.data.slug, true);
  if (existingSlug) {
    return res.status(409).json({
      error: `A component with slug '${parseResult.data.slug}' already exists.`,
    });
  }

  const newComponent = db.createComponent(parseResult.data);
  return res.status(201).json({
    success: true,
    component: newComponent,
    message: `Component '${newComponent.name}' created successfully.`,
  });
});

/**
 * PUT /api/admin/components/:id
 * Update existing component
 */
router.put('/components/:id', (req: AuthenticatedRequest, res) => {
  const existing = db.getComponentById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Component not found' });
  }

  const parseResult = ComponentBundleSchema.partial().safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Validation failed for component update',
      details: parseResult.error.flatten().fieldErrors,
    });
  }

  if (parseResult.data.slug && parseResult.data.slug !== existing.slug) {
    const slugClash = db.getComponentBySlug(parseResult.data.slug, true);
    if (slugClash && slugClash.id !== existing.id) {
      return res.status(409).json({
        error: `A component with slug '${parseResult.data.slug}' already exists.`,
      });
    }
  }

  const updated = db.updateComponent(existing.id, parseResult.data);
  return res.json({
    success: true,
    component: updated,
    message: `Component '${updated?.name}' updated successfully.`,
  });
});

/**
 * POST /api/admin/components/:id/publish
 * DRAFT -> VALIDATE -> PUBLISH
 */
router.post('/components/:id/publish', (req: AuthenticatedRequest, res) => {
  const comp = db.getComponentById(req.params.id);
  if (!comp) {
    return res.status(404).json({ error: 'Component not found' });
  }

  // Validate before publishing
  if (!comp.name || !comp.slug || comp.files.length === 0 || !comp.mainFile) {
    return res.status(400).json({
      error: 'Component cannot be published: missing required fields or source files.',
    });
  }

  const published = db.setComponentStatus(comp.id, 'PUBLISHED');
  return res.json({
    success: true,
    component: published,
    message: `Component '${published?.name}' published to catalogue.`,
  });
});

/**
 * POST /api/admin/components/:id/unpublish
 * PUBLISHED -> UNPUBLISHED
 */
router.post('/components/:id/unpublish', (req: AuthenticatedRequest, res) => {
  const comp = db.getComponentById(req.params.id);
  if (!comp) {
    return res.status(404).json({ error: 'Component not found' });
  }

  const unpublished = db.setComponentStatus(comp.id, 'UNPUBLISHED');
  return res.json({
    success: true,
    component: unpublished,
    message: `Component '${unpublished?.name}' has been unpublished. It is no longer accessible publicly.`,
  });
});

/**
 * DELETE /api/admin/components/:id
 */
router.delete('/components/:id', (req: AuthenticatedRequest, res) => {
  const comp = db.getComponentById(req.params.id);
  if (!comp) {
    return res.status(404).json({ error: 'Component not found' });
  }

  db.deleteComponent(comp.id);
  return res.json({
    success: true,
    message: `Component '${comp.name}' deleted permanently.`,
  });
});

/**
 * GET /api/admin/customers
 */
router.get('/customers', (req: AuthenticatedRequest, res) => {
  const customers = db.listCustomers();
  return res.json({ customers });
});

/**
 * POST /api/admin/customers/:id/tier
 * Grant or Revoke Premium access
 */
router.post('/customers/:id/tier', (req: AuthenticatedRequest, res) => {
  const { tier } = req.body;
  if (tier !== 'free' && tier !== 'premium') {
    return res.status(400).json({ error: 'Tier must be either "free" or "premium"' });
  }

  const updatedCustomer = db.setCustomerTier(req.params.id, tier);
  if (!updatedCustomer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  return res.json({
    success: true,
    customer: updatedCustomer,
    message: `Customer tier updated to ${tier.toUpperCase()}. Changes take effect immediately.`,
  });
});

export default router;
