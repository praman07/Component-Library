/**
 * Tech Inject Design Library — Core Types for Serverless API
 */

export type UserRole = 'admin' | 'customer';
export type CustomerTier = 'free' | 'premium';
export type AccessLevel = 'FREE' | 'PREMIUM';
export type ComponentStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';

export type ComponentCategory =
  | 'primitives'
  | 'forms'
  | 'data-display'
  | 'feedback'
  | 'navigation'
  | 'overlays';

export interface SourceFile {
  path: string;
  content: string;
  description?: string;
}

export interface PropSchemaItem {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
}

export interface PreviewStateItem {
  id: string;
  name: string;
  description: string;
  props: Record<string, any>;
}

export interface ComponentRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ComponentCategory;
  version: string;
  accessLevel: AccessLevel;
  status: ComponentStatus;
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  propsSchema: PropSchemaItem[];
  files: SourceFile[];
  mainFile: string;
  usageDocs: string;
  previewStates: PreviewStateItem[];
  staticThumbnail?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface ComponentSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ComponentCategory;
  version: string;
  accessLevel: AccessLevel;
  status: ComponentStatus;
  tags: string[];
  dependenciesCount: number;
  filesCount: number;
  publishedAt?: string | null;
  updatedAt: string;
}

export interface CustomerUser {
  id: string;
  email: string;
  role: UserRole;
  tier: CustomerTier;
  createdAt: string;
  updatedAt?: string;
}
