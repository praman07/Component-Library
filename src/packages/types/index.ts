/**
 * Tech Inject Design Library — Core Types
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

/**
 * Public component summary returned in catalogue listings.
 * Never includes protected source files.
 */
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

/**
 * Public component detail when user DOES NOT have premium access to a premium component.
 * Excludes source code, bundle files, and install endpoint data.
 */
export interface ComponentDetailLocked {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ComponentCategory;
  version: string;
  accessLevel: AccessLevel;
  status: ComponentStatus;
  tags: string[];
  dependencies: Record<string, string>;
  propsSchema: PropSchemaItem[];
  isLocked: true;
  lockReason: 'SIGN_IN_REQUIRED' | 'PREMIUM_REQUIRED';
  staticThumbnail?: string;
  updatedAt: string;
  publishedAt?: string | null;
}

/**
 * Full component detail when user has authorized access (Free component or Premium subscriber).
 */
export interface ComponentDetailUnlocked {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ComponentCategory;
  version: string;
  accessLevel: AccessLevel;
  status: ComponentStatus;
  tags: string[];
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
  propsSchema: PropSchemaItem[];
  files: SourceFile[];
  mainFile: string;
  usageDocs: string;
  previewStates: PreviewStateItem[];
  isLocked: false;
  installCommand: string;
  aiAgentPrompt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export type ComponentDetailResponse = ComponentDetailLocked | ComponentDetailUnlocked;

export interface CustomerUser {
  id: string;
  email: string;
  role: UserRole;
  tier: CustomerTier;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  token: string;
  userId: string;
  email: string;
  role: UserRole;
  tier: CustomerTier;
  expiresAt: string;
}

export interface AdminStats {
  totalComponents: number;
  publishedCount: number;
  draftCount: number;
  premiumCount: number;
  freeCount: number;
  customerCount: number;
  premiumCustomerCount: number;
}
