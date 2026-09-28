import React, { useState, useEffect } from 'react';
import { ComponentDetailResponse } from '../../packages/types';
import {
  StatusBadge,
  Tabs,
  Button,
  Breadcrumb,
  ComponentPreview,
  CodeBlock,
  CopyButton,
  LockState,
  LoadingState,
  ErrorState,
} from '../../packages/ui';
import { renderLiveComponent } from '../../packages/reference-components/registry';
import { Terminal, Copy, Cpu, ArrowLeft, Layers, ShieldAlert } from 'lucide-react';
import { useAuth } from '../shared/AuthContext';
import { HARDCODED_COMPONENTS } from '../../../server/hardcodedData';
import { generateAiAgentPrompt } from '../../../server/generator';

export interface ComponentDetailPageProps {
  slug: string;
  onBack: () => void;
  onLoginClick: () => void;
}

export const ComponentDetailPage: React.FC<ComponentDetailPageProps> = ({
  slug,
  onBack,
  onLoginClick,
}) => {
  const { user, token } = useAuth();
  const [component, setComponent] = useState<ComponentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('preview');

  const fetchComponent = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/components/${slug}`, { headers });
      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn('Non-JSON response from /api/components/' + slug, text);
      }

      const toDetail = (c: any): ComponentDetailResponse => {
        const isPrem = c.accessLevel === 'PREMIUM';
        const hasAccess = !isPrem || (user && (user.role === 'admin' || user.tier === 'premium'));
        if (!hasAccess) {
          return {
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            category: c.category,
            version: c.version,
            accessLevel: c.accessLevel,
            status: c.status,
            tags: c.tags || [],
            dependencies: c.dependencies || {},
            propsSchema: c.propsSchema || [],
            isLocked: true,
            lockReason: !user ? 'SIGN_IN_REQUIRED' : 'PREMIUM_REQUIRED',
            updatedAt: c.updatedAt || new Date().toISOString(),
            publishedAt: c.publishedAt,
          };
        }
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          category: c.category,
          version: c.version,
          accessLevel: c.accessLevel,
          status: c.status,
          tags: c.tags || [],
          dependencies: c.dependencies || {},
          devDependencies: c.devDependencies || {},
          propsSchema: c.propsSchema || [],
          files: c.files || [],
          mainFile: c.mainFile || '',
          usageDocs: c.usageDocs || '',
          previewStates: c.previewStates || [],
          isLocked: false,
          installCommand: `npx tech-inject add ${c.slug}`,
          aiAgentPrompt: generateAiAgentPrompt(c),
          updatedAt: c.updatedAt || new Date().toISOString(),
          publishedAt: c.publishedAt,
        };
      };

      if (res.ok && data?.component) {
        setComponent(data.component);
      } else {
        const fallback = HARDCODED_COMPONENTS.find((c) => c.slug === slug);
        if (fallback) {
          setComponent(toDetail(fallback));
        } else {
          throw new Error(data?.error || 'Failed to load component');
        }
      }
    } catch (err: any) {
      const fallback = HARDCODED_COMPONENTS.find((c) => c.slug === slug);
      if (fallback) {
        const isPrem = fallback.accessLevel === 'PREMIUM';
        const hasAccess = !isPrem || (user && (user.role === 'admin' || user.tier === 'premium'));
        setComponent({
          id: fallback.id,
          name: fallback.name,
          slug: fallback.slug,
          description: fallback.description,
          category: fallback.category,
          version: fallback.version,
          accessLevel: fallback.accessLevel,
          status: fallback.status,
          tags: fallback.tags || [],
          dependencies: fallback.dependencies || {},
          devDependencies: fallback.devDependencies || {},
          propsSchema: fallback.propsSchema || [],
          files: fallback.files || [],
          mainFile: fallback.mainFile || '',
          usageDocs: fallback.usageDocs || '',
          previewStates: fallback.previewStates || [],
          isLocked: !hasAccess,
          lockReason: !user ? 'SIGN_IN_REQUIRED' : 'PREMIUM_REQUIRED',
          installCommand: `npx tech-inject add ${fallback.slug}`,
          aiAgentPrompt: generateAiAgentPrompt(fallback),
          updatedAt: fallback.updatedAt || new Date().toISOString(),
          publishedAt: fallback.publishedAt,
        } as any);
      } else {
        setError(err.message || 'Component not found');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponent();
  }, [slug, token]);

  if (loading) {
    return <LoadingState message={`Fetching component "${slug}"...`} />;
  }

  if (error || !component) {
    return (
      <ErrorState
        title="Component Not Found"
        message={error || 'This component does not exist or may have been unpublished.'}
        onRetry={fetchComponent}
      />
    );
  }

  const isLocked = component.isLocked;
  const isPremium = component.accessLevel === 'PREMIUM';

  return (
    <div className="w-full flex flex-col gap-6 pb-20">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            { label: 'Components', onClick: onBack },
            { label: component.category.toUpperCase() },
            { label: component.name },
          ]}
        />
        <Button variant="ghost" size="sm" onClick={onBack} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
          Back to list
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3 pb-6 border-b border-[#1F1F1F]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFFFF]">
              {component.name}
            </h1>
            <span className="font-mono text-xs text-[#737373] bg-[#141414] px-2 py-0.5 rounded border border-[#222222]">
              v{component.version}
            </span>
          </div>

          <StatusBadge accessLevel={component.accessLevel} />
        </div>

        <p className="text-xs sm:text-sm text-[#A3A3A3] max-w-3xl leading-relaxed">
          {component.description}
        </p>

        {isPremium && isLocked && (
          <div className="mt-2 p-3 rounded bg-[#161616] border border-[#2D2D2D] flex items-center justify-between text-xs text-[#E5E5E5]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#A3A3A3] shrink-0" />
              <span>
                {component.lockReason === 'SIGN_IN_REQUIRED'
                  ? 'Sign-in required to inspect full source code, install via CLI, and generate AI prompts.'
                  : 'Upgrade or grant your account premium access to unlock this component.'}
              </span>
            </div>
            {component.lockReason === 'SIGN_IN_REQUIRED' && (
              <Button variant="primary" size="sm" onClick={onLoginClick}>
                Sign In
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <Tabs
        tabs={[
          { id: 'preview', label: 'Preview' },
          { id: 'code', label: 'Source Code' },
          { id: 'usage', label: 'Usage & API' },
          { id: 'installation', label: 'Installation' },
          { id: 'ai-agent', label: 'AI Agent Prompt' },
        ]}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: Preview */}
      {activeTab === 'preview' && (
        <section className="space-y-4">
          {isLocked ? (
            <LockState
              reason={component.lockReason}
              componentName={component.name}
              onLoginClick={onLoginClick}
            />
          ) : (
            <ComponentPreview
              states={component.previewStates || [{ id: 'default', name: 'Default', description: 'Standard preview', props: {} }]}
              renderComponent={(props, stateId) => renderLiveComponent(component.slug, props, stateId)}
            />
          )}
        </section>
      )}

      {/* Tab 2: Code */}
      {activeTab === 'code' && (
        <section className="space-y-4">
          {isLocked ? (
            <LockState
              reason={component.lockReason}
              componentName={component.name}
              onLoginClick={onLoginClick}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#737373]">
                <span>
                  Primary source bundle: <code className="text-[#FFFFFF]">{component.mainFile}</code>
                </span>
                <div className="flex items-center gap-2">
                  <span>Dependencies:</span>
                  {Object.keys(component.dependencies).length > 0 ? (
                    <span className="font-mono text-[#A3A3A3]">
                      {Object.keys(component.dependencies).join(', ')}
                    </span>
                  ) : (
                    <span className="text-[#525252]">None</span>
                  )}
                </div>
              </div>

              {component.files.map((file, idx) => (
                <CodeBlock
                  key={idx}
                  code={file.content}
                  filename={file.path}
                  showLineNumbers
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 3: Usage */}
      {activeTab === 'usage' && (
        <section className="space-y-6">
          {/* TypeScript Props Schema Table */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[#FFFFFF] tracking-tight">Props Contract</h3>
            {component.propsSchema.length === 0 ? (
              <p className="text-xs text-[#737373]">No custom props declared. Uses standard HTML element attributes.</p>
            ) : (
              <div className="border border-[#262626] rounded-md overflow-hidden bg-[#111111]">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#262626] bg-[#0E0E0E] text-[#A3A3A3] text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Prop</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Default</th>
                      <th className="py-2.5 px-3">Required</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C1C1C]">
                    {component.propsSchema.map((prop, idx) => (
                      <tr key={idx} className="hover:bg-[#161616]">
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#FFFFFF]">{prop.name}</td>
                        <td className="py-2.5 px-3 font-mono text-[#A3A3A3]">{prop.type}</td>
                        <td className="py-2.5 px-3 font-mono text-[#737373]">{prop.default || '—'}</td>
                        <td className="py-2.5 px-3 text-[#A3A3A3]">{prop.required ? 'Yes' : 'No'}</td>
                        <td className="py-2.5 px-3 text-[#A3A3A3]">{prop.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Usage example */}
          {!isLocked && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-[#FFFFFF] tracking-tight">Example Code</h3>
              <CodeBlock code={component.usageDocs} filename="Example.tsx" />
            </div>
          )}
        </section>
      )}

      {/* Tab 4: Installation */}
      {activeTab === 'installation' && (
        <section className="space-y-6">
          {isLocked ? (
            <LockState
              reason={component.lockReason}
              componentName={component.name}
              onLoginClick={onLoginClick}
            />
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#FFFFFF] tracking-tight">CLI Command</h3>
                <p className="text-xs text-[#8A8A8A]">
                  Run this command from your terminal to install {component.name} directly into your React project:
                </p>
                <div className="p-3 rounded-md bg-[#0D0D0D] border border-[#262626] flex items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#FFFFFF] truncate">
                    <Terminal className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                    <span>{component.installCommand}</span>
                  </div>
                  <CopyButton textToCopy={component.installCommand} label="Copy Command" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#FFFFFF] tracking-tight">Manual File Placement</h3>
                <p className="text-xs text-[#8A8A8A]">
                  If you prefer manual setup, place the component files into the target directories:
                </p>
                <ul className="list-disc list-inside text-xs text-[#A3A3A3] space-y-1">
                  {component.files.map((f, i) => (
                    <li key={i}>
                      <code className="text-[#FFFFFF]">{f.path}</code> ({f.description || 'Source file'})
                    </li>
                  ))}
                </ul>
              </div>

              {Object.keys(component.dependencies).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#FFFFFF] tracking-tight">Dependencies</h3>
                  <div className="p-3 rounded-md bg-[#111111] border border-[#222222] font-mono text-xs text-[#FFFFFF]">
                    npm install {Object.entries(component.dependencies).map(([k, v]) => `${k}@${v}`).join(' ')}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Tab 5: AI Agent Prompt */}
      {activeTab === 'ai-agent' && (
        <section className="space-y-4">
          {isLocked ? (
            <LockState
              reason={component.lockReason}
              componentName={component.name}
              onLoginClick={onLoginClick}
            />
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-[#FFFFFF] tracking-tight flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#FFFFFF]" />
                    <span>AI Coding Agent Integration Prompt</span>
                  </h3>
                  <p className="text-xs text-[#8A8A8A] mt-0.5">
                    Copy and pass this generated prompt to Claude, Cursor, ChatGPT, or AI Studio:
                  </p>
                </div>
                <CopyButton
                  textToCopy={component.aiAgentPrompt}
                  label="Copy Prompt"
                  toastMessage="AI Agent prompt copied to clipboard"
                />
              </div>

              <CodeBlock
                code={component.aiAgentPrompt || generateAiAgentPrompt(component as any)}
                language="markdown"
                filename="agent-prompt.md"
                maxHeight="max-h-[600px]"
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
};
