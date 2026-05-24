import React from 'react';
import { Wrench } from 'lucide-react';

export function SkeletonLoader() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center animate-pulse">
      <div className="bg-zinc-200 dark:bg-zinc-800 rounded-full p-6 mb-4">
        <Wrench className="w-10 h-10 text-zinc-400 opacity-20" />
      </div>
      <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-2"></div>
      <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-900 rounded-full"></div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-[var(--modal-bg)] rounded-2xl border border-[var(--border-main)] card-shadow overflow-hidden animate-pulse">
      <div className="h-10 bg-[var(--table-header-bg)] border-b border-[var(--table-divider)]"></div>
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-8 bg-zinc-100 dark:bg-zinc-900 rounded flex-1"></div>
            <div className="h-8 bg-zinc-100 dark:bg-zinc-900 rounded flex-1"></div>
            <div className="h-8 bg-zinc-100 dark:bg-zinc-900 rounded flex-1"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
