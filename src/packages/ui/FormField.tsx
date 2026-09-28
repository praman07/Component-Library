import React from 'react';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  optional,
  hint,
  error,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <label htmlFor={htmlFor} className="font-medium text-[#D4D4D4]">
          {label}
          {required && <span className="text-[#A3A3A3] ml-1">*</span>}
        </label>
        {optional && <span className="text-[11px] text-[#525252]">Optional</span>}
      </div>
      {children}
      {hint && !error && <p className="text-[11px] text-[#737373] leading-normal">{hint}</p>}
      {error && <p className="text-[11px] text-[#A3A3A3] leading-normal">{error}</p>}
    </div>
  );
};
