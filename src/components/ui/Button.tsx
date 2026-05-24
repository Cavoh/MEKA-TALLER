import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'pill' | 'outline';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function Button({ variant = 'primary', isLoading, children, className, ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--emphasis-color)] text-white py-2 px-4 rounded-lg text-xs uppercase tracking-widest flex-1 hover:brightness-110",
    secondary: "bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] py-2 px-4 rounded-lg text-xs uppercase tracking-widest hover:bg-[var(--table-row-hover)]",
    danger: "bg-red-500 text-white py-2 px-4 rounded-lg text-xs uppercase tracking-widest flex-1 hover:bg-red-600",
    ghost: "text-zinc-500 hover:text-zinc-700 py-2 px-4 rounded-lg text-xs uppercase tracking-widest",
    pill: "bg-[var(--emphasis-color)] text-white px-6 py-2 rounded-full text-[10px] uppercase tracking-widest shadow-sm hover:opacity-90 whitespace-nowrap",
    outline: "border border-[var(--border-main)] text-[var(--text-main)] hover:bg-[var(--table-row-hover)] px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest cursor-pointer"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], className)} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'Cargando...' : children}
    </button>
  );
}
