import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import {
  HARDCODED_COMPONENTS,
  HARDCODED_USERS,
  parseAuth,
  getComponentsList,
  getComponentById,
  getComponentBySlug,
  updateComponentStatus,
  createNewComponent,
  updateComponentData,
  deleteComponentById,
} from '../serverlessStore';

const ComponentBundleSchema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10).max(400),
  category: z.enum(['primitives', 'forms', 'data-display', 'feedback', 'navigation', 'overlays']),
  version: z.string().regex(/^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/),
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
      path: z.string().refine((p) => !p.includes('..') && !p.startsWith('/')),
      content: z.string().min(5).max(500000),
      description: z.string().optional(),
    })
  ).min(1),
  mainFile: z.string(),
  usageDocs: z.string().min(5),
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const auth = parseAuth(req);

    if (!auth.user || auth.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Administrator privileges required',
        code: 'FORBIDDEN',
      });
    }

    const { path } = req.query;
    const pathParts = Array.isArray(path) ? path : (path ? [path] : []);
    const [subResource, id, action] = pathParts;

    // GET /api/admin/stats
    if (subResource === 'stats' && req.method === 'GET') {
      const allComps = getComponentsList({ includeDrafts: true });
      const total = allComps.length;
      const pub = allComps.filter((c) => c.status === 'PUBLISHED').length;
      const prem = allComps.filter((c) => c.accessLevel === 'PREMIUM').length;
      return res.status(200).json({
        stats: {
          totalComponents: total,
          publishedCount: pub,
          draftCount: total - pub,
          premiumCount: prem,
          freeCount: total - prem,
          customerCount: HARDCODED_USERS.filter((u) => u.role === 'customer').length,
          premiumCustomerCount: HARDCODED_USERS.filter((u) => u.tier === 'premium').length,
        },
      });
    }

    // /api/admin/customers
    if (subResource === 'customers') {
      if (req.method === 'GET') {
        const custs = HARDCODED_USERS.filter((u) => u.role === 'customer');
        return res.status(200).json({ customers: custs });
      }
      if (action === 'tier' && req.method === 'POST') {
        const { tier } = req.body || {};
        if (tier !== 'free' && tier !== 'premium') {
          return res.status(400).json({ error: "Invalid tier. Must be 'free' or 'premium'." });
        }
        const found = HARDCODED_USERS.find((u) => u.id === id);
        if (!found) return res.status(404).json({ error: 'Customer not found' });
        found.tier = tier;
        return res.status(200).json({
          customer: found,
          message: `Customer tier updated to '${tier}'`,
        });
      }
    }

    // /api/admin/components
    if (subResource === 'components') {
      if (!id && req.method === 'GET') {
        const { status } = req.query;
        let list = getComponentsList({ includeDrafts: true });
        if (status && typeof status === 'string') {
          list = list.filter((c) => c.status === status);
        }
        return res.status(200).json({ components: list });
      }

      if (!id && req.method === 'POST') {
        const parsed = ComponentBundleSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(422).json({
            error: 'Validation failed for component bundle',
            issues: parsed.error.issues,
          });
        }
        const existing = getComponentBySlug(parsed.data.slug, true);
        if (existing) {
          return res.status(409).json({ error: `Component with slug '${parsed.data.slug}' already exists` });
        }
        const created = createNewComponent(parsed.data);
        return res.status(201).json({ component: created, message: 'Component created successfully' });
      }

      if (id && req.method === 'GET') {
        const comp = getComponentById(id);
        if (!comp) return res.status(404).json({ error: 'Component not found' });
        return res.status(200).json({ component: comp });
      }

      if (id && action === 'publish' && req.method === 'POST') {
        const updated = updateComponentStatus(id, 'PUBLISHED');
        if (!updated) return res.status(404).json({ error: 'Component not found' });
        return res.status(200).json({ component: updated, message: `Component '${updated.name}' published to catalogue.` });
      }

      if (id && action === 'unpublish' && req.method === 'POST') {
        const updated = updateComponentStatus(id, 'UNPUBLISHED');
        if (!updated) return res.status(404).json({ error: 'Component not found' });
        return res.status(200).json({ component: updated, message: `Component '${updated.name}' unpublished.` });
      }

      if (id && action === 'status' && req.method === 'PATCH') {
        const { status } = req.body || {};
        if (!['DRAFT', 'PUBLISHED', 'UNPUBLISHED'].includes(status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }
        const updated = updateComponentStatus(id, status);
        if (!updated) return res.status(404).json({ error: 'Component not found' });
        return res.status(200).json({ component: updated, message: `Status updated to ${status}` });
      }

      if (id && req.method === 'PUT') {
        const parsed = ComponentBundleSchema.partial().safeParse(req.body);
        if (!parsed.success) {
          return res.status(422).json({ error: 'Validation failed', issues: parsed.error.issues });
        }
        const updated = updateComponentData(id, parsed.data);
        if (!updated) return res.status(404).json({ error: 'Component not found' });
        return res.status(200).json({ component: updated, message: 'Component updated successfully' });
      }

      if (id && req.method === 'DELETE') {
        const deleted = deleteComponentById(id);
        if (!deleted) return res.status(404).json({ error: 'Component not found' });
        return res.status(200).json({ success: true, message: 'Component deleted' });
      }
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err: any) {
    console.error('Error in /api/admin/[...path] handler:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
