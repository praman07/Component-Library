import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  className?: string;
  rows?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading components...',
  className = '',
  rows,
}) => {
  if (rows) {
    return (
      <div className={`space-y-2.5 w-full ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-full bg-[#141414] border border-[#222222] rounded-md animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <Loader2 className="w-5 h-5 animate-spin text-[#FFFFFF] mb-3" />
      <p className="text-xs text-[#737373] tracking-wide">{message}</p>
    </div>
  );
};
