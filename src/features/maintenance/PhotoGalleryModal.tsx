import React from 'react';
import { X, Camera, Trash2 } from 'lucide-react';

interface PhotoGalleryModalProps {
  photos: string[];
  isClosed: boolean;
  isUploading: boolean;
  onClose: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (idx: number) => void;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  photos,
  isClosed,
  isUploading,
  onClose,
  onUpload,
  onDelete
}) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[var(--modal-bg)] rounded-[32px] card-shadow w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 border border-[var(--border-main)]">
        <div className="bg-zinc-900 p-8 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">Galería de Evidencias</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Historial fotográfico del servicio</p>
          </div>
          <button 
            onClick={onClose} 
            className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-zinc-400 hover:text-white transition-all active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8">
          {!isClosed && (
            <div className="mb-8">
              <label className="group flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[var(--border-main)] rounded-[2rem] cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 hover:border-zinc-400 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploading ? (
                    <>
                      <div className="w-10 h-10 mb-4 border-4 border-zinc-200 border-t-[var(--emphasis-color)] rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest">Sincronizando archivos...</p>
                    </>
                  ) : (
                    <>
                      <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8 text-[var(--emphasis-color)]" />
                      </div>
                      <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">
                        <span className="text-zinc-900 dark:text-white">Haz clic o arrastra</span> para subir fotos
                      </p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" multiple disabled={isUploading} onChange={onUpload} />
              </label>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-h-[450px] overflow-y-auto no-scrollbar p-2">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative group aspect-square rounded-[1.5rem] overflow-hidden border border-[var(--border-main)] bg-zinc-100 dark:bg-zinc-800 shadow-sm">
                <img 
                  src={photo} 
                  alt={`Evidencia ${idx + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  loading="lazy"
                />
                {!isClosed && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => onDelete(idx)}
                      className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 active:scale-90 transition-all shadow-lg"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {photos.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-[var(--border-main)] rounded-[2rem] opacity-50">
                <Camera className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">No se han registrado evidencias visuales</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
