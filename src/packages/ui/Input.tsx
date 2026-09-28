import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, leftElement, rightElement, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <div className="relative flex items-center w-full">
          {leftElement && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[#737373]">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={`w-full h-9 bg-[#111111] text-[#F5F5F5] placeholder-[#525252] text-xs rounded-md border transition-colors ${
              error
                ? 'border-[#737373] focus:border-[#FFFFFF]'
                : 'border-[#262626] focus:border-[#FFFFFF]'
            } ${leftElement ? 'pl-9' : 'pl-3'} ${
              rightElement ? 'pr-9' : 'pr-3'
            } focus:outline-none focus:ring-1 focus:ring-[#FFFFFF] disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center text-[#737373]">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-[11px] text-[#A3A3A3]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
