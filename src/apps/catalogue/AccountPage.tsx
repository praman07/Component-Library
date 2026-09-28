import React from 'react';
import { useAuth } from '../shared/AuthContext';
import { Button, StatusBadge, Breadcrumb, Card } from '../../packages/ui';
import { User, Shield, KeyRound, LogOut, Check, X, ArrowRight } from 'lucide-react';

export interface AccountPageProps {
  onNavigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { user, token, logout } = useAuth();

  if (!user) {
    return (
      <div className="w-full max-w-md mx-auto py-12 text-center space-y-4">
        <h2 className="text-lg font-semibold text-[#FFFFFF]">Account Access Required</h2>
        <p className="text-xs text-[#A3A3A3]">
          Please sign in to view your tier status and access permissions.
        </p>
        <Button variant="primary" onClick={() => onNavigate('/login')}>
          Sign In
        </Button>
      </div>
    );
  }

  const isPremium = user.tier === 'premium' || user.role === 'admin';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-20">
      <Breadcrumb
        items={[
          { label: 'Home', onClick: () => onNavigate('/') },
          { label: 'Account Profile' },
        ]}
      />

      {/* Account Info Card */}
      <div className="p-6 rounded-md border border-[#262626] bg-[#111111] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E1E1E]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-[#181818] border border-[#2B2B2B] flex items-center justify-center text-[#FFFFFF]">
              {user.role === 'admin' ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#FFFFFF]">{user.email}</h1>
              <p className="text-xs text-[#737373] mt-0.5">
                Account ID: <code className="font-mono text-[#A3A3A3]">{user.id}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wider text-[#737373]">Current Tier</span>
              <span
                className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded mt-0.5 ${
                  isPremium
                    ? 'bg-[#FFFFFF] text-[#000000]'
                    : 'bg-[#1C1C1C] text-[#A3A3A3] border border-[#262626]'
                }`}
              >
                {user.role === 'admin' ? 'ADMIN (UNRESTRICTED)' : user.tier.toUpperCase()}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
                onNavigate('/login');
              }}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* CLI Token */}
        {token && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#FFFFFF] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#737373]" />
                <span>CLI Session Token</span>
              </span>
              <span className="text-[11px] text-[#737373]">Valid for 7 days</span>
            </div>
            <div className="p-3 rounded bg-[#0A0A0A] border border-[#222222] font-mono text-xs text-[#A3A3A3] flex items-center justify-between gap-3">
              <span className="truncate">{token}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(token);
                }}
                className="text-[11px] text-[#FFFFFF] hover:text-[#E5E5E5] px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#2B2B2B] shrink-0"
              >
                Copy Token
              </button>
            </div>
            <p className="text-[11px] text-[#737373]">
              Use this token with the CLI: <code className="text-[#A3A3A3]">npx tech-inject add &lt;slug&gt; --token="{token.substring(0, 14)}..."</code>
            </p>
          </div>
        )}
      </div>

      {/* Access Matrix Table */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#FFFFFF] tracking-tight">Access Control Matrix</h2>
          <p className="text-xs text-[#8A8A8A] mt-0.5">
            Real-time permissions enforced by the backend on each request:
          </p>
        </div>

        <div className="border border-[#262626] rounded-md overflow-hidden bg-[#111111]">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#262626] bg-[#0E0E0E] text-[#A3A3A3] text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Resource / Operation</th>
                <th className="py-2.5 px-3">Free Tier</th>
                <th className="py-2.5 px-3">Premium Tier</th>
                <th className="py-2.5 px-3 text-right">Your Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              <tr className="hover:bg-[#141414]">
                <td className="py-2.5 px-3 font-medium text-[#FFFFFF]">Free Component Previews & Docs</td>
                <td className="py-2.5 px-3 text-[#A3A3A3]">Full Access</td>
                <td className="py-2.5 px-3 text-[#A3A3A3]">Full Access</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="inline-flex items-center gap-1 text-[#FFFFFF] font-mono text-[11px]">
                    <Check className="w-3.5 h-3.5 text-[#FFFFFF]" /> GRANTED
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#141414]">
                <td className="py-2.5 px-3 font-medium text-[#FFFFFF]">Free Component CLI Installation</td>
                <td className="py-2.5 px-3 text-[#A3A3A3]">Full Access</td>
                <td className="py-2.5 px-3 text-[#A3A3A3]">Full Access</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="inline-flex items-center gap-1 text-[#FFFFFF] font-mono text-[11px]">
                    <Check className="w-3.5 h-3.5 text-[#FFFFFF]" /> GRANTED
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#141414]">
                <td className="py-2.5 px-3 font-medium text-[#FFFFFF]">Premium Component Source Download</td>
                <td className="py-2.5 px-3 text-[#525252]">Locked (403)</td>
                <td className="py-2.5 px-3 text-[#A3A3A3]">Full Access</td>
                <td className="py-2.5 px-3 text-right">
                  {isPremium ? (
                    <span className="inline-flex items-center gap-1 text-[#FFFFFF] font-mono text-[11px]">
                      <Check className="w-3.5 h-3.5 text-[#FFFFFF]" /> GRANTED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[#737373] font-mono text-[11px]">
                      <X className="w-3.5 h-3.5 text-[#737373]" /> LOCKED
                    </span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-[#141414]">
                <td className="py-2.5 px-3 font-medium text-[#FFFFFF]">Premium Component CLI Installation</td>
                <td className="py-2.5 px-3 text-[#525252]">Locked (403)</td>
                <td className="py-2.5 px-3 text-[#A3A3A3]">Full Access</td>
                <td className="py-2.5 px-3 text-right">
                  {isPremium ? (
                    <span className="inline-flex items-center gap-1 text-[#FFFFFF] font-mono text-[11px]">
                      <Check className="w-3.5 h-3.5 text-[#FFFFFF]" /> GRANTED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[#737373] font-mono text-[11px]">
                      <X className="w-3.5 h-3.5 text-[#737373]" /> LOCKED
                    </span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-[#141414]">
                <td className="py-2.5 px-3 font-medium text-[#FFFFFF]">AI Agent Integration Prompts (Premium)</td>
                <td className="py-2.5 px-3 text-[#525252]">Locked (403)</td>
                <td className="py-2.5 px-3 text-[#A3A3A3]">Full Access</td>
                <td className="py-2.5 px-3 text-right">
                  {isPremium ? (
                    <span className="inline-flex items-center gap-1 text-[#FFFFFF] font-mono text-[11px]">
                      <Check className="w-3.5 h-3.5 text-[#FFFFFF]" /> GRANTED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[#737373] font-mono text-[11px]">
                      <X className="w-3.5 h-3.5 text-[#737373]" /> LOCKED
                    </span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-[#141414]">
                <td className="py-2.5 px-3 font-medium text-[#FFFFFF]">Admin Publishing Console</td>
                <td className="py-2.5 px-3 text-[#525252]">Forbidden (403)</td>
                <td className="py-2.5 px-3 text-[#525252]">Forbidden (403)</td>
                <td className="py-2.5 px-3 text-right">
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1 text-[#FFFFFF] font-mono text-[11px]">
                      <Check className="w-3.5 h-3.5 text-[#FFFFFF]" /> ADMIN
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[#737373] font-mono text-[11px]">
                      <X className="w-3.5 h-3.5 text-[#737373]" /> DENIED
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {user.role === 'admin' && (
        <div className="p-4 rounded-md border border-[#333333] bg-[#141414] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-[#FFFFFF]">Platform Administration</h3>
            <p className="text-xs text-[#8A8A8A] mt-0.5">
              You have administrator privileges to publish components, manage drafts, and grant/revoke customer access.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => onNavigate('/admin')} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Open Admin Console
          </Button>
        </div>
      )}
    </div>
  );
};
