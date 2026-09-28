import React, { useState, useEffect } from 'react';
import { ComponentRecord, ComponentStatus, AccessLevel } from '../../packages/types';
import {
  Button,
  StatusBadge,
  SearchInput,
  Breadcrumb,
  LoadingState,
  ErrorState,
  useToast,
  Dialog,
} from '../../packages/ui';
import { Plus, Edit3, Globe, EyeOff, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../shared/AuthContext';
import { HARDCODED_COMPONENTS } from '../../../server/hardcodedData';

export interface AdminComponentsListProps {
  onNavigate: (path: string) => void;
  onEditComponent: (id: string) => void;
  onViewComponentPublic: (slug: string) => void;
}

export const AdminComponentsList: React.FC<AdminComponentsListProps> = ({
  onNavigate,
  onEditComponent,
  onViewComponentPublic,
}) => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [components, setComponents] = useState<ComponentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Dialog for delete confirmation (NO native confirm() or alert())
  const [deleteTarget, setDeleteTarget] = useState<ComponentRecord | null>(null);

  const fetchComponents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/components', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn('Non-JSON response from /api/admin/components:', text);
      }

      if (res.ok && data?.components) {
        setComponents(data.components);
      } else if (HARDCODED_COMPONENTS && HARDCODED_COMPONENTS.length > 0) {
        setComponents(HARDCODED_COMPONENTS as any);
      } else {
        throw new Error(data?.error || 'Failed to load components');
      }
    } catch (err: any) {
      if (HARDCODED_COMPONENTS && HARDCODED_COMPONENTS.length > 0) {
        setComponents(HARDCODED_COMPONENTS as any);
      } else {
        setError(err.message || 'Failed to load components');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, [token]);

  const handlePublish = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/components/${id}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      let data: any = null;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch (e) {}

      showToast({
        title: 'Component Published',
        description: data?.message || 'Component published successfully.',
        type: 'success',
      });
      setComponents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'PUBLISHED' } : c))
      );
      await fetchComponents();
    } catch (err: any) {
      showToast({ title: 'Publish Failed', description: err.message, type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnpublish = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/components/${id}/unpublish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      let data: any = null;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch (e) {}

      showToast({
        title: 'Component Unpublished',
        description: data?.message || 'Component unpublished.',
        type: 'info',
      });
      setComponents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'UNPUBLISHED' } : c))
      );
      await fetchComponents();
    } catch (err: any) {
      showToast({ title: 'Unpublish Failed', description: err.message, type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    try {
      const res = await fetch(`/api/admin/components/${targetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      let data: any = null;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch (e) {}

      showToast({
        title: 'Component Deleted',
        description: data?.message || 'Component removed.',
        type: 'success',
      });
      setComponents((prev) => prev.filter((c) => c.id !== targetId));
      setDeleteTarget(null);
      await fetchComponents();
    } catch (err: any) {
      showToast({ title: 'Delete Failed', description: err.message, type: 'error' });
    }
  };

  const filtered = components.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full space-y-6 pb-20">
      <Breadcrumb
        items={[
          { label: 'Admin', onClick: () => onNavigate('/admin') },
          { label: 'Components' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F1F1F]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#FFFFFF]">Component Registry</h1>
          <p className="text-xs text-[#8A8A8A] mt-0.5">
            Manage drafts, publication states, and source bundles.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onNavigate('/admin/components/new')}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          New Component
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'PUBLISHED', 'DRAFT', 'UNPUBLISHED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#222222] text-[#FFFFFF]'
                  : 'text-[#737373] hover:text-[#FFFFFF] hover:bg-[#161616]'
              }`}
            >
              {st === 'all' ? 'All Statuses' : st}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search by name or slug..."
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState message="Loading components table..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchComponents} />
      ) : (
        <div className="border border-[#262626] rounded-md overflow-hidden bg-[#111111]">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#262626] bg-[#0E0E0E] text-[#A3A3A3] text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Component</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Tier</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Files</th>
                  <th className="py-2.5 px-3">Last Updated</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C]">
                {filtered.map((comp) => (
                  <tr key={comp.id} className="hover:bg-[#161616] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#FFFFFF]">
                      <div className="flex flex-col">
                        <span>{comp.name}</span>
                        <span className="font-mono text-[10px] text-[#737373] font-normal">{comp.slug}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#A3A3A3]">{comp.category}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge accessLevel={comp.accessLevel} />
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={comp.status} />
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#737373]">
                      {comp.files.length} file{comp.files.length === 1 ? '' : 's'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#737373]">
                      {new Date(comp.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditComponent(comp.id)}
                          title="Edit component details"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#A3A3A3]" />
                        </Button>

                        {comp.status === 'PUBLISHED' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewComponentPublic(comp.slug)}
                              title="View public catalogue page"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[#A3A3A3]" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              loading={actionLoadingId === comp.id}
                              onClick={() => handleUnpublish(comp.id)}
                            >
                              Unpublish
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={actionLoadingId === comp.id}
                            onClick={() => handlePublish(comp.id)}
                          >
                            Publish
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(comp)}
                          title="Delete component"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#737373] hover:text-[#FFFFFF]" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Component Permanently"
        description={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be reversed.`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Confirm Deletion
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#A3A3A3] leading-relaxed">
          Deleting this component removes its source files from disk and terminates all active CLI install endpoints for this slug.
        </p>
      </Dialog>
    </div>
  );
};
