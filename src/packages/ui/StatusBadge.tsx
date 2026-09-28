import React from 'react';
import { ComponentStatus, AccessLevel } from '../types';

export interface StatusBadgeProps {
  status?: ComponentStatus;
  accessLevel?: AccessLevel;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  accessLevel,
  className = '',
}) => {
  if (accessLevel) {
    const isPremium = accessLevel === 'PREMIUM';
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium tracking-tight ${
          isPremium
            ? 'bg-[#1C1C1C] text-[#FFFFFF] border border-[#333333]'
            : 'bg-[#111111] text-[#A3A3A3] border border-[#222222]'
        } ${className}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isPremium ? 'bg-[#FFFFFF]' : 'bg-[#737373]'
          }`}
        />
        {isPremium ? 'PREMIUM' : 'FREE'}
      </span>
    );
  }

  if (status) {
    const statusConfig = {
      PUBLISHED: {
        label: 'Published',
        dot: 'bg-[#FFFFFF]',
        classes: 'bg-[#161616] text-[#F5F5F5] border border-[#262626]',
      },
      DRAFT: {
        label: 'Draft',
        dot: 'bg-[#737373]',
        classes: 'bg-[#111111] text-[#A3A3A3] border border-[#222222]',
      },
      UNPUBLISHED: {
        label: 'Unpublished',
        dot: 'bg-[#404040]',
        classes: 'bg-[#0D0D0D] text-[#737373] border border-[#1F1F1F]',
      },
    }[status];

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${statusConfig.classes} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
        {statusConfig.label}
      </span>
    );
  }

  return null;
};
