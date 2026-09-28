import React, { useState, useEffect } from 'react';
import { AdminStats, ComponentRecord } from '../../packages/types';
import { Button, StatusBadge, LoadingState, ErrorState } from '../../packages/ui';
import { Layers, FileText, Lock, Users, Shield, Plus, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../shared/AuthContext';

export interface AdminDashboardProps {
  onNavigate: (path: string) => void;
  onEditComponent: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onEditComponent,
}) => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentComponents, setRecentComponents] = useState<ComponentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [statsRes, compsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/components', { headers }),
      ]);

      if (statsRes.status === 403 || compsRes.status === 403) {
        throw new Error('Access forbidden: You do not have administrator permissions.');
      }
      if (!statsRes.ok || !compsRes.ok) {
        throw new Error('Failed to load admin telemetry data.');
      }

      const statsData = await statsRes.json();
      const compsData = await compsRes.json();

      setStats(statsData.stats);
      setRecentComponents(compsData.components.slice(0, 5));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  if (loading) {
    return <LoadingState message="Loading platform dashboard..." />;
  }

  if (error) {
    return (
      <div className="space-y-4 max-w-md mx-auto py-12">
        <ErrorState
          title="Admin Access Restricted"
          message={error}
          onRetry={user?.role === 'admin' ? fetchAdminData : undefined}
        />
        {user?.role !== 'admin' && (
          <div className="text-center">
            <Button variant="primary" size="sm" onClick={() => onNavigate('/login')}>
              Sign In with Admin Account
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1F1F1F]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#FFFFFF]">Platform Overview</h1>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#222222] text-[#A3A3A3] border border-[#333333]">
              ADMIN
            </span>
          </div>
          <p className="text-xs text-[#8A8A8A] mt-0.5">
            Component publication pipeline, customer access tiers, and bundle registry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdminData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('/admin/components/new')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Component
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-md border border-[#262626] bg-[#111111]">
            <div className="flex items-center justify-between text-xs text-[#737373]">
              <span>Total Registry</span>
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-[#FFFFFF] tabular-nums">
              {stats.totalComponents}
            </div>
            <div className="mt-1 text-[11px] text-[#737373]">All bundles</div>
          </div>

          <div className="p-4 rounded-md border border-[#262626] bg-[#111111]">
            <div className="flex items-center justify-between text-xs text-[#737373]">
              <span>Published</span>
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-[#FFFFFF] tabular-nums">
              {stats.publishedCount}
            </div>
            <div className="mt-1 text-[11px] text-[#A3A3A3]">Active in catalogue</div>
          </div>

          <div className="p-4 rounded-md border border-[#262626] bg-[#111111]">
            <div className="flex items-center justify-between text-xs text-[#737373]">
              <span>Drafts</span>
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-[#FFFFFF] tabular-nums">
              {stats.draftCount}
            </div>
            <div className="mt-1 text-[11px] text-[#737373]">Hidden from public</div>
          </div>

          <div className="p-4 rounded-md border border-[#262626] bg-[#111111]">
            <div className="flex items-center justify-between text-xs text-[#737373]">
              <span>Premium Tier</span>
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-[#FFFFFF] tabular-nums">
              {stats.premiumCount}
            </div>
            <div className="mt-1 text-[11px] text-[#A3A3A3]">Gated components</div>
          </div>

          <div className="p-4 rounded-md border border-[#262626] bg-[#111111]">
            <div className="flex items-center justify-between text-xs text-[#737373]">
              <span>Customers</span>
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-[#FFFFFF] tabular-nums">
              {stats.customerCount}
            </div>
            <div className="mt-1 text-[11px] text-[#A3A3A3]">
              {stats.premiumCustomerCount} premium active
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => onNavigate('/admin/components')}
          className="p-5 rounded-md border border-[#262626] bg-[#111111] hover:border-[#383838] hover:bg-[#141414] transition-colors cursor-pointer group flex items-center justify-between"
        >
          <div>
            <h3 className="text-sm font-semibold text-[#FFFFFF] group-hover:text-[#FFFFFF] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#A3A3A3]" />
              <span>Component Registry Management</span>
            </h3>
            <p className="text-xs text-[#8A8A8A] mt-1">
              Review, edit, publish, or unpublish components across Free and Premium categories.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#737373] group-hover:text-[#FFFFFF] transition-colors shrink-0 ml-4" />
        </div>

        <div
          onClick={() => onNavigate('/admin/customers')}
          className="p-5 rounded-md border border-[#262626] bg-[#111111] hover:border-[#383838] hover:bg-[#141414] transition-colors cursor-pointer group flex items-center justify-between"
        >
          <div>
            <h3 className="text-sm font-semibold text-[#FFFFFF] group-hover:text-[#FFFFFF] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#A3A3A3]" />
              <span>Customer Access Control</span>
            </h3>
            <p className="text-xs text-[#8A8A8A] mt-1">
              Grant or revoke customer premium access tiers with immediate server enforcement.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#737373] group-hover:text-[#FFFFFF] transition-colors shrink-0 ml-4" />
        </div>
      </div>

      {/* Recent Components Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#FFFFFF]">Recent Components</h2>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('/admin/components')}>
            View all components
          </Button>
        </div>

        <div className="border border-[#262626] rounded-md overflow-hidden bg-[#111111]">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#262626] bg-[#0E0E0E] text-[#A3A3A3] text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Access</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {recentComponents.map((c) => (
                <tr key={c.id} className="hover:bg-[#161616]">
                  <td className="py-2.5 px-3 font-semibold text-[#FFFFFF]">
                    <div className="flex flex-col">
                      <span>{c.name}</span>
                      <span className="font-mono text-[10px] text-[#737373] font-normal">{c.slug}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#A3A3A3]">{c.category}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge accessLevel={c.accessLevel} />
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#737373]">v{c.version}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onEditComponent(c.id)}
                      className="text-xs text-[#FFFFFF] hover:text-[#E5E5E5] px-2 py-1 rounded bg-[#1C1C1C] border border-[#2D2D2D]"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
