import React, { useState } from 'react';
import { useAuth } from '../shared/AuthContext';
import { Button, Input, FormField, ErrorState, Card } from '../../packages/ui';
import { Shield, User, KeyRound, Check } from 'lucide-react';

export interface LoginPageProps {
  onSuccess: () => void;
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onNavigate }) => {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Authentication failed');
    }
  };

  const handleQuickLogin = async (eEmail: string, ePass: string) => {
    setEmail(eEmail);
    setPassword(ePass);
    setLoading(true);
    setError(null);
    const result = await login(eEmail, ePass);
    setLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Quick login failed');
    }
  };

  if (user) {
    return (
      <div className="w-full max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#161616] border border-[#2D2D2D] mx-auto flex items-center justify-center text-[#FFFFFF]">
          <Check className="w-6 h-6 text-[#FFFFFF]" />
        </div>
        <h2 className="text-lg font-semibold text-[#FFFFFF]">Already Signed In</h2>
        <p className="text-xs text-[#A3A3A3]">
          You are authenticated as <strong className="text-[#FFFFFF]">{user.email}</strong> ({user.tier.toUpperCase()} tier).
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="primary" onClick={() => onNavigate('/account')}>
            View Account
          </Button>
          <Button variant="outline" onClick={() => onNavigate('/components')}>
            Browse Components
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-[#FFFFFF]">Sign In to Tech Inject</h1>
        <p className="text-xs text-[#8A8A8A]">
          Access your component subscriptions, CLI credentials, and admin publisher controls.
        </p>
      </div>

      {/* Quick Access Test Accounts for Reviewer */}
      <div className="p-4 rounded-md border border-[#262626] bg-[#111111] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#FFFFFF] text-[11px] uppercase tracking-wider">
            Quick Test Accounts
          </span>
          <span className="text-[10px] text-[#737373]">1-Click Switch</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('free@techinject.dev', 'free123')}
            className="w-full p-2.5 rounded bg-[#161616] hover:bg-[#1E1E1E] border border-[#262626] text-left transition-colors flex items-center justify-between group cursor-pointer"
          >
            <div>
              <div className="text-xs font-semibold text-[#FFFFFF] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#737373]" />
                <span>Free Customer</span>
              </div>
              <div className="text-[11px] text-[#737373] mt-0.5">free@techinject.dev · free123</div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#222222] text-[#A3A3A3]">
              FREE
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('pro@techinject.dev', 'premium123')}
            className="w-full p-2.5 rounded bg-[#161616] hover:bg-[#1E1E1E] border border-[#262626] text-left transition-colors flex items-center justify-between group cursor-pointer"
          >
            <div>
              <div className="text-xs font-semibold text-[#FFFFFF] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#FFFFFF]" />
                <span>Premium Customer</span>
              </div>
              <div className="text-[11px] text-[#737373] mt-0.5">pro@techinject.dev · premium123</div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FFFFFF] text-[#000000] font-semibold">
              PREMIUM
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin@techinject.dev', 'admin123')}
            className="w-full p-2.5 rounded bg-[#161616] hover:bg-[#1E1E1E] border border-[#262626] text-left transition-colors flex items-center justify-between group cursor-pointer"
          >
            <div>
              <div className="text-xs font-semibold text-[#FFFFFF] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#FFFFFF]" />
                <span>Platform Administrator</span>
              </div>
              <div className="text-[11px] text-[#737373] mt-0.5">admin@techinject.dev · admin123</div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#2A2A2A] text-[#FFFFFF]">
              ADMIN
            </span>
          </button>
        </div>
      </div>

      {/* Manual Login Form */}
      <form onSubmit={handleSubmit} className="p-5 rounded-md border border-[#262626] bg-[#111111] space-y-4">
        {error && (
          <div className="p-2.5 rounded bg-[#181818] border border-[#333333] text-xs text-[#F5F5F5]">
            {error}
          </div>
        )}

        <FormField label="Email address" required>
          <Input
            type="email"
            placeholder="developer@techinject.dev"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </FormField>

        <FormField label="Password" required>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="w-full mt-2"
        >
          Sign In with Email
        </Button>
      </form>
    </div>
  );
};
