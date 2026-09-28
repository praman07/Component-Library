import React, { useState, useEffect } from 'react';
import { ComponentRecord, ComponentCategory, AccessLevel, ComponentStatus } from '../../packages/types';
import {
  Button,
  Input,
  FormField,
  Breadcrumb,
  Tabs,
  LoadingState,
  ErrorState,
  useToast,
  ComponentPreview,
} from '../../packages/ui';
import { renderLiveComponent } from '../../packages/reference-components/registry';
import { ArrowLeft, Save, Globe, EyeOff, Upload, Code2, AlertCircle } from 'lucide-react';
import { useAuth } from '../shared/AuthContext';

export interface AdminComponentEditorProps {
  componentId?: string; // If undefined, creating new component
  onBack: () => void;
  onSaved: () => void;
}

export const AdminComponentEditor: React.FC<AdminComponentEditorProps> = ({
  componentId,
  onBack,
  onSaved,
}) => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const isNew = !componentId;

  const [activeTab, setActiveTab] = useState('fields');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComponentCategory>('primitives');
  const [version, setVersion] = useState('1.0.0');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('FREE');
  const [status, setStatus] = useState<ComponentStatus>('DRAFT');
  const [dependenciesStr, setDependenciesStr] = useState('{}');
  const [usageDocs, setUsageDocs] = useState('');
  const [filesStr, setFilesStr] = useState('[]');
  const [propsSchemaStr, setPropsSchemaStr] = useState('[]');
  const [mainFile, setMainFile] = useState('src/components/ui/NewComponent.tsx');

  useEffect(() => {
    if (!isNew && componentId) {
      const fetchComp = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/admin/components/${componentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Failed to load component details');
          const data = await res.json();
          const c: ComponentRecord = data.component;

          setName(c.name);
          setSlug(c.slug);
          setDescription(c.description);
          setCategory(c.category);
          setVersion(c.version);
          setAccessLevel(c.accessLevel);
          setStatus(c.status);
          setDependenciesStr(JSON.stringify(c.dependencies, null, 2));
          setUsageDocs(c.usageDocs);
          setFilesStr(JSON.stringify(c.files, null, 2));
          setPropsSchemaStr(JSON.stringify(c.propsSchema, null, 2));
          setMainFile(c.mainFile);
        } catch (err: any) {
          showToast({ title: 'Error', description: err.message, type: 'error' });
        } finally {
          setLoading(false);
        }
      };
      fetchComp();
    } else {
      applyPreset('segmented');
    }
  }, [componentId, isNew, token]);

  const applyPreset = (presetKey: 'segmented' | 'switch' | 'alert' | 'stat') => {
    if (presetKey === 'segmented') {
      setName('SegmentedControl');
      setSlug('segmented-control');
      setDescription('Tactile segmented button controller for managing discrete view options.');
      setCategory('navigation');
      setVersion('1.0.0');
      setAccessLevel('FREE');
      setStatus('PUBLISHED');
      setDependenciesStr(JSON.stringify({ 'lucide-react': '^0.546.0' }, null, 2));
      setUsageDocs(`import { SegmentedControl } from '@/components/ui/SegmentedControl';\n\nexport function Demo() {\n  return <SegmentedControl options={['Day', 'Week', 'Month']} value="Day" onChange={console.log} />;\n}`);
      setMainFile('src/components/ui/SegmentedControl.tsx');
      setPropsSchemaStr(
        JSON.stringify(
          [
            { name: 'options', type: 'string[]', required: true, description: 'Available segments' },
            { name: 'value', type: 'string', required: true, description: 'Selected segment value' },
            { name: 'onChange', type: '(value: string) => void', required: false, description: 'Change callback' },
          ],
          null,
          2
        )
      );
      setFilesStr(
        JSON.stringify(
          [
            {
              path: 'src/components/ui/SegmentedControl.tsx',
              content: `import React from 'react';\n\nexport interface SegmentedControlProps {\n  options: string[];\n  value: string;\n  onChange?: (val: string) => void;\n}\n\nexport const SegmentedControl: React.FC<SegmentedControlProps> = ({\n  options,\n  value,\n  onChange,\n}) => {\n  return (\n    <div className="inline-flex p-1 bg-[#111111] border border-[#262626] rounded-md gap-1">\n      {options.map((opt) => (\n        <button\n          key={opt}\n          onClick={() => onChange?.(opt)}\n          className={\`px-3 py-1 text-xs rounded transition-colors \${\n            value === opt ? 'bg-[#FFFFFF] text-[#000000] font-semibold' : 'text-[#8A8A8A] hover:text-[#FFFFFF]'\n          }\`}\n        >\n          {opt}\n        </button>\n      ))}\n    </div>\n  );\n};`,
              description: 'SegmentedControl component implementation',
            },
          ],
          null,
          2
        )
      );
    } else if (presetKey === 'switch') {
      setName('ToggleSwitch');
      setSlug('toggle-switch');
      setDescription('Monochrome binary switch trigger with tactile keyboard accessibility and state indicators.');
      setCategory('forms');
      setVersion('1.0.0');
      setAccessLevel('FREE');
      setStatus('PUBLISHED');
      setDependenciesStr(JSON.stringify({}, null, 2));
      setUsageDocs(`import { ToggleSwitch } from '@/components/ui/ToggleSwitch';\n\nexport function Demo() {\n  const [checked, setChecked] = useState(false);\n  return <ToggleSwitch checked={checked} onChange={setChecked} label="Enable telemetry" />;\n}`);
      setMainFile('src/components/ui/ToggleSwitch.tsx');
      setPropsSchemaStr(
        JSON.stringify(
          [
            { name: 'checked', type: 'boolean', required: true, description: 'Binary checked state' },
            { name: 'onChange', type: '(checked: boolean) => void', required: true, description: 'Toggle callback' },
            { name: 'label', type: 'string', required: false, description: 'Optional helper label' },
          ],
          null,
          2
        )
      );
      setFilesStr(
        JSON.stringify(
          [
            {
              path: 'src/components/ui/ToggleSwitch.tsx',
              content: `import React from 'react';\n\nexport interface ToggleSwitchProps {\n  checked: boolean;\n  onChange: (checked: boolean) => void;\n  label?: string;\n}\n\nexport const ToggleSwitch: React.FC<ToggleSwitchProps> = ({\n  checked,\n  onChange,\n  label,\n}) => (\n  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none text-xs text-[#F5F5F5]">\n    <button\n      type="button"\n      role="switch"\n      aria-checked={checked}\n      onClick={() => onChange(!checked)}\n      className={\`w-9 h-5 rounded-full p-0.5 transition-colors border \${\n        checked ? 'bg-[#FFFFFF] border-[#FFFFFF]' : 'bg-[#161616] border-[#2E2E2E]'\n      }\`}\n    >\n      <div\n        className={\`w-3.5 h-3.5 rounded-full transition-transform \${\n          checked ? 'translate-x-4 bg-[#000000]' : 'translate-x-0 bg-[#737373]'\n        }\`}\n      />\n    </button>\n    {label && <span>{label}</span>}\n  </label>\n);`,
              description: 'Accessible monochrome switch component',
            },
          ],
          null,
          2
        )
      );
    } else if (presetKey === 'alert') {
      setName('AlertBanner');
      setSlug('alert-banner');
      setDescription('Tactile notification banner supporting default, warning, and critical notification states.');
      setCategory('feedback');
      setVersion('1.0.0');
      setAccessLevel('PREMIUM');
      setStatus('PUBLISHED');
      setDependenciesStr(JSON.stringify({ 'lucide-react': '^0.546.0' }, null, 2));
      setUsageDocs(`import { AlertBanner } from '@/components/ui/AlertBanner';\n\nexport function Demo() {\n  return <AlertBanner title="Cluster Synchronized" description="All nodes healthy." />;\n}`);
      setMainFile('src/components/ui/AlertBanner.tsx');
      setPropsSchemaStr(
        JSON.stringify(
          [
            { name: 'title', type: 'string', required: true, description: 'Banner title' },
            { name: 'description', type: 'string', required: false, description: 'Detail description' },
            { name: 'variant', type: "'default' | 'critical'", required: false, default: "'default'", description: 'Visual emphasis' },
          ],
          null,
          2
        )
      );
      setFilesStr(
        JSON.stringify(
          [
            {
              path: 'src/components/ui/AlertBanner.tsx',
              content: `import React from 'react';\nimport { AlertCircle } from 'lucide-react';\n\nexport interface AlertBannerProps {\n  title: string;\n  description?: string;\n  variant?: 'default' | 'critical';\n}\n\nexport const AlertBanner: React.FC<AlertBannerProps> = ({ title, description, variant = 'default' }) => (\n  <div className={\`p-3.5 rounded-md border text-xs flex gap-3 \${\n    variant === 'critical' ? 'bg-[#1C1111] border-[#442222] text-[#F5F5F5]' : 'bg-[#111111] border-[#262626] text-[#F5F5F5]'\n  }\`}>\n    <AlertCircle className="w-4 h-4 text-[#A3A3A3] shrink-0 mt-0.5" />\n    <div>\n      <div className="font-semibold text-[#FFFFFF]">{title}</div>\n      {description && <div className="text-[11px] text-[#8A8A8A] mt-0.5">{description}</div>}\n    </div>\n  </div>\n);`,
              description: 'Alert banner component',
            },
          ],
          null,
          2
        )
      );
    }
  };

  const handleSave = async (publishImmediate = false) => {
    setSaving(true);
    setValidationErrors({});

    try {
      let parsedDeps = {};
      let parsedFiles = [];
      let parsedProps = [];

      try {
        parsedDeps = JSON.parse(dependenciesStr);
      } catch (e) {
        throw new Error('Dependencies must be valid JSON object');
      }

      try {
        parsedFiles = JSON.parse(filesStr);
      } catch (e) {
        throw new Error('Files bundle must be valid JSON array');
      }

      try {
        parsedProps = JSON.parse(propsSchemaStr);
      } catch (e) {
        throw new Error('Props schema must be valid JSON array');
      }

      const payload = {
        name,
        slug,
        description,
        category,
        version,
        accessLevel,
        status: publishImmediate ? 'PUBLISHED' : status,
        dependencies: parsedDeps,
        propsSchema: parsedProps,
        files: parsedFiles,
        mainFile,
        usageDocs,
        previewStates: [
          { id: 'default', name: 'Default', description: 'Standard preview', props: {} },
        ],
        tags: [category, accessLevel.toLowerCase()],
      };

      const url = isNew ? '/api/admin/components' : `/api/admin/components/${componentId}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          setValidationErrors(data.details);
        }
        throw new Error(data.error || 'Failed to save component');
      }

      showToast({
        title: publishImmediate ? 'Component Published' : 'Component Saved',
        description: data.message,
        type: 'success',
      });
      onSaved();
    } catch (err: any) {
      showToast({ title: 'Validation Error', description: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading component editor..." />;
  }

  return (
    <div className="w-full space-y-6 pb-20 max-w-5xl">
      <Breadcrumb
        items={[
          { label: 'Admin', onClick: onBack },
          { label: 'Components', onClick: onBack },
          { label: isNew ? 'New Component' : name || 'Edit Component' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F1F1F]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#FFFFFF]">
            {isNew ? 'Create New Component' : `Edit: ${name}`}
          </h1>
          <p className="text-xs text-[#8A8A8A] mt-0.5">
            Configure metadata, dependencies, props schema, and source files bundle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Cancel
          </Button>

          <Button
            variant="outline"
            size="sm"
            loading={saving}
            onClick={() => handleSave(false)}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Draft
          </Button>

          <Button
            variant="primary"
            size="sm"
            loading={saving}
            onClick={() => handleSave(true)}
            leftIcon={<Globe className="w-3.5 h-3.5" />}
          >
            Publish Now
          </Button>
        </div>
      </div>

      {isNew && (
        <div className="p-3.5 rounded-md border border-[#262626] bg-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-semibold text-[#FFFFFF]">Load Starter Preset Template:</span>
            <p className="text-[11px] text-[#737373]">Pre-populates working TSX code, schema, and dependencies</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => applyPreset('segmented')}
              className="px-2.5 py-1 text-xs rounded bg-[#161616] hover:bg-[#222222] border border-[#2B2B2B] text-[#F5F5F5] cursor-pointer"
            >
              Segmented Control
            </button>
            <button
              type="button"
              onClick={() => applyPreset('switch')}
              className="px-2.5 py-1 text-xs rounded bg-[#161616] hover:bg-[#222222] border border-[#2B2B2B] text-[#F5F5F5] cursor-pointer"
            >
              Toggle Switch
            </button>
            <button
              type="button"
              onClick={() => applyPreset('alert')}
              className="px-2.5 py-1 text-xs rounded bg-[#161616] hover:bg-[#222222] border border-[#2B2B2B] text-[#F5F5F5] cursor-pointer"
            >
              Alert Banner (Premium)
            </button>
          </div>
        </div>
      )}

      {/* Editor Tabs */}
      <Tabs
        tabs={[
          { id: 'fields', label: 'General Metadata' },
          { id: 'bundle', label: 'Source Bundle Files (JSON)' },
          { id: 'props', label: 'Props Schema & Docs' },
          { id: 'preview', label: 'Preview Validation' },
        ]}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: General Metadata */}
      {activeTab === 'fields' && (
        <div className="p-6 rounded-md border border-[#262626] bg-[#111111] space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Component Name" required error={validationErrors.name?.[0]}>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Button" />
            </FormField>

            <FormField
              label="Slug (URL identifier)"
              required
              hint="Lowercase letters, numbers and hyphens only"
              error={validationErrors.slug?.[0]}
            >
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="e.g. button"
              />
            </FormField>
          </div>

          <FormField label="Description" required error={validationErrors.description?.[0]}>
            <textarea
              className="w-full h-20 bg-[#141414] text-[#F5F5F5] placeholder-[#525252] text-xs rounded-md border border-[#262626] p-3 focus:outline-none focus:ring-1 focus:ring-[#FFFFFF] leading-relaxed"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe purpose, responsive behavior, and accessibility features..."
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Category" required error={validationErrors.category?.[0]}>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComponentCategory)}
                className="w-full h-9 bg-[#141414] text-[#F5F5F5] text-xs rounded-md border border-[#262626] px-3 focus:outline-none focus:ring-1 focus:ring-[#FFFFFF]"
              >
                <option value="primitives">primitives</option>
                <option value="forms">forms</option>
                <option value="data-display">data-display</option>
                <option value="feedback">feedback</option>
                <option value="navigation">navigation</option>
                <option value="overlays">overlays</option>
              </select>
            </FormField>

            <FormField label="Access Tier" required error={validationErrors.accessLevel?.[0]}>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
                className="w-full h-9 bg-[#141414] text-[#F5F5F5] text-xs rounded-md border border-[#262626] px-3 focus:outline-none focus:ring-1 focus:ring-[#FFFFFF]"
              >
                <option value="FREE">FREE (Open to all developers)</option>
                <option value="PREMIUM">PREMIUM (Subscriber locked)</option>
              </select>
            </FormField>

            <FormField label="Version (Semver)" required error={validationErrors.version?.[0]}>
              <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Primary File Path" required error={validationErrors.mainFile?.[0]}>
              <Input value={mainFile} onChange={(e) => setMainFile(e.target.value)} placeholder="src/components/ui/Button.tsx" />
            </FormField>

            <FormField label="Initial Publication Status" required>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ComponentStatus)}
                className="w-full h-9 bg-[#141414] text-[#F5F5F5] text-xs rounded-md border border-[#262626] px-3 focus:outline-none focus:ring-1 focus:ring-[#FFFFFF]"
              >
                <option value="DRAFT">DRAFT (Hidden from catalogue)</option>
                <option value="PUBLISHED">PUBLISHED (Live in catalogue)</option>
                <option value="UNPUBLISHED">UNPUBLISHED (Archived)</option>
              </select>
            </FormField>
          </div>
        </div>
      )}

      {/* Tab 2: Source Bundle Files */}
      {activeTab === 'bundle' && (
        <div className="p-6 rounded-md border border-[#262626] bg-[#111111] space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-[#FFFFFF]">Source Files Bundle (JSON Array)</span>
              <p className="text-[11px] text-[#737373] mt-0.5">
                Array of <code className="text-[#A3A3A3]">&#123; path: string, content: string, description?: string &#125;</code>.
                Paths are validated against directory traversal.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                try {
                  const formatted = JSON.stringify(JSON.parse(filesStr), null, 2);
                  setFilesStr(formatted);
                } catch (e) {
                  showToast({ title: 'Invalid JSON', description: 'Could not format JSON', type: 'error' });
                }
              }}
              className="text-[11px] text-[#A3A3A3] hover:text-[#FFFFFF] underline"
            >
              Format JSON
            </button>
          </div>

          <textarea
            className="w-full h-80 bg-[#0A0A0A] text-[#F5F5F5] font-mono text-xs rounded-md border border-[#262626] p-4 focus:outline-none focus:ring-1 focus:ring-[#FFFFFF] leading-relaxed"
            value={filesStr}
            onChange={(e) => setFilesStr(e.target.value)}
          />

          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-[#FFFFFF]">External NPM Dependencies (JSON Object)</span>
            <textarea
              className="w-full h-24 bg-[#0A0A0A] text-[#F5F5F5] font-mono text-xs rounded-md border border-[#262626] p-3 focus:outline-none focus:ring-1 focus:ring-[#FFFFFF]"
              value={dependenciesStr}
              onChange={(e) => setDependenciesStr(e.target.value)}
              placeholder={`{\n  "lucide-react": "^0.546.0"\n}`}
            />
          </div>
        </div>
      )}

      {/* Tab 3: Props Schema & Usage */}
      {activeTab === 'props' && (
        <div className="p-6 rounded-md border border-[#262626] bg-[#111111] space-y-4">
          <FormField label="Usage Example Code (TSX)">
            <textarea
              className="w-full h-40 bg-[#0A0A0A] text-[#F5F5F5] font-mono text-xs rounded-md border border-[#262626] p-3 focus:outline-none focus:ring-1 focus:ring-[#FFFFFF] leading-relaxed"
              value={usageDocs}
              onChange={(e) => setUsageDocs(e.target.value)}
              placeholder="import { Component } from '@/components/ui/Component';&#10;&#10;export function Demo() { return <Component />; }"
            />
          </FormField>

          <FormField
            label="Props Schema (JSON Array)"
            hint="Array of { name, type, required, default, description }"
          >
            <textarea
              className="w-full h-48 bg-[#0A0A0A] text-[#F5F5F5] font-mono text-xs rounded-md border border-[#262626] p-3 focus:outline-none focus:ring-1 focus:ring-[#FFFFFF] leading-relaxed"
              value={propsSchemaStr}
              onChange={(e) => setPropsSchemaStr(e.target.value)}
            />
          </FormField>
        </div>
      )}

      {/* Tab 4: Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="p-4 rounded-md border border-[#262626] bg-[#111111] text-xs text-[#A3A3A3]">
            This interactive canvas simulates how the component will render in the public catalogue.
          </div>

          <ComponentPreview
            states={[{ id: 'default', name: 'Default State', description: 'Validation test preview', props: {} }]}
            renderComponent={(props, stateId) => renderLiveComponent(slug || 'button', props, stateId)}
          />
        </div>
      )}
    </div>
  );
};
