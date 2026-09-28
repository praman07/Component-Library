import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getComponentsList } from '../serverlessStore';
import { ComponentSummary } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
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
  } catch (err: any) {
    console.error('Error in /api/components handler:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
