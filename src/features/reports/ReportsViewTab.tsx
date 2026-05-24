import React, { useState, useContext } from 'react';
import { WorkshopContext } from '../../context/WorkshopContext';
import { reportService } from '../../services/reportService';
import { useToast } from '../../components/ToastProvider';
import { format } from 'date-fns';
import { Database } from 'lucide-react';
import { generateReportHTML } from '../../utils/reportHTMLGenerator';

// Subcomponentes del Feature
import { ReportControlBar } from './ReportControlBar';
import { AnalyticsDashboard } from './AnalyticsDashboard';

// React Query Hooks
import { useAnalytics } from '../../hooks/queries/useReportsQuery';

export default function ReportsViewTab() {
  const { tenant } = useContext(WorkshopContext);
  const { showInfo, showError } = useToast();
  
  const [dateFrom, setDateFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isExporting, setIsExporting] = useState(false);

  // React Query: Fetching
  const { data: rawData, isLoading } = useAnalytics(tenant?.id || '', dateFrom, dateTo);

  // Procesamiento local de los datos para la UI (Charts)
  const analytics = React.useMemo(() => {
    if (!rawData) return { criticalStock: [], servicesData: [], dailyRevenue: [], topProducts: [], mechanicSales: [], salesDist: [] };
    
    const processed = reportService.processAnalytics(rawData);
    
    // Cálculos extras específicos para la vista
    const mechanicMap: Record<string, number> = {};
    rawData.invoices.forEach((inv: any) => {
      const name = inv.client_name?.split(' ')[0] || 'Personal';
      mechanicMap[name] = (mechanicMap[name] || 0) + Number(inv.total);
    });

    const paymentMap: Record<string, number> = {};
    rawData.invoices.forEach((inv: any) => {
      const type = inv.payment_type || 'EFECTIVO';
      paymentMap[type] = (paymentMap[type] || 0) + Number(inv.total);
    });

    return {
      ...processed,
      mechanicSales: Object.keys(mechanicMap)
        .map(k => ({ name: k, total: mechanicMap[k] }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6),
      salesDist: Object.keys(paymentMap).map(k => ({ name: k, value: paymentMap[k] }))
    };
  }, [rawData]);

  const openReportWindow = (data: any[], title: string, reportType: string, isAccounting: boolean = false) => {
    const headers = Object.keys(data[0]).filter(h => !h.toLowerCase().includes('id'));
    const filename = `reporte_${reportType.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}`;
    
    const html = generateReportHTML(data, headers, { title, filename, isAccounting });
    const win = window.open();
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const handleExportTable = async (tableName: string) => {
    if (!tableName || !tenant) return;
    setIsExporting(true);
    try {
      const data = await reportService.exportTable(tableName, tenant.id, dateFrom, dateTo);
      if (data.length === 0) { showInfo('Sin Datos', 'No hay registros en el rango seleccionado.'); return; }
      
      const tableTitles: Record<string, string> = {
        'meka_invoices': 'FACTURACIÓN',
        'meka_shipping': 'COMPRAS / ENTRADAS',
        'meka_inventory': 'INVENTARIO BODEGA',
        'meka_clients': 'BASE DE CLIENTES',
        'meka_maintenance': 'HISTORIAL MANTENIMIENTOS',
        'meka_arqueos_caja': 'ARQUEOS DE CAJA'
      };
      const title = tableTitles[tableName] || tableName.replace('meka_', '').toUpperCase();
      openReportWindow(data, title, tableName);
      
      const st = document.getElementById('export-db-select') as HTMLSelectElement;
      if (st) st.value = '';
    } catch (err: any) { showError('Error', err.message); } finally { setIsExporting(false); }
  };

  const handleExportAccounting = async (reportType: string) => {
    if (!reportType || !tenant) return;
    setIsExporting(true);
    try {
      const data = await reportService.exportAccountingReport(reportType, tenant.id);
      if (data.length === 0) { showInfo('Sin Datos', 'No hay registros contables.'); return; }
      
      const title = reportType.replace(/_/g, ' ').toUpperCase();
      openReportWindow(data, title, reportType, true);
      
      const st = document.getElementById('contabilidad-select') as HTMLSelectElement;
      if (st) st.value = '';
    } catch (err: any) { showError('Error', err.message); } finally { setIsExporting(false); }
  };

  if (isLoading && !analytics.dailyRevenue.length) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
      <Database className="w-12 h-12 text-[var(--emphasis-color)] animate-bounce" />
      <p className="font-black uppercase text-[10px] tracking-widest text-[var(--text-muted)]">Cargando Analítica...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <ReportControlBar 
        dateFrom={dateFrom} 
        setDateFrom={setDateFrom} 
        dateTo={dateTo} 
        setDateTo={setDateTo} 
        onExportTable={handleExportTable}
        onExportAccounting={handleExportAccounting}
      />
      
      {isExporting && (
        <div className="bg-[var(--emphasis-color)]/10 border border-[var(--emphasis-color)] p-4 rounded-2xl flex items-center justify-center gap-3 animate-pulse">
          <Database className="w-4 h-4 text-[var(--emphasis-color)]" />
          <span className="text-[10px] font-black uppercase text-[var(--emphasis-color)]">Generando Reporte...</span>
        </div>
      )}

      <AnalyticsDashboard analytics={analytics} />
    </div>
  );
}
