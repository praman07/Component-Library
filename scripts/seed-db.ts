import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel, ComponentModel } from '../server/models/index.ts';
import { db } from '../server/db.ts';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log('Connected successfully!');

  // Seed Users
  console.log('Upserting test and admin users...');
  const adminHash = await bcrypt.hash('admin123', 10);
  const freeHash = await bcrypt.hash('free123', 10);
  const proHash = await bcrypt.hash('premium123', 10);

  const users = [
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
  ];

  for (const u of users) {
    await UserModel.findOneAndUpdate(
      { email: u.email },
      u,
      { upsert: true, new: true }
    );
  }
  console.log(`✓ Seeded ${users.length} users.`);

  // Seed Components
  const components = db.listComponents({ includeDrafts: true });
  console.log(`Upserting ${components.length} components from registry into MongoDB Atlas...`);

  for (const comp of components) {
    await ComponentModel.findOneAndUpdate(
      { slug: comp.slug },
      {
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
      },
      { upsert: true, new: true }
    );
  }

  const uCount = await UserModel.countDocuments();
  const cCount = await ComponentModel.countDocuments();
  console.log(`✓ Successfully seeded MongoDB Atlas: ${uCount} Users, ${cCount} Components.`);
  await mongoose.disconnect();
  console.log('MongoDB connection closed.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
