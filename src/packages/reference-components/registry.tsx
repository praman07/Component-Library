import React, { useState } from 'react';
import {
  Button,
  Badge,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Tabs,
  DataTable,
  Dialog,
  Dropdown,
} from '../ui';
import { Mail, Search, Trash2, Settings, Download, Share2, Check, AlertCircle } from 'lucide-react';

export function renderLiveComponent(slug: string, props: Record<string, any>, stateId: string): React.ReactNode {
  switch (slug) {
    case 'button':
      return (
        <div className="flex flex-wrap items-center gap-3">
          <Button {...props}>
            {props.label || 'Action Button'}
          </Button>
          {stateId === 'default' && (
            <>
              <Button variant="secondary" size="md">Secondary</Button>
              <Button variant="outline" size="md">Outline</Button>
              <Button variant="ghost" size="md">Ghost</Button>
            </>
          )}
        </div>
      );

    case 'input':
      return (
        <div className="w-full max-w-sm space-y-3">
          <Input
            {...props}
            defaultValue={props.defaultValue || ''}
            placeholder={props.placeholder || 'Enter your value...'}
          />
        </div>
      );

    case 'badge':
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Badge {...props}>{props.children || 'Production'}</Badge>
          {stateId === 'default' && (
            <>
              <Badge variant="outline">v2.4.0</Badge>
              <Badge variant="subtle">Draft</Badge>
              <Badge variant="contrast">Verified</Badge>
            </>
          )}
        </div>
      );

    case 'card':
      return (
        <div className="w-full max-w-md">
          <Card {...props}>
            <CardHeader>
              <CardTitle>{props.title || 'Deployment Configuration'}</CardTitle>
              <CardDescription>
                {props.description || 'Settings for edge worker runtime environments.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Persistent database sessions and node clusters are routed through local edge regions.
              </p>
            </CardContent>
            <CardFooter>
              <span>Region: asia-east1</span>
              <Button variant="outline" size="sm">Configure</Button>
            </CardFooter>
          </Card>
        </div>
      );

    case 'tabs':
      return <InteractiveTabsPreview {...props} />;

    case 'data-table':
      return <InteractiveDataTablePreview {...props} />;

    case 'dialog':
      return <InteractiveDialogPreview {...props} />;

    case 'action-dropdown':
      return <InteractiveDropdownPreview {...props} />;

    default:
      return (
        <div className="p-4 text-xs text-[#737373] border border-[#222222] rounded bg-[#111111]">
          Live preview for {slug}
        </div>
      );
  }
}

function InteractiveTabsPreview(props: Record<string, any>) {
  const [active, setActive] = useState('overview');
  return (
    <div className="w-full max-w-md space-y-4">
      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'analytics', label: 'Analytics', count: 12 },
          { id: 'settings', label: 'Settings' },
        ]}
        activeId={active}
        onChange={setActive}
        variant={props.variant || 'line'}
      />
      <div className="p-4 border border-[#222222] rounded bg-[#111111] text-xs text-[#A3A3A3]">
        Active Tab View: <span className="text-[#FFFFFF] font-medium font-mono">{active}</span>
      </div>
    </div>
  );
}

function InteractiveDataTablePreview(props: Record<string, any>) {
  const columns = [
    { key: 'id', header: 'ID', width: '70px' },
    { key: 'name', header: 'Package Name', sortable: true },
    { key: 'version', header: 'Version', align: 'center' as const },
    { key: 'downloads', header: 'Downloads', align: 'right' as const, sortable: true },
    { key: 'status', header: 'Status' },
  ];

  const sampleData = [
    { id: 'pkg-01', name: '@tech-inject/core', version: '2.4.0', downloads: '14,290', status: 'Active' },
    { id: 'pkg-02', name: '@tech-inject/tokens', version: '1.8.2', downloads: '8,410', status: 'Active' },
    { id: 'pkg-03', name: '@tech-inject/tables', version: '3.0.1', downloads: '22,900', status: 'Stable' },
    { id: 'pkg-04', name: '@tech-inject/cli', version: '1.2.0', downloads: '5,800', status: 'Updated' },
    { id: 'pkg-05', name: '@tech-inject/icons', version: '0.9.4', downloads: '3,210', status: 'Beta' },
  ];

  return (
    <div className="w-full max-w-xl">
      <DataTable
        columns={columns}
        data={sampleData}
        pageSize={4}
        keyExtractor={(row) => row.id}
        {...props}
      />
    </div>
  );
}

function InteractiveDialogPreview(props: Record<string, any>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open Modal Dialog
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={props.title || 'Revoke API Key'}
        description={props.description || 'This will immediately invalidate token access across all deployments.'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => setOpen(false)}>
              Confirm Action
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#A3A3A3] leading-relaxed">
          Applications using this credentials will receive 401 Unauthorized status responses immediately.
        </p>
      </Dialog>
    </div>
  );
}

function InteractiveDropdownPreview(props: Record<string, any>) {
  return (
    <Dropdown
      trigger={
        <Button variant="secondary" size="md">
          <span>Component Options</span>
        </Button>
      }
      items={[
        { id: 'export', label: 'Export Source Code', icon: <Download className="w-3.5 h-3.5" />, shortcut: '⌘E' },
        { id: 'share', label: 'Copy Share Link', icon: <Share2 className="w-3.5 h-3.5" />, shortcut: '⌘S' },
        'divider',
        { id: 'settings', label: 'View Properties', icon: <Settings className="w-3.5 h-3.5" /> },
        { id: 'delete', label: 'Unpublish Bundle', icon: <Trash2 className="w-3.5 h-3.5" />, destructive: true },
      ]}
      {...props}
    />
  );
}
