import React from 'react';
import { CopyButton } from './CopyButton';

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
  maxHeight?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code = '',
  language = 'typescript',
  filename,
  showLineNumbers = false,
  className = '',
  maxHeight = 'max-h-[500px]',
}) => {
  const safeCode = typeof code === 'string' ? code : (code ? String(code) : '');
  const lines = safeCode.trim().split('\n');

  return (
    <div className={`bg-[#0A0A0A] border border-[#222222] rounded-md overflow-hidden flex flex-col ${className}`}>
      <div className="flex items-center justify-between px-3 py-2 bg-[#111111] border-b border-[#1E1E1E] text-xs">
        <div className="flex items-center gap-2">
          {filename ? (
            <span className="font-mono text-[#D4D4D4] font-medium text-[11px]">{filename}</span>
          ) : (
            <span className="font-mono text-[#737373] text-[11px] uppercase tracking-wider">{language}</span>
          )}
        </div>
        <CopyButton textToCopy={code} label="Copy" />
      </div>

      <div className={`p-4 overflow-x-auto ${maxHeight} font-mono text-xs leading-relaxed`}>
        <pre className="text-[#E5E5E5] m-0 p-0">
          <code>
            {showLineNumbers ? (
              <table className="border-collapse w-full">
                <tbody>
                  {lines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-[#141414]">
                      <td className="pr-4 select-none text-right text-[#404040] w-8 tabular-nums text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="whitespace-pre">{line || ' '}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
    </div>
  );
};
