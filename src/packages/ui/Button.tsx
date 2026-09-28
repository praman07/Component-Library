import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-colors select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFFFFF] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs';

    const sizeStyles = {
      sm: 'h-8 px-2.5 gap-1.5 text-xs',
      md: 'h-9 px-3.5 gap-2 text-xs',
      lg: 'h-10 px-4 gap-2 text-sm',
      icon: 'h-9 w-9 p-0 flex items-center justify-center',
    }[size];

    const variantStyles = {
      primary:
        'bg-[#FFFFFF] text-[#000000] hover:bg-[#E5E5E5] active:bg-[#CCCCCC] disabled:hover:bg-[#FFFFFF]',
      secondary:
        'bg-[#161616] text-[#F5F5F5] border border-[#262626] hover:bg-[#222222] hover:border-[#333333] active:bg-[#282828]',
      outline:
        'bg-transparent text-[#F5F5F5] border border-[#262626] hover:border-[#444444] hover:bg-[#161616] active:bg-[#222222]',
      ghost:
        'bg-transparent text-[#A3A3A3] hover:text-[#FFFFFF] hover:bg-[#161616] active:bg-[#222222]',
      destructive:
        'bg-[#222222] text-[#F5F5F5] border border-[#444444] hover:bg-[#2c2c2c] active:bg-[#333333]',
    }[variant];

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children && <span>{children}</span>}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
