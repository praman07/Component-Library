import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An error occurred',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`p-6 border border-[#333333] rounded-md bg-[#121212] flex flex-col items-center text-center max-w-md mx-auto ${className}`}
    >
      <div className="w-8 h-8 rounded bg-[#1C1C1C] border border-[#2D2D2D] flex items-center justify-center text-[#A3A3A3] mb-3">
        <AlertCircle className="w-4 h-4 text-[#FFFFFF]" />
      </div>
      <h3 className="text-xs font-semibold text-[#FFFFFF] tracking-tight">{title}</h3>
      <p className="text-xs text-[#A3A3A3] mt-1 mb-4 leading-normal">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
