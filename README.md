# Tech Inject Design Library

> A high-performance, developer-first React and TypeScript component library with a public catalogue, server-side verified access control, admin publishing workflow, zero-gradient monochrome design system, and automated CLI installer.

---

## ⚡ Quick Start

For detailed step-by-step instructions, see **[HOW_TO_RUN.md](file:///c:/Users/HomePC/Documents/tech-inject-design-library/HOW_TO_RUN.md)**.

```bash
# 1. Install dependencies
bun install   # or: npm install

# 2. Start the development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

---

## 1. Project Overview

Tech Inject Design Library is a component distribution platform and documentation product built with strict adherence to a tactile, solid monochrome palette (`#090909` canvas, `#111111` surfaces, `#262626` borders, pure `#FFFFFF` for primary focus).

### Core Capabilities:
- **Public Component Catalogue**: Searchable catalogue with responsive previews (100% desktop, 768px tablet, 375px mobile), real interactive state switches (hover, focus, disabled, loading), TypeScript props contracts, and syntax-highlighted source code.
- **Server-Protected Admin Console**: Comprehensive dashboard for publishing workflows (`DRAFT -> VALIDATE -> PUBLISH`), component editing, bundle uploads with Zod schema validation, and customer tier management.
- **Dynamic Access Control Matrix**: Public free tier components vs subscriber-locked premium components. Source code, bundle downloads, CLI installer endpoints, and AI agent prompts are secured strictly server-side (returning `403 Forbidden`).
- **Immediate Tier Revocation**: Revoking premium access immediately invalidates protected requests on active sessions.
- **Standalone CLI Installer**: `npx tech-inject add <slug>` with path traversal guards and overwrite protection.
- **AI Coding Agent Integration**: Dynamic prompts generated from component props, dependencies, files, and token constraints for tools like Cursor, Claude, and ChatGPT.

---

## 2. Architecture

```
/
├── apps/
│   ├── catalogue/          # Public documentation and discovery experience
│   │   ├── HomePage.tsx
│   │   ├── ComponentsPage.tsx
│   │   ├── ComponentDetailPage.tsx
│   │   ├── DocsGettingStartedPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── AccountPage.tsx
│   ├── admin/              # Server-protected administrator suite
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminComponentsList.tsx
│   │   ├── AdminComponentEditor.tsx
│   │   └── AdminCustomers.tsx
│   └── shared/             # AuthContext, Navbar, Footer, Providers
├── packages/
│   ├── types/              # Unified TypeScript definitions
│   ├── config/             # Strict monochrome theme tokens and CSS variables
│   ├── ui/                 # 22 Reusable design system primitives
│   └── reference-components/ # Live preview renderers and reference implementations
├── server/
│   ├── db.ts               # Persistent database engine with atomic file writes
│   ├── auth.ts             # Session extraction, role, and premium access middleware
│   ├── generator.ts        # AI coding agent prompt generator
│   └── routes/             # REST API controllers (auth, components, admin)
├── cli/
│   ├── tech-inject.cjs     # Standalone CLI installer executable
│   └── installerCore.ts    # Secure file extraction and path validator
├── tests/
│   └── security-and-flows.test.ts # 14 Automated verification tests
├── data/
│   └── database.json       # Atomic persistent file database
└── server.ts               # Express full-stack entry point + Vite middleware
```

---

## 3. Environment Variables

Defined in `.env.example`:

```bash
# Application Port (defaults to 3000)
PORT=3000

# Environment Mode (development or production)
NODE_ENV=production

# MongoDB Atlas Connection URI (optional: falls back to persistent file store if omitted)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/tech-inject?retryWrites=true&w=majority"

# Session Security Secret
SESSION_SECRET="your-secure-random-session-secret"

# Public Application URL
APP_URL="http://localhost:3000"

# CLI API Endpoint
TECH_INJECT_API_URL="http://localhost:3000"
```

No secrets or admin tokens are exposed in client-side JavaScript.

---

## 4. Database & Storage Architecture

- **Primary Persistence (MongoDB Atlas)**:
  - Models for `User`, `Session`, and `Component` (`server/models/index.ts`).
  - Passwords hashed using `bcrypt` (10 rounds).
  - Automatically seeds default administrator and demo customer accounts on cold start.
- **Fallback Persistence**: Transparent persistent JSON store (`data/database.json`) when `MONGODB_URI` is not configured.
- **Storage Abstraction (`server/storage.ts`)**:
  - Implements `upload()`, `download()`, `delete()`, and `exists()`.
  - Safely abstracts component source file storage for ephemeral serverless and containerized runtimes.

---

## 5. Deployment & Runtime

- **Development**:
  ```bash
  npm run dev
  ```
  Runs `tsx server.ts` with Express and attaches Vite in middleware mode.
- **Production Build**:
  ```bash
  npm run build
  ```
  Generates production-optimized SPA assets in `./dist`.
- **Production Start**:
  ```bash
  npm start
  ```
  Runs Express serving precompiled static assets with SPA route fallbacks.

---

## 6. URLs & Test Accounts

- **Catalogue URL**: `/` or `/components`
- **Documentation**: `/docs/getting-started`
- **Admin Dashboard URL**: `/admin`
- **Customer Account Page**: `/account`
- **Login / Quick Switcher**: `/login`

### Pre-Seeded Test Credentials:

| Role | Email | Password | Access Tier | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@techinject.dev` | `admin123` | Unrestricted | Full admin publishing & customer tier management |
| **Free Customer** | `free@techinject.dev` | `free123` | Free | Access to all Free components, locked on Premium |
| **Premium Customer** | `pro@techinject.dev` | `premium123` | Premium | Full access to Free and Premium components |

*Note: The login page includes 1-click test credentials buttons for instant evaluation.*

---

## 7. Component Format

Components are defined with an explicit JSON/bundle schema validated with Zod:

```json
{
  "name": "Button",
  "slug": "button",
  "description": "Tactile interactive trigger in strict monochrome.",
  "category": "primitives",
  "version": "1.4.0",
  "accessLevel": "FREE",
  "status": "PUBLISHED",
  "dependencies": { "lucide-react": "^0.546.0" },
  "propsSchema": [
    { "name": "variant", "type": "string", "required": false, "description": "Visual style" }
  ],
  "files": [
    {
      "path": "src/components/ui/Button.tsx",
      "content": "export const Button = () => ...",
      "description": "Main component"
    }
  ],
  "mainFile": "src/components/ui/Button.tsx",
  "usageDocs": "import { Button } from '@/components/ui/Button';",
  "previewStates": [
    { "id": "default", "name": "Default", "description": "Primary button", "props": {} }
  ],
  "tags": ["trigger", "action"]
}
```

---

## 8. CLI Installer Usage

Run directly from any React + TypeScript project:

```bash
# 1. Install free component
node cli/tech-inject.cjs add button

# 2. Install premium component (with bearer token)
node cli/tech-inject.cjs add data-table --token="ti_sess_xxx"

# 3. Specify target directory
node cli/tech-inject.cjs add dialog --out="./src/components"

# 4. Overwrite existing files explicitly
node cli/tech-inject.cjs add card --overwrite
```

### Safety Features:
- **Path Traversal Guard**: Rejects `../`, absolute root escapes, and parent navigation.
- **Overwrite Protection**: Halts installation with an error if target files already exist, requiring `--overwrite` (`-f`) to replace.

---

## 9. AI Agent Integration

Each component detail page includes an **AI Agent** tab with a dynamically generated prompt:

```markdown
You are integrating the Button component (1.4.0) from Tech Inject Design Library.
...
REQUIRED DEPENDENCIES:
  - "lucide-react": "^0.546.0"

FILES TO CREATE / LOCATE:
  - Path: `src/components/ui/Button.tsx`

STRICT DESIGN SYSTEM RULES:
1. Preserve existing Tech Inject theme tokens (--background: #090909, --surface: #111111, --white: #FFFFFF).
2. DO NOT introduce gradients. Strictly solid monochrome colors only.
...
STEP-BY-STEP VERIFICATION PROTOCOL:
1. Verify TypeScript types: Run `npm run lint` or `tsc --noEmit`.
2. Verify dependencies.
3. Verify rendering contrast.
4. Verify responsive viewports.
```

---

## 10. Automated Tests & Verification Results

### Test Command:
```bash
npm test
```

### Actual Verification Results:
```
--- Starting Tech Inject Design Library Automated Verification Suite ---

✔ [PASS] 1. Unauthorized admin writes fail
✔ [PASS] 2. Drafts cannot be publicly accessed
✔ [PASS] 3. Invalid component upload fails
✔ [PASS] 4. Valid publication succeeds
✔ [PASS] 5. Published metadata/source remain consistent
✔ [PASS] 6. Free customer can access free component
✔ [PASS] 7. Free customer cannot access premium source
✔ [PASS] 8. Premium customer can access premium source
✔ [PASS] 9. Revoked premium customer cannot access premium source
✔ [PASS] 10. Customer cannot grant themselves premium
✔ [PASS] 11. Customer cannot access admin APIs
✔ [PASS] 12. Unsafe installation paths fail
✔ [PASS] 13. Existing files are not silently overwritten
✔ [PASS] Additional: AI agent prompt generation contains required sections

========================================
Results: 14 passed, 0 failed
========================================
```

### Typecheck & Lint Command:
```bash
npm run lint
```
Output: Zero errors (`tsc --noEmit` exited cleanly).

### Build Command:
```bash
npm run build
```
Output: Built in `915ms` with zero compilation errors.

---

## 11. Premium Access & Revocation Flow

1. **Anonymous / Signed Out User**:
   - Accesses `/components/button` (FREE) → Full preview, source code, CLI command, and AI prompt.
   - Accesses `/components/data-table` (PREMIUM) → Redacted source, locked preview, prompt to sign in.
2. **Free User Login**:
   - Signs in with `free@techinject.dev`.
   - Accesses `/components/data-table` → Explains that active Premium subscription is required. Source download returns `403 Forbidden`.
3. **Admin Grants Premium**:
   - Admin navigates to `/admin/customers`, clicks **Grant Premium** on `free@techinject.dev`.
   - Backend updates customer tier immediately.
   - User reloads `/components/data-table` → Full access unlocked.
4. **Admin Revokes Premium**:
   - Admin clicks **Revoke Premium**.
   - On the very next HTTP request, the user's session is dynamically verified against the database and denied with `PREMIUM_REQUIRED`.

---

## 12. Known Limitations & Gaps

- **Code Recall Boundary**: Once a customer copies source code or runs `npx tech-inject add` to download files into their local repository, revoking their premium tier cannot delete or alter files on their local machine.
- **Web-Only CLI Invocation**: The CLI installer requires network connectivity to reach the server endpoint and requires Node.js v18+.
- **Payment Gateway**: As explicitly instructed, no mock payment processors or fake Stripe gateways are included; tier toggling is performed through the administrative console.

---

## 13. Time Spent

- **Architecture & Setup (Phase 1)**: ~25 mins
- **Design Tokens & UI Primitives (Phase 2)**: ~35 mins
- **Database, Auth & Server API (Phase 3)**: ~30 mins
- **Public Catalogue & Admin Suite (Phase 4)**: ~40 mins
- **CLI Installer & AI Prompt Engine (Phase 5)**: ~20 mins
- **Automated Verification, Tests & Documentation (Phase 6 & 7)**: ~25 mins
- **Total Time**: ~2.9 hours
