import React from 'react';
import { 
  BarChart, Bar, 
  ComposedChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AlertTriangle, Calendar, TrendingUp, Settings, ArrowUpRight } from 'lucide-react';

const COLORS = ['#6366f1', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#22c55e'];

const CriticalStockTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 min-w-[200px] z-50">
        <p className="font-black text-[11px] uppercase text-gray-800 dark:text-gray-200 mb-2 border-b border-gray-50 dark:border-zinc-800 pb-2">{label}</p>
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-gray-500">
            Stock Actual: <span className="text-red-600 font-black">{data.stock} unidades</span>
          </p>
          <p className="text-[10px] font-bold text-gray-400">
            Stock Mínimo: <span className="text-gray-600 dark:text-gray-400 font-black">{data.minStock} unidades</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const CriticalStockChart = ({ data }: { data: any[] }) => (
  <div className="bg-[var(--modal-bg)] p-4 rounded-[1.5rem] card-shadow border border-[var(--border-main)]/30 group transition-all duration-300 hover:shadow-md">
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className="w-4 h-4 text-red-500" />
      <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Estado Crítico de Inventario</h3>
    </div>
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontStyle: 'italic', fontWeight: 900, fill: '#64748b', angle: -45, textAnchor: 'end' }} interval={0} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#cbd5e1' }} />
          <Tooltip content={<CriticalStockTooltip />} cursor={{ fill: 'var(--table-row-hover)', opacity: 0.2 }} />
          <Bar dataKey="stock" fill="#b91c1c" radius={[8, 8, 0, 0]} barSize={25} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const ServiceTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--modal-bg)] border border-[var(--border-main)]/30 p-4 rounded-2xl shadow-xl z-50 min-w-[200px]">
        <p className="font-black text-[10px] uppercase text-[var(--text-main)] mb-3 pb-2 border-b border-[var(--border-main)]/30">{label}</p>
        <p className="text-xs font-black text-blue-500 mb-3 drop-shadow-sm">Cantidad Total: {data.value}</p>
        
        {data.details && data.details.length > 0 && (
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
            {data.details.map((item: any, idx: number) => (
              <div key={idx} className="bg-[var(--text-main)] p-2.5 rounded-xl text-left shadow-md">
                <p className="text-[11px] font-black text-[var(--modal-bg)] uppercase tracking-widest">{item.plate}</p>
                <p className="text-[9px] font-bold text-[var(--modal-bg)]/80 opacity-90 truncate mt-0.5">{item.clientName}</p>
                <p className="text-[8px] font-bold text-[var(--modal-bg)]/60 opacity-80 mt-1">{item.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const ServiceStatsChart = ({ data }: { data: any[] }) => (
  <div className="bg-[var(--modal-bg)] p-4 rounded-[1.5rem] card-shadow border border-[var(--border-main)]/30 group transition-all duration-300 hover:shadow-md">
    <div className="flex items-center gap-2 mb-2">
      <Calendar className="w-4 h-4 text-blue-500" />
      <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Servicios en Periodo</h3>
    </div>
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#cbd5e1' }} />
          <Tooltip content={<ServiceTooltip />} cursor={{ fill: 'var(--table-row-hover)', opacity: 0.4 }} />
          <Bar dataKey="value" fill="#22d3ee" radius={[8, 8, 0, 0]} barSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const DailyRevenueChart = ({ data }: { data: any[] }) => (
  <div className="bg-[var(--modal-bg)] p-4 rounded-[1.5rem] card-shadow border border-[var(--border-main)]/30 group transition-all duration-300 hover:shadow-md md:col-span-2">
    <div className="flex items-center gap-2 mb-2">
      <ArrowUpRight className="w-4 h-4 text-orange-500" />
      <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Evolución de Ventas Diarias</h3>
    </div>
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#cbd5e1' }} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
          <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(val: number) => [`$${val.toLocaleString()}`, 'Ventas']} />
          <Bar dataKey="total" fill="#f59e0b" radius={[10, 10, 0, 0]} barSize={40} />
          <Line 
            type="linear" 
            dataKey="total" 
            stroke="#6366f1" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#fff', stroke: '#6366f1', strokeWidth: 2 }} 
            activeDot={{ r: 6 }}
            tooltipType="none"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const TopProductsChart = ({ data }: { data: any[] }) => (
  <div className="bg-[var(--modal-bg)] p-4 rounded-[1.5rem] card-shadow border border-[var(--border-main)]/30 group transition-all duration-300 hover:shadow-md">
    <div className="flex items-center gap-2 mb-2">
      <Settings className="w-4 h-4 text-emerald-500" />
      <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Top 10 Productos</h3>
    </div>
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontStyle: 'italic', fontWeight: 900, fill: 'var(--text-main)' }} width={150} />
          <Tooltip cursor={{ fill: 'var(--table-row-hover)', opacity: 0.1 }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(val: number) => [val, 'Unidades Vendidas']} />
          <Bar dataKey="count" fill="#10b981" radius={[0, 12, 12, 0]} barSize={25} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const SalesByMechanicChart = ({ data }: { data: any[] }) => (
  <div className="bg-[var(--modal-bg)] p-4 rounded-[1.5rem] card-shadow border border-[var(--border-main)]/30 group transition-all duration-300 hover:shadow-md md:col-span-2">
    <div className="flex items-center gap-2 mb-2">
      <TrendingUp className="w-4 h-4 text-indigo-500" />
      <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Ventas por Mecánico</h3>
    </div>
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} dy={15} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
          <Tooltip cursor={{ fill: 'var(--table-row-hover)', opacity: 0.1 }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(val: number) => [`$${val.toLocaleString()}`, 'Ventas']} />
          <Bar dataKey="total" fill="#818cf8" radius={[12, 12, 0, 0]} barSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const SalesDistributionChart = ({ data }: { data: any[] }) => (
  <div className="bg-[var(--modal-bg)] p-4 rounded-[1.5rem] card-shadow border border-[var(--border-main)]/30 group transition-all duration-300 hover:shadow-md">
    <div className="flex items-center gap-2 mb-2">
      <TrendingUp className="w-4 h-4 text-rose-500" />
      <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Distribución Ingresos</h3>
    </div>
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={data} 
            cx="50%" 
            cy="40%" 
            innerRadius={30} 
            outerRadius={50} 
            paddingAngle={2} 
            minAngle={15}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
          <Legend 
            iconType="circle" 
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', bottom: -5 }} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);
