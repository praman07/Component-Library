import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'subtle' | 'contrast';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const base = 'inline-flex items-center font-medium rounded tracking-normal select-none';
  const sizes = {
    sm: 'px-1.5 py-0.5 text-[11px] gap-1',
    md: 'px-2 py-0.5 text-xs gap-1.5',
  }[size];

  const variants = {
    default: 'bg-[#161616] text-[#F5F5F5] border border-[#262626]',
    outline: 'bg-transparent text-[#A3A3A3] border border-[#262626]',
    subtle: 'bg-[#0F0F0F] text-[#737373]',
    contrast: 'bg-[#FFFFFF] text-[#000000]',
  }[variant];

  return (
    <span className={`${base} ${sizes} ${variants} ${className}`} {...props}>
      {children}
    </span>
  );
};
