import React from 'react';
import { Lock, ShieldAlert } from 'lucide-react';
import { Button } from './Button';

export interface LockStateProps {
  reason?: 'SIGN_IN_REQUIRED' | 'PREMIUM_REQUIRED';
  componentName?: string;
  onLoginClick?: () => void;
  className?: string;
}

export const LockState: React.FC<LockStateProps> = ({
  reason = 'SIGN_IN_REQUIRED',
  componentName = 'Component',
  onLoginClick,
  className = '',
}) => {
  const isSignIn = reason === 'SIGN_IN_REQUIRED';

  return (
    <div
      className={`border border-[#262626] rounded-md bg-[#0E0E0E] p-8 sm:p-12 flex flex-col items-center text-center relative overflow-hidden ${className}`}
    >
      <div className="w-10 h-10 rounded-md bg-[#161616] border border-[#2D2D2D] flex items-center justify-center text-[#FFFFFF] mb-3">
        {isSignIn ? <Lock className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
      </div>

      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider text-[#A3A3A3] bg-[#161616] border border-[#262626] mb-2 uppercase">
        Premium Component
      </div>

      <h3 className="text-sm font-semibold text-[#FFFFFF] tracking-tight">
        {isSignIn ? 'Sign in to access source & preview' : 'Premium subscriber access required'}
      </h3>

      <p className="text-xs text-[#A3A3A3] max-w-md mt-1.5 mb-5 leading-relaxed">
        {isSignIn
          ? `The source files, functional preview, CLI install command, and AI agent prompt for ${componentName} are restricted to active Premium subscribers.`
          : `Your account is currently on the Free tier. Premium components include enterprise-grade features, source bundles, and direct CLI install rights.`}
      </p>

      <div className="flex items-center gap-3">
        {isSignIn ? (
          <Button variant="primary" size="sm" onClick={onLoginClick}>
            Sign In with Test Account
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#737373]">
              To grant premium: switch to Admin account or contact workspace admin.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
