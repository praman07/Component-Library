import React from 'react';
import { Breadcrumb, CodeBlock, CopyButton, Card } from '../../packages/ui';
import { Terminal, Cpu, Shield, Layers } from 'lucide-react';

export const DocsGettingStartedPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="w-full flex flex-col gap-8 pb-20 max-w-4xl">
      <Breadcrumb
        items={[
          { label: 'Documentation' },
          { label: 'Getting Started' },
        ]}
      />

      <div className="space-y-2 pb-6 border-b border-[#1F1F1F]">
        <h1 className="text-3xl font-bold tracking-tight text-[#FFFFFF]">Getting Started</h1>
        <p className="text-sm text-[#A3A3A3] leading-relaxed max-w-2xl">
          Tech Inject is a strict monochrome React and TypeScript design library built for technical dashboards, developer consoles, and high-density SaaS tools.
        </p>
      </div>

      {/* Section 1: Philosophy */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#FFFFFF] tracking-tight">1. Design Philosophy</h2>
        <p className="text-xs text-[#A3A3A3] leading-relaxed">
          The system strictly adheres to solid grayscale palettes (#090909 canvas, #111111 surfaces, #262626 hairline borders, and pure white for primary focus).
          There are zero gradients, zero purple or neon accents, zero glassmorphism, and zero pill-capsule metadata badges.
        </p>
      </section>

      {/* Section 2: Setup Tokens */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#FFFFFF] tracking-tight">2. CSS Theme Variables</h2>
        <p className="text-xs text-[#A3A3A3] leading-relaxed">
          Add these centralized theme variables to your global CSS stylesheet (e.g. <code className="text-[#FFFFFF]">src/index.css</code>):
        </p>
        <CodeBlock
          code={`:root {
  --background: #090909;
  --surface: #111111;
  --surface-elevated: #161616;
  --border: #262626;
  --border-strong: #333333;
  --foreground: #F5F5F5;
  --foreground-secondary: #A3A3A3;
  --foreground-muted: #737373;
  --white: #FFFFFF;
  --black: #000000;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}`}
          language="css"
          filename="src/index.css"
        />
      </section>

      {/* Section 3: CLI Installer */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#FFFFFF] tracking-tight">3. CLI Installer</h2>
        <p className="text-xs text-[#A3A3A3] leading-relaxed">
          You can add components directly into your application using our zero-dependency CLI installer. The installer performs security validation against path traversal and will never silently overwrite your existing files:
        </p>
        <CodeBlock
          code={`# Install a free component
npx tech-inject add button

# Install a premium component (requires subscriber token)
npx tech-inject add data-table --token="ti_sess_xxx"

# Install into a custom directory
npx tech-inject add card --out="./src/components/ui"`}
          language="bash"
          filename="terminal"
        />
      </section>

      {/* Section 4: AI Agent Integration */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#FFFFFF] tracking-tight">4. AI Agent Integration</h2>
        <p className="text-xs text-[#A3A3A3] leading-relaxed">
          Every component detail page contains a dynamically generated <strong>AI Agent Prompt</strong>. Copy this prompt into Cursor, Claude 3.7 / 3.5, ChatGPT, or AI Studio. It instructs the coding agent on exact file locations, required npm dependencies, design token constraints, and provides a 5-step verification checklist.
        </p>
      </section>
    </div>
  );
};
