import React, { useState, useEffect } from 'react';
import { CustomerUser, CustomerTier } from '../../packages/types';
import { Button, Breadcrumb, LoadingState, ErrorState, useToast, SearchInput } from '../../packages/ui';
import { Users, Shield, Check, X, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuth } from '../shared/AuthContext';

export interface AdminCustomersProps {
  onNavigate: (path: string) => void;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({ onNavigate }) => {
  const { token, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load customers list');
      const data = await res.json();
      setCustomers(data.customers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [token]);

  const handleToggleTier = async (customer: CustomerUser) => {
    const newTier: CustomerTier = customer.tier === 'premium' ? 'free' : 'premium';
    setActionLoadingId(customer.id);

    try {
      const res = await fetch(`/api/admin/customers/${customer.id}/tier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier: newTier }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update customer tier');

      showToast({
        title: newTier === 'premium' ? 'Premium Access Granted' : 'Premium Access Revoked',
        description: data.message,
        type: newTier === 'premium' ? 'success' : 'info',
      });

      await fetchCustomers();
      // Also refresh current user session in case admin changed themselves
      await refreshUser();
    } catch (err: any) {
      showToast({ title: 'Action Failed', description: err.message, type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = customers.filter((c) => {
    if (!search) return true;
    return c.email.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="w-full space-y-6 pb-20">
      <Breadcrumb
        items={[
          { label: 'Admin', onClick: () => onNavigate('/admin') },
          { label: 'Customer Management' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F1F1F]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#FFFFFF]">Customer Management</h1>
          <p className="text-xs text-[#8A8A8A] mt-0.5">
            Grant or revoke subscriber access tiers. Changes take effect on the very next HTTP request.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search customers..."
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading customers..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCustomers} />
      ) : (
        <div className="border border-[#262626] rounded-md overflow-hidden bg-[#111111]">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#262626] bg-[#0E0E0E] text-[#A3A3A3] text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Customer Email</th>
                <th className="py-2.5 px-3">Account ID</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Current Tier</th>
                <th className="py-2.5 px-3">Joined Date</th>
                <th className="py-2.5 px-3 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {filtered.map((cust) => {
                const isPremium = cust.tier === 'premium';
                return (
                  <tr key={cust.id} className="hover:bg-[#161616] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#FFFFFF]">
                      {cust.email}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#737373]">
                      {cust.id}
                    </td>
                    <td className="py-3 px-3 text-[#A3A3A3] uppercase text-[11px]">
                      {cust.role}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                          isPremium
                            ? 'bg-[#FFFFFF] text-[#000000]'
                            : 'bg-[#1C1C1C] text-[#A3A3A3] border border-[#262626]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isPremium ? 'bg-[#000000]' : 'bg-[#737373]'}`} />
                        {cust.tier.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#737373]">
                      {new Date(cust.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isPremium ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          loading={actionLoadingId === cust.id}
                          onClick={() => handleToggleTier(cust)}
                          leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
                        >
                          Revoke Premium
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          loading={actionLoadingId === cust.id}
                          onClick={() => handleToggleTier(cust)}
                          leftIcon={<Check className="w-3.5 h-3.5 text-[#000000]" />}
                        >
                          Grant Premium
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Access Enforcement Explainer */}
      <div className="p-4 rounded-md border border-[#262626] bg-[#0E0E0E] text-xs text-[#8A8A8A] space-y-1">
        <h4 className="font-semibold text-[#FFFFFF] text-xs">Immediate Dynamic Verification</h4>
        <p>
          When you revoke premium for a customer, their active session token is immediately updated in the persistent store.
          Their next request to download source files or run CLI installation commands will immediately fail with a 403 Forbidden status code.
        </p>
      </div>
    </div>
  );
};
