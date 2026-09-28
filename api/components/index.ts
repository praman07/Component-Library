import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../server/db';
import { extractAuthUser, AuthenticatedRequest } from '../../server/auth';
import { ComponentSummary, AccessLevel } from '../../src/packages/types';

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
  await runMiddleware(req, res, extractAuthUser);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category, accessLevel, search } = req.query;
  const components = db.listComponents({
    category: typeof category === 'string' ? category : undefined,
    accessLevel: typeof accessLevel === 'string' ? (accessLevel as AccessLevel) : undefined,
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
    dependenciesCount: Object.keys(c.dependencies).length,
    filesCount: c.files.length,
    publishedAt: c.publishedAt,
    updatedAt: c.updatedAt,
  }));

  return res.status(200).json({ components: summaries });
}
