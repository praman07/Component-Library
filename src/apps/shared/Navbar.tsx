import React from 'react';
import { useAuth } from './AuthContext';
import { Button } from '../../packages/ui';
import { Shield, User, Terminal } from 'lucide-react';

export interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090909]/95 border-b border-[#262626] backdrop-blur-none">
      <div className="max-w-7xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('/')}
          className="text-sm font-semibold tracking-tight text-[#FFFFFF] hover:text-[#E5E5E5] transition-colors cursor-pointer select-none whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 bg-[#FFFFFF] rounded-none inline-block shrink-0" />
          <span>Tech Inject</span>
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#A3A3A3]">
          <button
            onClick={() => onNavigate('/components')}
            className={`transition-colors cursor-pointer whitespace-nowrap ${
              currentPath.startsWith('/components') ? 'text-[#FFFFFF] font-semibold' : 'hover:text-[#FFFFFF]'
            }`}
          >
            Components
          </button>
          <button
            onClick={() => onNavigate('/docs/getting-started')}
            className={`transition-colors cursor-pointer whitespace-nowrap ${
              currentPath === '/docs/getting-started' ? 'text-[#FFFFFF] font-semibold' : 'hover:text-[#FFFFFF]'
            }`}
          >
            Documentation
          </button>
          <button
            onClick={() => onNavigate('/admin')}
            className={`transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              currentPath.startsWith('/admin') ? 'text-[#FFFFFF] font-semibold' : 'hover:text-[#FFFFFF]'
            }`}
          >
            <Shield className="w-3 h-3 text-[#737373]" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <span
                className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono tracking-wider ${
                  user.role === 'admin'
                    ? 'bg-[#222222] text-[#FFFFFF] border border-[#333333]'
                    : user.tier === 'premium'
                    ? 'bg-[#1C1C1C] text-[#FFFFFF] border border-[#333333]'
                    : 'bg-[#141414] text-[#8A8A8A] border border-[#222222]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${user.tier === 'premium' || user.role === 'admin' ? 'bg-[#FFFFFF]' : 'bg-[#737373]'}`} />
                {user.role === 'admin' ? 'ADMIN' : user.tier.toUpperCase()}
              </span>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigate('/account')}
                leftIcon={<User className="w-3.5 h-3.5 text-[#A3A3A3]" />}
              >
                <span className="hidden sm:inline">{user.email.split('@')[0]}</span>
                <span className="sm:hidden">Account</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('/login')}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
