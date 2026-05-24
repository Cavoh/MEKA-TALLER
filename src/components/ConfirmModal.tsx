import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--modal-bg)] rounded-3xl card-shadow w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-red-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-zinc-600 text-sm">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-zinc-200 rounded-lg font-bold text-zinc-600 hover:bg-zinc-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors text-sm"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
