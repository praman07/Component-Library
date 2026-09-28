import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from './Toast';

export interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  toastMessage?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label,
  toastMessage = 'Copied to clipboard',
  size = 'sm',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for non-secure context or iframe
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      showToast({
        title: toastMessage,
        type: 'success',
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast({
        title: 'Failed to copy',
        description: 'Please copy manually.',
        type: 'error',
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 font-medium rounded transition-colors text-[#A3A3A3] hover:text-[#FFFFFF] hover:bg-[#1F1F1F] p-1.5 focus:outline-none focus:ring-1 focus:ring-[#FFFFFF] cursor-pointer ${className}`}
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-[#FFFFFF]" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
      {label && <span className="text-xs">{copied ? 'Copied' : label}</span>}
    </button>
  );
};
