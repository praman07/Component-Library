import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel, SessionModel, ComponentModel } from './models';
import { db as fallbackDb } from './db';

/**
 * MongoDB Atlas Connection and Lifecycle Manager.
 * Connects to MongoDB when MONGODB_URI is provided.
 * Seeds initial admin and test users with bcrypt hashes if not already present.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectMongo(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return false;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return true;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 1500,
    };

    cached.promise = Promise.race([
      mongoose.connect(uri, opts).then(async (mongooseInstance) => {
        try {
          await seedMongoIfEmpty();
        } catch (err: any) {
          // Non-fatal
        }
        return mongooseInstance;
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1800)),
    ]).catch((err) => {
      cached.promise = null;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
    return !!cached.conn;
  } catch (e) {
    cached.promise = null;
    return false;
  }
}

export function isMongoActive(): boolean {
  return !!cached?.conn && mongoose.connection.readyState === 1;
}

/**
 * Seeds initial users and components into MongoDB Atlas if collection is empty
 */
async function seedMongoIfEmpty() {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('[MongoDB Atlas] Seeding initial test users with bcrypt password hashes...');
      
      const adminHash = await bcrypt.hash('admin123', 10);
      const freeHash = await bcrypt.hash('free123', 10);
      const proHash = await bcrypt.hash('premium123', 10);

      await UserModel.create([
        {
          userId: 'usr_admin_01',
          email: 'admin@techinject.dev',
          passwordHash: adminHash,
          role: 'admin',
          premiumAccess: true,
          tier: 'premium',
        },
        {
          userId: 'usr_free_02',
          email: 'free@techinject.dev',
          passwordHash: freeHash,
          role: 'customer',
          premiumAccess: false,
          tier: 'free',
        },
        {
          userId: 'usr_premium_03',
          email: 'pro@techinject.dev',
          passwordHash: proHash,
          role: 'customer',
          premiumAccess: true,
          tier: 'premium',
        },
      ]);
    }

    const compCount = await ComponentModel.countDocuments();
    if (compCount === 0) {
      console.log('[MongoDB Atlas] Seeding initial components from registry...');
      const localComps = fallbackDb.listComponents({ includeDrafts: true });
      for (const comp of localComps) {
        await ComponentModel.create({
          componentId: comp.id,
          name: comp.name,
          slug: comp.slug,
          description: comp.description,
          category: comp.category,
          version: comp.version,
          accessLevel: comp.accessLevel,
          status: comp.status,
          dependencies: comp.dependencies,
          devDependencies: comp.devDependencies || {},
          propsSchema: comp.propsSchema,
          files: comp.files,
          mainFile: comp.mainFile,
          usageDocs: comp.usageDocs,
          previewStates: comp.previewStates,
          tags: comp.tags,
          publishedAt: comp.publishedAt ? new Date(comp.publishedAt) : null,
        });
      }
    }
  } catch (err: any) {
    console.error('[MongoDB Atlas] Error during seeding:', err.message);
  }
}
