import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HARDCODED_COMPONENTS, HARDCODED_USERS, HARDCODED_CREDENTIALS } from '../server/hardcodedData';
import { ComponentRecord, ComponentSummary, CustomerUser, AccessLevel } from '../src/packages/types';
import { generateAiAgentPrompt } from '../server/generator';

// In-memory sessions store for serverless execution
const inMemorySessions: Map<string, { user: CustomerUser; expiresAt: number }> = new Map();

// Helper to seed initial sessions
for (const u of HARDCODED_USERS) {
  inMemorySessions.set(`ti_sess_${u.id}`, {
    user: u,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });
}

export interface AuthContext {
  user: CustomerUser | null;
  authToken: string | null;
}

export function parseAuth(req: VercelRequest): AuthContext {
  const authHeader = req.headers.authorization;
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';');
    for (const c of cookies) {
      const [key, val] = c.trim().split('=');
      if (key === 'ti_session' && val) {
        token = val;
        break;
      }
    }
  }

  if (!token) {
    return { user: null, authToken: null };
  }

  // Check in-memory sessions
  const sess = inMemorySessions.get(token);
  if (sess && sess.expiresAt > Date.now()) {
    return { user: sess.user, authToken: token };
  }

  // Check token patterns
  for (const u of HARDCODED_USERS) {
    if (token.includes(u.id)) {
      return { user: u, authToken: token };
    }
  }

  return { user: null, authToken: null };
}

export function createSessionToken(user: CustomerUser): string {
  const token = `ti_sess_${user.id}_${Date.now()}`;
  inMemorySessions.set(token, {
    user,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  return token;
}

export function removeSessionToken(token: string) {
  inMemorySessions.delete(token);
}

// In-memory component overrides for dynamic admin edits in serverless runtime
let dynamicComponents: ComponentRecord[] = [...HARDCODED_COMPONENTS];

export function getComponentsList(options?: {
  category?: string;
  accessLevel?: AccessLevel;
  search?: string;
  includeDrafts?: boolean;
}): ComponentRecord[] {
  let list = dynamicComponents;
  if (!options?.includeDrafts) {
    list = list.filter((c) => c.status === 'PUBLISHED');
  }
  if (options?.category && options.category !== 'all') {
    list = list.filter((c) => c.category === options.category);
  }
  if (options?.accessLevel) {
    list = list.filter((c) => c.accessLevel === options.accessLevel);
  }
  if (options?.search && typeof options.search === 'string') {
    const q = options.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
    );
  }
  return list;
}

export function getComponentBySlug(slug: string, includeDrafts = false): ComponentRecord | null {
  const comp = dynamicComponents.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
  if (!comp) return null;
  if (!includeDrafts && comp.status !== 'PUBLISHED') return null;
  return comp;
}

export function getComponentById(id: string): ComponentRecord | null {
  return dynamicComponents.find((c) => c.id === id || c.slug === id) || null;
}

export function updateComponentStatus(id: string, status: 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED'): ComponentRecord | null {
  const comp = dynamicComponents.find((c) => c.id === id || c.slug === id);
  if (!comp) return null;
  comp.status = status;
  if (status === 'PUBLISHED' && !comp.publishedAt) {
    comp.publishedAt = new Date().toISOString();
  }
  comp.updatedAt = new Date().toISOString();
  return comp;
}

export function createNewComponent(data: any): ComponentRecord {
  const newComp: ComponentRecord = {
    id: `cmp_${data.slug.replace(/-/g, '_')}_${Date.now().toString(36)}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: data.status === 'PUBLISHED' ? new Date().toISOString() : null,
  };
  dynamicComponents.unshift(newComp);
  return newComp;
}

export function updateComponentData(id: string, data: any): ComponentRecord | null {
  const idx = dynamicComponents.findIndex((c) => c.id === id || c.slug === id);
  if (idx === -1) return null;
  dynamicComponents[idx] = {
    ...dynamicComponents[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return dynamicComponents[idx];
}

export function deleteComponentById(id: string): boolean {
  const initialLen = dynamicComponents.length;
  dynamicComponents = dynamicComponents.filter((c) => c.id !== id && c.slug !== id);
  return dynamicComponents.length < initialLen;
}

export { HARDCODED_COMPONENTS, HARDCODED_USERS, HARDCODED_CREDENTIALS, generateAiAgentPrompt };
