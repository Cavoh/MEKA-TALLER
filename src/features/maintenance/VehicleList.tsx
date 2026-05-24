import React from 'react';
import { Car, Lock, Unlock } from 'lucide-react';
import { MaintenanceRecord } from '../../types';
import { cn } from '../../utils';

interface VehicleListProps {
  records: MaintenanceRecord[];
  selectedPlate: string | undefined;
  onSelectPlate: (plate: string) => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({ records, selectedPlate, onSelectPlate }) => {
  const uniquePlates = Array.from(new Set(records.map(r => r.vehiclePlate)));

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
        <Car className="w-4 h-4" />
        Vehículos
      </h3>
      <div className="space-y-2">
        {uniquePlates.map((plate) => {
          const plateRecords = records.filter(r => r.vehiclePlate === plate);
          const hasOpen = plateRecords.some(r => r.status === 'open');
          const totalModules = plateRecords.reduce((sum, r) => sum + r.history.length, 0);

          return (
            <button
              key={plate}
              onClick={() => onSelectPlate(plate)}
              className={cn(
                "w-full p-4 rounded-xl border text-left transition-all group active:scale-[0.98]",
                selectedPlate === plate
                  ? "bg-[var(--emphasis-color)] border-[var(--emphasis-color)] text-white shadow-lg"
                  : "bg-[var(--modal-bg)] border-[var(--border-main)] text-[var(--text-main)] hover:border-[var(--emphasis-color)]"
              )}
            >
              <div className="flex justify-between items-start">
                <p className="text-lg font-black tracking-tighter uppercase">{plate}</p>
                {!hasOpen 
                  ? <Lock className={cn("w-3 h-3 opacity-50", selectedPlate === plate ? "text-white" : "text-zinc-500")} /> 
                  : <Unlock className={cn("w-4 h-4 drop-shadow-md", selectedPlate === plate ? "text-emerald-400" : "text-red-500")} />
                }
              </div>
              <p className={cn(
                "text-[10px] uppercase font-bold tracking-widest mt-1",
                selectedPlate === plate ? "text-zinc-400" : "text-zinc-500"
              )}>
                {totalModules} Servicios en total
              </p>
            </button>
          );
        })}
        {uniquePlates.length === 0 && (
          <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-dashed border-[var(--border-main)] rounded-xl py-12 px-4 text-center">
            <Car className="w-8 h-8 text-zinc-200 mx-auto mb-2 opacity-20" />
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">No hay vehículos registrados para este periodo</p>
          </div>
        )}
      </div>
    </div>
  );
};
