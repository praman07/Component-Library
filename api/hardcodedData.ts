import { ComponentRecord, CustomerUser } from './types';

export const HARDCODED_USERS: CustomerUser[] = [
  {
    id: 'usr_admin_01',
    email: 'admin@techinject.dev',
    role: 'admin',
    tier: 'premium',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_free_02',
    email: 'free@techinject.dev',
    role: 'customer',
    tier: 'free',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'usr_premium_03',
    email: 'pro@techinject.dev',
    role: 'customer',
    tier: 'premium',
    createdAt: '2026-01-03T00:00:00.000Z',
    updatedAt: '2026-01-03T00:00:00.000Z',
  },
];

export const HARDCODED_CREDENTIALS: Record<string, string> = {
  'admin@techinject.dev': 'admin123',
  'free@techinject.dev': 'free123',
  'pro@techinject.dev': 'premium123',
};

export const HARDCODED_COMPONENTS: ComponentRecord[] = [
  {
    id: 'cmp_button_01',
    name: 'Button',
    slug: 'button',
    description: 'High-contrast tactile interactive trigger supporting 5 variants, 3 sizes, and loading states in strict monochrome.',
    category: 'primitives',
    version: '1.4.0',
    accessLevel: 'FREE',
    status: 'PUBLISHED',
    dependencies: {
      'lucide-react': '^0.546.0',
    },
    propsSchema: [
      { name: 'variant', type: "'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'", required: false, default: "'primary'", description: 'Visual style of the button' },
      { name: 'size', type: "'sm' | 'md' | 'lg' | 'icon'", required: false, default: "'md'", description: 'Button height and padding' },
      { name: 'loading', type: 'boolean', required: false, default: 'false', description: 'Displays spinner and disables pointer events' },
      { name: 'disabled', type: 'boolean', required: false, default: 'false', description: 'Prevents user interaction' },
    ],
    mainFile: 'src/components/ui/Button.tsx',
    files: [
      {
        path: 'src/components/ui/Button.tsx',
        content: `import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', variant = 'primary', size = 'md', loading = false, disabled = false, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-md transition-colors select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFFFFF] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs';
    const sizes = {
      sm: 'h-8 px-2.5 gap-1.5 text-xs',
      md: 'h-9 px-3.5 gap-2 text-xs',
      lg: 'h-10 px-4 gap-2 text-sm',
      icon: 'h-9 w-9 p-0 flex items-center justify-center',
    }[size];
    const variants = {
      primary: 'bg-[#FFFFFF] text-[#000000] hover:bg-[#E5E5E5] active:bg-[#CCCCCC]',
      secondary: 'bg-[#161616] text-[#F5F5F5] border border-[#262626] hover:bg-[#222222]',
      outline: 'bg-transparent text-[#F5F5F5] border border-[#262626] hover:border-[#444444]',
      ghost: 'bg-transparent text-[#A3A3A3] hover:text-[#FFFFFF] hover:bg-[#161616]',
      destructive: 'bg-[#222222] text-[#F5F5F5] border border-[#444444] hover:bg-[#2c2c2c]',
    }[variant];

    return (
      <button ref={ref} disabled={disabled || loading} className={\`\${base} \${sizes} \${variants} \${className}\`} {...props}>
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';`,
        description: 'Main Button component implementation',
      },
    ],
    usageDocs: `import { Button } from '@/components/ui/Button';

export function Example() {
  return (
    <div className="flex gap-2">
      <Button variant="primary">Deploy Service</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="outline" loading>Synchronizing...</Button>
    </div>
  );
}`,
    previewStates: [
      { id: 'default', name: 'Default Primary', description: 'Standard high-contrast primary button with dark foreground', props: { variant: 'primary', label: 'Primary Action' } },
      { id: 'secondary', name: 'Secondary', description: 'Subtle surface background with thin hairline border', props: { variant: 'secondary', label: 'Secondary Action' } },
      { id: 'outline', name: 'Outline', description: 'Transparent background with hairline border', props: { variant: 'outline', label: 'Outline Action' } },
      { id: 'loading', name: 'Loading', description: 'Animated spinner with disabled interaction', props: { variant: 'primary', loading: true, label: 'Processing' } },
      { id: 'disabled', name: 'Disabled', description: 'Reduced opacity state for blocked actions', props: { variant: 'primary', disabled: true, label: 'Action Blocked' } },
    ],
    tags: ['trigger', 'action', 'form', 'primitive'],
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
    publishedAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'cmp_input_02',
    name: 'Input',
    slug: 'input',
    description: 'Accessible single-line text input field with prefix/suffix slot support, keyboard focus rings, and error message attachment.',
    category: 'forms',
    version: '1.2.0',
    accessLevel: 'FREE',
    status: 'PUBLISHED',
    dependencies: {},
    propsSchema: [
      { name: 'placeholder', type: 'string', required: false, default: "''", description: 'Placeholder helper text' },
      { name: 'error', type: 'string', required: false, default: 'undefined', description: 'Validation error text' },
      { name: 'disabled', type: 'boolean', required: false, default: 'false', description: 'Disables user entry' },
    ],
    mainFile: 'src/components/ui/Input.tsx',
    files: [
      {
        path: 'src/components/ui/Input.tsx',
        content: `import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          disabled={disabled}
          className={\`w-full h-9 bg-[#111111] text-[#F5F5F5] placeholder-[#525252] text-xs rounded-md border px-3 transition-colors \${
            error ? 'border-[#737373] focus:border-[#FFFFFF]' : 'border-[#262626] focus:border-[#FFFFFF]'
          } focus:outline-none focus:ring-1 focus:ring-[#FFFFFF] disabled:opacity-40 \${className}\`}
          {...props}
        />
        {error && <p className="mt-1 text-[11px] text-[#A3A3A3]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';`,
        description: 'Single-line input with error state and focus ring',
      },
    ],
    usageDocs: `import { Input } from '@/components/ui/Input';

export function FormDemo() {
  return (
    <Input
      placeholder="e.g. org_production_db"
      error={undefined}
    />
  );
}`,
    previewStates: [
      { id: 'default', name: 'Default', description: 'Standard text input state', props: { placeholder: 'Enter API Key ID...' } },
      { id: 'filled', name: 'Filled Value', description: 'Input containing user data', props: { defaultValue: 'live_sec_token_9410' } },
      { id: 'error', name: 'Validation Error', description: 'Input with error indicator text', props: { defaultValue: 'invalid key', error: 'Key identifier must begin with "sec_"' } },
      { id: 'disabled', name: 'Disabled State', description: 'Input disabled for edits', props: { defaultValue: 'read_only_endpoint', disabled: true } },
    ],
    tags: ['field', 'form', 'text', 'primitive'],
    createdAt: '2026-03-02T00:00:00.000Z',
    updatedAt: '2026-03-02T00:00:00.000Z',
    publishedAt: '2026-03-02T00:00:00.000Z',
  },
  {
    id: 'cmp_badge_03',
    name: 'Badge',
    slug: 'badge',
    description: 'Compact status and metadata tag using clean unboxed or subtle hairline borders in accordance with zero-pill principles.',
    category: 'primitives',
    version: '1.1.0',
    accessLevel: 'FREE',
    status: 'PUBLISHED',
    dependencies: {},
    propsSchema: [
      { name: 'variant', type: "'default' | 'outline' | 'subtle' | 'contrast'", required: false, default: "'default'", description: 'Styling tone' },
      { name: 'size', type: "'sm' | 'md'", required: false, default: "'md'", description: 'Padding scale' },
    ],
    mainFile: 'src/components/ui/Badge.tsx',
    files: [
      {
        path: 'src/components/ui/Badge.tsx',
        content: `import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'subtle' | 'contrast';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, className = '', variant = 'default', size = 'md', ...props }) => {
  const base = 'inline-flex items-center font-medium rounded tracking-normal select-none';
  const sizes = { sm: 'px-1.5 py-0.5 text-[11px] gap-1', md: 'px-2 py-0.5 text-xs gap-1.5' }[size];
  const variants = {
    default: 'bg-[#161616] text-[#F5F5F5] border border-[#262626]',
    outline: 'bg-transparent text-[#A3A3A3] border border-[#262626]',
    subtle: 'bg-[#0F0F0F] text-[#737373]',
    contrast: 'bg-[#FFFFFF] text-[#000000]',
  }[variant];
  return <span className={\`\${base} \${sizes} \${variants} \${className}\`} {...props}>{children}</span>;
};`,
        description: 'Subtle badge component',
      },
    ],
    usageDocs: `import { Badge } from '@/components/ui/Badge';

export function StatusIndicator() {
  return <Badge variant="contrast">Verified Release</Badge>;
}`,
    previewStates: [
      { id: 'default', name: 'Default', description: 'Standard dark surface badge with hairline border', props: { children: 'Production Ready' } },
      { id: 'contrast', name: 'Contrast', description: 'Solid white badge with dark text for high priority indicators', props: { variant: 'contrast', children: 'Enterprise' } },
      { id: 'outline', name: 'Outline', description: 'Transparent background badge', props: { variant: 'outline', children: 'v2.4.0-stable' } },
      { id: 'subtle', name: 'Subtle', description: 'Low contrast muted metadata tag', props: { variant: 'subtle', children: 'Internal Only' } },
    ],
    tags: ['tag', 'status', 'label', 'primitive'],
    createdAt: '2026-03-03T00:00:00.000Z',
    updatedAt: '2026-03-03T00:00:00.000Z',
    publishedAt: '2026-03-03T00:00:00.000Z',
  },
  {
    id: 'cmp_card_04',
    name: 'Card',
    slug: 'card',
    description: 'Flat single-elevation structural container with hairline borders, structured header, content body, and footer.',
    category: 'primitives',
    version: '1.0.0',
    accessLevel: 'FREE',
    status: 'PUBLISHED',
    dependencies: {},
    propsSchema: [
      { name: 'hoverable', type: 'boolean', required: false, default: 'false', description: 'Applies border lightening on mouse hover' },
    ],
    mainFile: 'src/components/ui/Card.tsx',
    files: [
      {
        path: 'src/components/ui/Card.tsx',
        content: `import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { hoverable?: boolean }> = ({
  children, className = '', hoverable = false, ...props
}) => (
  <div className={\`bg-[#111111] border border-[#262626] rounded-md transition-colors \${hoverable ? 'hover:border-[#383838]' : ''} \${className}\`} {...props}>
    {children}
  </div>
);`,
        description: 'Single elevation card container',
      },
    ],
    usageDocs: `import { Card } from '@/components/ui/Card';

export function ContainerDemo() {
  return (
    <Card hoverable className="p-4">
      <h3>Cluster Health</h3>
      <p>All nodes responding normally.</p>
    </Card>
  );
}`,
    previewStates: [
      { id: 'default', name: 'Default', description: 'Standard container with header, content and action footer', props: { hoverable: false } },
      { id: 'hoverable', name: 'Hoverable', description: 'Container with reactive border highlighting', props: { hoverable: true } },
    ],
    tags: ['container', 'layout', 'surface', 'primitive'],
    createdAt: '2026-03-04T00:00:00.000Z',
    updatedAt: '2026-03-04T00:00:00.000Z',
    publishedAt: '2026-03-04T00:00:00.000Z',
  },
  {
    id: 'cmp_tabs_05',
    name: 'Tabs',
    slug: 'tabs',
    description: 'Accessible segmented and underline tab controls for managing contextual views and filter states.',
    category: 'navigation',
    version: '1.3.0',
    accessLevel: 'FREE',
    status: 'PUBLISHED',
    dependencies: {},
    propsSchema: [
      { name: 'variant', type: "'line' | 'segmented'", required: false, default: "'line'", description: 'Underline tabs or button pill segment' },
      { name: 'tabs', type: 'TabItem[]', required: true, description: 'Tab descriptors with labels and count badges' },
    ],
    mainFile: 'src/components/ui/Tabs.tsx',
    files: [
      {
        path: 'src/components/ui/Tabs.tsx',
        content: `import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export const Tabs: React.FC<{ tabs: TabItem[]; activeId: string; onChange: (id: string) => void; variant?: 'line' | 'segmented' }> = ({
  tabs, activeId, onChange, variant = 'line'
}) => {
  return (
    <div className={variant === 'segmented' ? 'inline-flex p-1 bg-[#111111] border border-[#262626] rounded-md' : 'flex gap-6 border-b border-[#262626]'}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={activeId === tab.id ? 'bg-[#222222] text-[#FFFFFF] px-3 py-1 text-xs rounded' : 'text-[#8A8A8A] px-3 py-1 text-xs'}
        >
          {tab.label} {tab.count && <span className="ml-1 text-[10px] font-mono">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
};`,
        description: 'Accessible Tabs navigation primitive',
      },
    ],
    usageDocs: `import { Tabs } from '@/components/ui/Tabs';

export function Navigation() {
  const [tab, setTab] = useState('all');
  return (
    <Tabs
      tabs={[{ id: 'all', label: 'All Services' }, { id: 'active', label: 'Active', count: 3 }]}
      activeId={tab}
      onChange={setTab}
    />
  );
}`,
    previewStates: [
      { id: 'line', name: 'Line Underline', description: 'Subtle bottom hairline underline indicator', props: { variant: 'line' } },
      { id: 'segmented', name: 'Segmented Control', description: 'Contained button switch for local state filtering', props: { variant: 'segmented' } },
    ],
    tags: ['tabs', 'navigation', 'filter', 'switcher'],
    createdAt: '2026-03-05T00:00:00.000Z',
    updatedAt: '2026-03-05T00:00:00.000Z',
    publishedAt: '2026-03-05T00:00:00.000Z',
  },
  {
    id: 'cmp_datatable_06',
    name: 'DataTable',
    slug: 'data-table',
    description: 'Enterprise data grid with server/client multi-column sorting, tabular numeric figures, pagination, and zero layout shift.',
    category: 'data-display',
    version: '2.1.0',
    accessLevel: 'PREMIUM',
    status: 'PUBLISHED',
    dependencies: {
      'lucide-react': '^0.546.0',
    },
    propsSchema: [
      { name: 'columns', type: 'Column<T>[]', required: true, description: 'Column schema with sorting, alignment and custom cell renderers' },
      { name: 'data', type: 'T[]', required: true, description: 'Row data items array' },
      { name: 'pageSize', type: 'number', required: false, default: '10', description: 'Number of rows rendered per page' },
      { name: 'loading', type: 'boolean', required: false, default: 'false', description: 'Shows skeleton row placeholders' },
    ],
    mainFile: 'src/components/ui/DataTable.tsx',
    files: [
      {
        path: 'src/components/ui/DataTable.tsx',
        content: `import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export function DataTable<T extends Record<string, any>>({ columns, data, pageSize = 10 }: { columns: Column<T>[]; data: T[]; pageSize?: number }) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      return sortDir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }, [data, sortKey, sortDir]);

  return (
    <div className="w-full border border-[#262626] rounded-md bg-[#111111] overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#262626] bg-[#0E0E0E]">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => {
                  if (col.sortable) {
                    setSortKey(col.key);
                    setSortDir(sortKey === col.key && sortDir === 'asc' ? 'desc' : 'asc');
                  }
                }}
                className="py-2.5 px-3.5 text-left text-[11px] font-medium text-[#A3A3A3] uppercase tracking-wider cursor-pointer"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1C1C1C]">
          {sortedData.map((row, i) => (
            <tr key={i} className="hover:bg-[#161616]">
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-3.5 text-[#F5F5F5]">
                  {col.render ? col.render(row, i) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`,
        description: 'Complete high-performance DataTable component',
      },
    ],
    usageDocs: `import { DataTable } from '@/components/ui/DataTable';

export function TransactionsGrid() {
  const columns = [
    { key: 'id', header: 'Tx Hash' },
    { key: 'amount', header: 'Volume', align: 'right', sortable: true },
    { key: 'status', header: 'Settlement' },
  ];
  return <DataTable columns={columns} data={transactions} />;
}`,
    previewStates: [
      { id: 'default', name: 'Interactive Table', description: 'Fully sortable table with tabular figures and column alignment', props: {} },
    ],
    tags: ['table', 'grid', 'data', 'enterprise', 'premium'],
    createdAt: '2026-03-06T00:00:00.000Z',
    updatedAt: '2026-03-06T00:00:00.000Z',
    publishedAt: '2026-03-06T00:00:00.000Z',
  },
  {
    id: 'cmp_dialog_07',
    name: 'Dialog',
    slug: 'dialog',
    description: 'Accessible modal dialog primitive featuring keyboard focus trapping, backdrop escape listener, and smooth enter transitions.',
    category: 'overlays',
    version: '1.4.0',
    accessLevel: 'PREMIUM',
    status: 'PUBLISHED',
    dependencies: {
      'lucide-react': '^0.546.0',
    },
    propsSchema: [
      { name: 'open', type: 'boolean', required: true, description: 'Controls visibility of the modal dialog' },
      { name: 'onClose', type: '() => void', required: true, description: 'Callback invoked when backdrop or escape is triggered' },
      { name: 'title', type: 'string', required: true, description: 'Accessible modal header title' },
      { name: 'description', type: 'string', required: false, description: 'Subheader explanation text' },
    ],
    mainFile: 'src/components/ui/Dialog.tsx',
    files: [
      {
        path: 'src/components/ui/Dialog.tsx',
        content: `import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onClose, title, description, children, footer }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    if (open) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/80">
      <div className="w-full max-w-md bg-[#111111] border border-[#262626] rounded-md shadow-2xl p-4 text-[#F5F5F5]">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F1F1F]">
          <h2 className="text-sm font-semibold text-[#FFFFFF]">{title}</h2>
          <button onClick={onClose} className="text-[#737373] hover:text-[#FFFFFF]"><X className="w-4 h-4" /></button>
        </div>
        <div className="py-4 text-xs">{children}</div>
        {footer && <div className="pt-3 border-t border-[#1F1F1F] flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};`,
        description: 'Complete modal dialog overlay primitive',
      },
    ],
    usageDocs: `import { Dialog } from '@/components/ui/Dialog';

export function ConfirmModal() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onClose={() => setOpen(false)} title="Destroy Database Instance">
      <p>This action is irreversible.</p>
    </Dialog>
  );
}`,
    previewStates: [
      { id: 'default', name: 'Open Dialog Demo', description: 'Modal with backdrop, title, and action footer', props: { title: 'Revoke Security Credential' } },
    ],
    tags: ['modal', 'dialog', 'overlay', 'accessible', 'premium'],
    createdAt: '2026-03-07T00:00:00.000Z',
    updatedAt: '2026-03-07T00:00:00.000Z',
    publishedAt: '2026-03-07T00:00:00.000Z',
  },
  {
    id: 'cmp_dropdown_08',
    name: 'ActionDropdown',
    slug: 'action-dropdown',
    description: 'Compact contextual action menu with keyboard arrows, divider separation, hotkey shortcuts, and destructive styling.',
    category: 'navigation',
    version: '1.2.0',
    accessLevel: 'PREMIUM',
    status: 'PUBLISHED',
    dependencies: {
      'lucide-react': '^0.546.0',
    },
    propsSchema: [
      { name: 'items', type: 'DropdownItem[]', required: true, description: 'List of menu actions with shortcuts and handlers' },
      { name: 'trigger', type: 'React.ReactNode', required: true, description: 'Button or element that toggles the popover' },
    ],
    mainFile: 'src/components/ui/ActionDropdown.tsx',
    files: [
      {
        path: 'src/components/ui/ActionDropdown.tsx',
        content: `import React, { useState, useRef, useEffect } from 'react';

export const ActionDropdown: React.FC<{ trigger: React.ReactNode; items: any[] }> = ({ trigger, items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-[#111111] border border-[#262626] rounded-md shadow-xl py-1 z-50">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => { item.onClick?.(); setOpen(false); }}
              className="w-full px-3 py-1.5 text-xs text-left text-[#D4D4D4] hover:bg-[#1A1A1A] hover:text-[#FFFFFF] flex justify-between"
            >
              <span>{item.label}</span>
              {item.shortcut && <span className="font-mono text-[10px] text-[#525252]">{item.shortcut}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};`,
        description: 'Complete action dropdown menu implementation',
      },
    ],
    usageDocs: `import { ActionDropdown } from '@/components/ui/ActionDropdown';

export function RowActions() {
  return (
    <ActionDropdown
      trigger={<button>Options</button>}
      items={[{ label: 'Export JSON', shortcut: '⌘E' }]}
    />
  );
}`,
    previewStates: [
      { id: 'default', name: 'Trigger Menu', description: 'Contextual options menu with shortcuts and destructive action', props: {} },
    ],
    tags: ['menu', 'dropdown', 'actions', 'premium'],
    createdAt: '2026-03-08T00:00:00.000Z',
    updatedAt: '2026-03-08T00:00:00.000Z',
    publishedAt: '2026-03-08T00:00:00.000Z',
  },
  {
    id: 'cmp_draft_09',
    name: 'CommandPalette',
    slug: 'command-palette',
    description: 'Internal draft component for global fuzzy keyboard command execution.',
    category: 'navigation',
    version: '0.1.0-draft',
    accessLevel: 'PREMIUM',
    status: 'DRAFT',
    dependencies: {},
    propsSchema: [],
    mainFile: 'src/components/ui/CommandPalette.tsx',
    files: [
      {
        path: 'src/components/ui/CommandPalette.tsx',
        content: `export const CommandPalette = () => <div>Draft in progress</div>;`,
        description: 'Draft implementation',
      },
    ],
    usageDocs: `Draft usage docs`,
    previewStates: [
      { id: 'default', name: 'Draft State', description: 'Internal draft', props: {} },
    ],
    tags: ['internal', 'draft', 'wip'],
    createdAt: '2026-03-09T00:00:00.000Z',
    updatedAt: '2026-03-09T00:00:00.000Z',
    publishedAt: null,
  },
];
