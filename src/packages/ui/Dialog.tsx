import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/80 backdrop-blur-none animate-in fade-in duration-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={`relative w-full ${maxWidthStyles} bg-[#111111] border border-[#262626] rounded-md shadow-2xl flex flex-col max-h-[90vh] text-[#F5F5F5]`}
      >
        <div className="flex items-start justify-between p-4 border-b border-[#1F1F1F]">
          <div>
            <h2 id="dialog-title" className="text-sm font-semibold text-[#FFFFFF] tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-[#A3A3A3] mt-1 leading-normal">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#737373] hover:text-[#FFFFFF] transition-colors p-1 rounded focus:outline-none focus:ring-1 focus:ring-[#FFFFFF]"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto text-xs text-[#F5F5F5] space-y-4">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 p-4 border-t border-[#1F1F1F] bg-[#0E0E0E]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
