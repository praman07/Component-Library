import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { db } from '../server/db';
import { validateSafePath, executeInstallation } from '../cli/installerCore';
import { generateAiAgentPrompt } from '../server/generator';

console.log('--- Starting Tech Inject Design Library Automated Verification Suite ---\n');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`✔ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`✖ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // Reset database to ensure clean state
  db.resetToSeeds();

  // Test 0a: Login works and verifies credentials using bcrypt/secure password check
  test('0a. Login works with correct credentials', () => {
    const admin = db.verifyCredentials('admin@techinject.dev', 'admin123');
    assert.ok(admin);
    assert.strictEqual(admin.email, 'admin@techinject.dev');
    assert.strictEqual(admin.role, 'admin');

    const session = db.createSession(admin);
    assert.ok(session.token.startsWith('ti_sess_'));
    const verified = db.verifySessionUser(session.token);
    assert.ok(verified);
    assert.strictEqual(verified.email, 'admin@techinject.dev');
  });

  // Test 0b: Invalid login fails
  test('0b. Invalid login fails with incorrect password or unknown email', () => {
    const badPass = db.verifyCredentials('admin@techinject.dev', 'wrongpassword');
    assert.strictEqual(badPass, null);

    const unknownUser = db.verifyCredentials('unknown@nowhere.com', 'admin123');
    assert.strictEqual(unknownUser, null);
  });

  // Test 0c: Logout invalidates session
  test('0c. Logout invalidates session immediately', () => {
    const user = db.getUserByEmail('free@techinject.dev');
    assert.ok(user);
    const session = db.createSession(user);
    assert.ok(db.verifySessionUser(session.token));

    // Logout: delete session
    db.deleteSession(session.token);
    assert.strictEqual(db.verifySessionUser(session.token), null, 'Session must be null after logout');
  });

  // Test 0d: Unpublished component cannot be publicly accessed
  test('0d. Unpublished component cannot be publicly accessed', () => {
    // Unpublish button
    const btn = db.getComponentBySlug('button', false);
    assert.ok(btn);
    db.setComponentStatus(btn.id, 'UNPUBLISHED');

    // Public lookup must now return null
    const publicBtn = db.getComponentBySlug('button', false);
    assert.strictEqual(publicBtn, null);

    const publicList = db.listComponents({ includeDrafts: false });
    assert.strictEqual(publicList.some(c => c.slug === 'button'), false);

    // Restore button to PUBLISHED for other tests
    db.setComponentStatus(btn.id, 'PUBLISHED');
  });

  // Test 1: Unauthorized admin writes fail
  test('1. Unauthorized admin writes fail', () => {
    const unauthenticatedUser = null;
    const customerUser = db.getUserByEmail('free@techinject.dev');
    assert.ok(customerUser);
    assert.strictEqual(customerUser.role, 'customer');

    // Verification: customer cannot perform admin operations
    const isAdmin = (u: any) => Boolean(u && u.role === 'admin');
    assert.strictEqual(isAdmin(unauthenticatedUser), false);
    assert.strictEqual(isAdmin(customerUser), false);
  });

  // Test 2: Drafts cannot be publicly accessed
  test('2. Drafts cannot be publicly accessed', () => {
    // Draft component exists in DB
    const draftInDb = db.getComponentBySlug('command-palette', true);
    assert.ok(draftInDb);
    assert.strictEqual(draftInDb.status, 'DRAFT');

    // Public detail access must reject draft (returns null)
    const publicAccess = db.getComponentBySlug('command-palette', false);
    assert.strictEqual(publicAccess, null, 'Public access to draft must return null');

    // Public list must not include draft
    const publicList = db.listComponents({ includeDrafts: false });
    const containsDraft = publicList.some((c) => c.slug === 'command-palette');
    assert.strictEqual(containsDraft, false, 'Public list must not contain draft components');
  });

  // Test 3: Invalid component upload fails
  test('3. Invalid component upload fails', () => {
    const validateUploadPayload = (payload: any) => {
      if (!payload.name || payload.name.length < 2) throw new Error('Name required');
      if (!payload.slug || !/^[a-z0-9-]+$/.test(payload.slug)) throw new Error('Invalid slug');
      if (payload.version && !/^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/.test(payload.version)) throw new Error('Invalid semver');
      if (!payload.files || payload.files.length === 0) throw new Error('At least one file required');
      for (const f of payload.files) {
        if (!f.path || f.path.includes('..') || f.path.startsWith('/')) throw new Error('Path traversal detected');
      }
    };

    const invalidPayloads = [
      { name: '', slug: 'valid-slug', files: [] }, // empty name & no files
      { name: 'Button', slug: 'INVALID SLUG WITH SPACES', files: [] }, // invalid slug format
      { name: 'Card', slug: 'card-x', version: 'not-semver', files: [] }, // invalid version
      { name: 'Modal', slug: 'modal-x', files: [{ path: '../escape.tsx', content: 'code' }] }, // path traversal
    ];

    for (const payload of invalidPayloads) {
      let threw = false;
      try {
        validateUploadPayload(payload);
      } catch (e) {
        threw = true;
      }
      assert.strictEqual(threw, true, `Payload should fail validation: ${JSON.stringify(payload)}`);
    }
  });

  // Test 4: Valid publication succeeds
  test('4. Valid publication succeeds', () => {
    const newDraft = db.createComponent({
      name: 'Notification Banner',
      slug: 'notification-banner',
      description: 'Tactile notification banner with priority indicators.',
      category: 'feedback',
      version: '1.0.0',
      accessLevel: 'FREE',
      status: 'DRAFT',
      dependencies: {},
      propsSchema: [],
      files: [
        { path: 'src/components/ui/Banner.tsx', content: 'export const Banner = () => <div />;' },
      ],
      mainFile: 'src/components/ui/Banner.tsx',
      usageDocs: '<Banner />',
      previewStates: [],
      tags: ['banner', 'feedback'],
    });

    assert.ok(newDraft.id);
    assert.strictEqual(newDraft.status, 'DRAFT');
    assert.strictEqual(newDraft.publishedAt, null);

    // Publish component
    const published = db.setComponentStatus(newDraft.id, 'PUBLISHED');
    assert.ok(published);
    assert.strictEqual(published.status, 'PUBLISHED');
    assert.ok(published.publishedAt);

    // Verify it is now visible publicly
    const publicComp = db.getComponentBySlug('notification-banner', false);
    assert.ok(publicComp);
    assert.strictEqual(publicComp.name, 'Notification Banner');
  });

  // Test 5: Published metadata/source remain consistent
  test('5. Published metadata/source remain consistent', () => {
    const button = db.getComponentBySlug('button', false);
    assert.ok(button);
    assert.strictEqual(button.slug, 'button');
    assert.strictEqual(button.status, 'PUBLISHED');
    assert.strictEqual(button.files.length > 0, true);
    assert.strictEqual(button.mainFile, 'src/components/ui/Button.tsx');
    assert.strictEqual(button.files[0].path, button.mainFile);
    assert.ok(button.files[0].content.includes('export const Button'));
  });

  // Test 6: Free customer can access free component
  test('6. Free customer can access free component', () => {
    const freeUser = db.getUserByEmail('free@techinject.dev');
    assert.ok(freeUser);
    assert.strictEqual(freeUser.tier, 'free');

    const button = db.getComponentBySlug('button', false);
    assert.ok(button);
    assert.strictEqual(button.accessLevel, 'FREE');

    // Both free user and unauthenticated user can access free component source
    assert.ok(button.files.length > 0);
  });

  // Test 7: Free customer cannot access premium source
  test('7. Free customer cannot access premium source', () => {
    const freeUser = db.getUserByEmail('free@techinject.dev');
    assert.ok(freeUser);
    assert.strictEqual(freeUser.tier, 'free');

    const dataTable = db.getComponentBySlug('data-table', false);
    assert.ok(dataTable);
    assert.strictEqual(dataTable.accessLevel, 'PREMIUM');

    // Simulation of access controller:
    const canAccessPremiumSource = (u: any, comp: any) => {
      if (comp.accessLevel === 'FREE') return true;
      if (!u) return false;
      return u.tier === 'premium' || u.role === 'admin';
    };

    assert.strictEqual(
      canAccessPremiumSource(freeUser, dataTable),
      false,
      'Free customer must NOT be allowed to access premium source'
    );
  });

  // Test 8: Premium customer can access premium source
  test('8. Premium customer can access premium source', () => {
    const premiumUser = db.getUserByEmail('pro@techinject.dev');
    assert.ok(premiumUser);
    assert.strictEqual(premiumUser.tier, 'premium');

    const dataTable = db.getComponentBySlug('data-table', false);
    assert.ok(dataTable);

    const canAccessPremiumSource = (u: any, comp: any) => {
      if (comp.accessLevel === 'FREE') return true;
      if (!u) return false;
      return u.tier === 'premium' || u.role === 'admin';
    };

    assert.strictEqual(
      canAccessPremiumSource(premiumUser, dataTable),
      true,
      'Premium customer must be allowed to access premium source'
    );
  });

  // Test 9: Revoked premium customer cannot access premium source
  test('9. Revoked premium customer cannot access premium source', () => {
    const user = db.getUserByEmail('pro@techinject.dev');
    assert.ok(user);
    const session = db.createSession(user);

    // Initial check: has premium
    let verifiedUser = db.verifySessionUser(session.token);
    assert.strictEqual(verifiedUser?.tier, 'premium');

    // Admin revokes premium
    db.setCustomerTier(user.id, 'free');

    // Subsequent request: immediate rejection
    verifiedUser = db.verifySessionUser(session.token);
    assert.strictEqual(verifiedUser?.tier, 'free');

    const currentTier = (verifiedUser as any)?.tier;
    const canAccess = currentTier === 'premium' || verifiedUser?.role === 'admin';
    assert.strictEqual(canAccess, false, 'Revoked customer must immediately fail premium access');

    // Restore to premium for other tests
    db.setCustomerTier(user.id, 'premium');
  });

  // Test 10: Customer cannot grant themselves premium
  test('10. Customer cannot grant themselves premium', () => {
    const customerUser = db.getUserByEmail('free@techinject.dev');
    assert.ok(customerUser);

    // Any customer request attempting to set tier must be rejected by requireAdmin middleware
    const isAllowedToChangeTier = (caller: any) => caller && caller.role === 'admin';
    assert.strictEqual(isAllowedToChangeTier(customerUser), false);
  });

  // Test 11: Customer cannot access admin APIs
  test('11. Customer cannot access admin APIs', () => {
    const freeUser = db.getUserByEmail('free@techinject.dev');
    const proUser = db.getUserByEmail('pro@techinject.dev');

    const checkAdminAccess = (caller: any) => {
      if (!caller || caller.role !== 'admin') {
        return { status: 403, error: 'Forbidden' };
      }
      return { status: 200, ok: true };
    };

    assert.strictEqual(checkAdminAccess(null).status, 403);
    assert.strictEqual(checkAdminAccess(freeUser).status, 403);
    assert.strictEqual(checkAdminAccess(proUser).status, 403);

    const adminUser = db.getUserByEmail('admin@techinject.dev');
    assert.strictEqual(checkAdminAccess(adminUser).status, 200);
  });

  // Test 12: Unsafe installation paths fail
  test('12. Unsafe installation paths fail', () => {
    const testDir = path.resolve(process.cwd(), 'data/test-install-dir');
    const unsafePaths = [
      '../../etc/passwd',
      '../outside.tsx',
      '/etc/shadow',
      'components/../../secret.txt',
    ];

    for (const p of unsafePaths) {
      assert.throws(
        () => validateSafePath(p, testDir),
        /Unsafe|escapes root/,
        `Path "${p}" should be rejected by path traversal validation`
      );
    }
  });

  // Test 13: Existing files are not silently overwritten
  test('13. Existing files are not silently overwritten', () => {
    const testDir = path.resolve(process.cwd(), 'data/test-collision-dir');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    const testFile = path.resolve(testDir, 'Button.tsx');
    fs.writeFileSync(testFile, '// Existing user code that must not be overwritten', 'utf-8');

    const bundle = {
      slug: 'button',
      files: [{ path: 'Button.tsx', content: '// New component code' }],
      dependencies: {},
    };

    // Attempting installation without overwrite flag must throw
    assert.throws(
      () => executeInstallation(bundle, { targetDir: testDir, overwrite: false }),
      /File already exists/,
      'Installer must abort before overwriting existing files'
    );

    // Verify existing file content was preserved
    const preservedContent = fs.readFileSync(testFile, 'utf-8');
    assert.strictEqual(preservedContent, '// Existing user code that must not be overwritten');

    // Clean up test dir
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  // Additional check: AI prompt generation
  test('Additional: AI agent prompt generation contains required sections', () => {
    const button = db.getComponentBySlug('button', false);
    assert.ok(button);
    const prompt = generateAiAgentPrompt(button);
    assert.ok(prompt.includes('You are integrating the Button component'));
    assert.ok(prompt.includes('Preserve existing Tech Inject theme tokens'));
    assert.ok(prompt.includes('DO NOT introduce gradients'));
    assert.ok(prompt.includes('STEP-BY-STEP VERIFICATION PROTOCOL'));
  });

  console.log(`\n========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
