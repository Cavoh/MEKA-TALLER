import React, { InputHTMLAttributes } from 'react';
import { cn } from '../../utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-[var(--text-muted)] flex items-center justify-center h-full">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "w-full px-3 py-2 bg-[var(--input-bg)] border text-[var(--input-text)] rounded-lg outline-none text-sm transition-all focus:border-[var(--emphasis-color)] focus:ring-1 focus:ring-[var(--emphasis-color)]",
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-[var(--input-border)]",
            icon ? "pl-10" : "",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}
