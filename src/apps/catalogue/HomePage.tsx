import React, { useState } from 'react';
import { ComponentSummary } from '../../packages/types';
import { Button, StatusBadge, SearchInput, Card } from '../../packages/ui';
import { ArrowRight, Terminal, Layers, ShieldCheck, Cpu } from 'lucide-react';

export interface HomePageProps {
  components: ComponentSummary[];
  onNavigate: (path: string) => void;
  onSelectComponent: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  components,
  onNavigate,
  onSelectComponent,
}) => {
  const [search, setSearch] = useState('');

  const filtered = components.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full flex flex-col gap-12 pb-16">
      {/* Hero Section */}
      <section className="pt-12 sm:pt-16 pb-6 border-b border-[#1E1E1E]">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono text-[#A3A3A3] bg-[#141414] border border-[#262626] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF]" />
            <span>Tech Inject v1.4.0 · Production Registry</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FFFFFF] text-balance leading-tight">
            Precision React components for technical software.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#A3A3A3] leading-relaxed max-w-2xl text-pretty">
            A tokenized design system built with a strict monochrome palette. Engineered with real
            functional previews, CLI installation, dynamic AI agent prompts, and verified server-side
            access control.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate('/components')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Browse Catalogue
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate('/docs/getting-started')}
            >
              Documentation
            </Button>
          </div>

          {/* Quick CLI snippet */}
          <div className="mt-8 p-3 rounded-md bg-[#111111] border border-[#222222] max-w-md flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#D4D4D4] truncate">
              <Terminal className="w-3.5 h-3.5 text-[#737373] shrink-0" />
              <span className="truncate">npx tech-inject add button</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText('npx tech-inject add button');
              }}
              className="text-[#737373] hover:text-[#FFFFFF] text-[11px] px-2 py-0.5 rounded bg-[#1A1A1A] hover:bg-[#262626] transition-colors shrink-0"
            >
              Copy
            </button>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-md border border-[#222222] bg-[#111111]">
          <div className="w-7 h-7 rounded bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#FFFFFF] mb-3">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-semibold text-[#FFFFFF] tracking-tight">Zero-Gradient Monochrome</h3>
          <p className="mt-1 text-xs text-[#8A8A8A] leading-normal">
            Eliminates visual noise and generic SaaS cliches. High legibility, dark surfaces, and strict tokenized variables.
          </p>
        </div>

        <div className="p-4 rounded-md border border-[#222222] bg-[#111111]">
          <div className="w-7 h-7 rounded bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#FFFFFF] mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-semibold text-[#FFFFFF] tracking-tight">Server-Enforced Access</h3>
          <p className="mt-1 text-xs text-[#8A8A8A] leading-normal">
            Protected premium source code and bundles cannot be leaked client-side. Revocation takes effect immediately.
          </p>
        </div>

        <div className="p-4 rounded-md border border-[#222222] bg-[#111111]">
          <div className="w-7 h-7 rounded bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#FFFFFF] mb-3">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-semibold text-[#FFFFFF] tracking-tight">AI Agent Integration</h3>
          <p className="mt-1 text-xs text-[#8A8A8A] leading-normal">
            Every component generates contextual instructions with file paths, dependencies, and verification procedures.
          </p>
        </div>
      </section>

      {/* Featured Registry Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#FFFFFF] tracking-tight">Published Components</h2>
            <p className="text-xs text-[#8A8A8A]">
              Showing {filtered.length} components available in registry
            </p>
          </div>

          <div className="w-full sm:w-64">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Filter components..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((comp) => (
            <div
              key={comp.id}
              onClick={() => onSelectComponent(comp.slug)}
              className="p-4 rounded-md border border-[#222222] bg-[#111111] hover:border-[#383838] hover:bg-[#141414] transition-colors cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono text-[#737373] uppercase tracking-wider">
                    {comp.category}
                  </span>
                  <StatusBadge accessLevel={comp.accessLevel} />
                </div>

                <h3 className="text-sm font-semibold text-[#FFFFFF] group-hover:text-[#FFFFFF] transition-colors">
                  {comp.name}
                </h3>

                <p className="text-xs text-[#8A8A8A] mt-1 line-clamp-2 leading-normal">
                  {comp.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1C1C1C] flex items-center justify-between text-[11px] text-[#737373] font-mono">
                <span>v{comp.version}</span>
                <span className="group-hover:text-[#FFFFFF] transition-colors flex items-center gap-1">
                  View Docs <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
