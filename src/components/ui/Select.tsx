import React, { SelectHTMLAttributes } from 'react';
import { cn } from '../../utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
          {label}
        </label>
      )}
      <select
        className={cn(
          "w-full px-3 py-2 bg-[var(--input-bg)] border text-[var(--input-text)] rounded-lg outline-none text-sm transition-all focus:border-[var(--emphasis-color)] focus:ring-1 focus:ring-[var(--emphasis-color)]",
          error ? "border-red-500" : "border-[var(--input-border)]",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {options.length === 0 && props.children}
      </select>
      {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}
