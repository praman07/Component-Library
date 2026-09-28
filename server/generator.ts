import { ComponentRecord } from '../src/packages/types';

/**
 * Dynamically generates a verified, production-grade AI coding agent prompt
 * using the component's actual metadata, dependencies, props schema, and source files.
 */
export function generateAiAgentPrompt(comp: ComponentRecord): string {
  const depsList = Object.keys(comp.dependencies).length > 0
    ? Object.entries(comp.dependencies)
        .map(([k, v]) => `  - "${k}": "${v}"`)
        .join('\n')
    : '  None (Zero external dependencies)';

  const filesList = comp.files
    .map((f) => `  - Path: \`${f.path}\` (${f.description || 'Source file'})`)
    .join('\n');

  const propsList = comp.propsSchema
    .map((p) => `  - \`${p.name}\`${p.required ? ' (required)' : ' (optional)'}: ${p.type} — ${p.description}`)
    .join('\n');

  return `You are integrating the ${comp.name} component (${comp.version}) from Tech Inject Design Library.

COMPONENT SPECIFICATION:
- Name: ${comp.name}
- Slug: ${comp.slug}
- Category: ${comp.category}
- Access Tier: ${comp.accessLevel}
- Description: ${comp.description}

INSTALLATION / PACKAGE INTEGRATION:
Command:
npx tech-inject add ${comp.slug}

REQUIRED DEPENDENCIES:
${depsList}

FILES TO CREATE / LOCATE:
${filesList}

PROPS & TYPE CONTRACT:
${propsList}

USAGE EXAMPLE:
\`\`\`tsx
${comp.usageDocs}
\`\`\`

STRICT DESIGN SYSTEM RULES:
1. Preserve existing Tech Inject theme tokens (--background: #090909, --surface: #111111, --border: #262626, --foreground: #F5F5F5, --white: #FFFFFF, --black: #000000).
2. DO NOT introduce gradients anywhere. Strictly solid monochrome colors only.
3. DO NOT introduce purple, blue, neon, glassmorphism, or colorful accent states.
4. Primary buttons must use solid white background (#FFFFFF) with black text (#000000).
5. All interactive elements must support hover, focus-visible ring, disabled, and loading states.
6. For data tables or numeric telemetry, always enforce monospace tabular numerals (font-mono tabular-nums).

STEP-BY-STEP VERIFICATION PROTOCOL:
1. Verify TypeScript types: Run \`npm run lint\` or \`tsc --noEmit\` to ensure zero type discrepancies.
2. Verify dependencies: Confirm all required dependencies are present in package.json.
3. Verify rendering: Confirm component renders with clean contrast against dark surface (#111111).
4. Verify responsive behavior: Test layout on mobile (375px), tablet (768px), and desktop (1440px).
5. Report any corrections or integration notes upon completion.`;
}
