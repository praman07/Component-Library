import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// --- User Schema ---
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'customer';
  premiumAccess: boolean;
  tier: 'free' | 'premium';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
    premiumAccess: { type: Boolean, default: false },
    tier: { type: String, enum: ['free', 'premium'], default: 'free' },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// --- Session Schema ---
export interface ISession extends Document {
  _id: mongoose.Types.ObjectId;
  token: string;
  userId: string;
  email: string;
  role: 'admin' | 'customer';
  tier: 'free' | 'premium';
  expiresAt: Date;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
    tier: { type: String, enum: ['free', 'premium'], default: 'free' },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  },
  { timestamps: true }
);

export const SessionModel = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);

// --- Component Schema ---
export interface IComponent extends Document {
  _id: mongoose.Types.ObjectId;
  componentId: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  version: string;
  accessLevel: 'FREE' | 'PREMIUM';
  status: 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  propsSchema: Array<{
    name: string;
    type: string;
    required: boolean;
    default?: string;
    description: string;
  }>;
  files: Array<{
    path: string;
    content: string;
    description?: string;
  }>;
  mainFile: string;
  usageDocs: string;
  previewStates: Array<{
    id: string;
    name: string;
    description: string;
    props: Record<string, any>;
  }>;
  bundleReference?: string;
  staticThumbnail?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
}

const ComponentSchema = new Schema<IComponent>(
  {
    componentId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    version: { type: String, required: true },
    accessLevel: { type: String, enum: ['FREE', 'PREMIUM'], required: true, index: true },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'UNPUBLISHED'], required: true, index: true },
    dependencies: { type: Map, of: String, default: {} },
    devDependencies: { type: Map, of: String, default: {} },
    peerDependencies: { type: Map, of: String, default: {} },
    propsSchema: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
        required: { type: Boolean, default: false },
        default: { type: String },
        description: { type: String, required: true },
      },
    ],
    files: [
      {
        path: { type: String, required: true },
        content: { type: String, required: true },
        description: { type: String },
      },
    ],
    mainFile: { type: String, required: true },
    usageDocs: { type: String, required: true },
    previewStates: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String },
        props: { type: Schema.Types.Mixed, default: {} },
      },
    ],
    bundleReference: { type: String },
    staticThumbnail: { type: String },
    tags: [{ type: String }],
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const ComponentModel = mongoose.models.Component || mongoose.model<IComponent>('Component', ComponentSchema);
