import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center border border-[#222222] border-dashed rounded-md bg-[#0D0D0D] ${className}`}
    >
      <div className="w-10 h-10 rounded-md bg-[#161616] border border-[#262626] flex items-center justify-center text-[#737373] mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-[#FFFFFF] tracking-tight">{title}</h3>
      <p className="text-xs text-[#A3A3A3] max-w-sm mt-1 mb-4 leading-normal">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
