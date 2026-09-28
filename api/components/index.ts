import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../server/db';
import { extractAuthUser } from '../../server/auth';
import { connectMongo, isMongoActive } from '../../server/mongodb';
import { ComponentModel } from '../../server/models';
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
  try {
    await runMiddleware(req, res, extractAuthUser);

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    await connectMongo();

    const { category, accessLevel, search } = req.query;

    if (isMongoActive()) {
      const query: any = { status: 'PUBLISHED' };
      if (category && category !== 'all') {
        query.category = category;
      }
      if (accessLevel) {
        query.accessLevel = accessLevel;
      }
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
  } catch (err: any) {
    console.error('Error in /api/components handler:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
