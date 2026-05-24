import { translationDict, formatReportValue } from './reportUtils';

export interface ReportConfig {
  title: string;
  subtitle?: string;
  filename: string;
  isAccounting?: boolean;
}

export const generateReportHTML = (data: any[], headers: string[], config: ReportConfig) => {
  const { title, filename, isAccounting } = config;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&display=swap');
        body { font-family: 'Outfit', sans-serif; padding: 25px; background-color: #f8fafc; color: #1e293b; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; }
        h1 { margin: 0; font-weight: 900; letter-spacing: -0.05em; color: #0f172a; font-style: italic; font-size: ${isAccounting ? '28px' : '24px'}; }
        .actions { display: flex; gap: 10px; }
        .btn { 
          border: none; padding: 8px 16px; border-radius: 10px; 
          font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer;
          transition: all 0.2s; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        .btn-excel { background-color: #10b981; color: white; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); opacity: 0.9; }
        
        .table-container { background: white; border-radius: 16px; overflow-x: auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); border: 1px solid #e2e8f0; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; min-width: 800px; }
        th { background: #f1f5f9; color: #64748b; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 12px; text-align: left; white-space: nowrap; }
        td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; color: #334155; white-space: nowrap; }
        tr:hover td { background-color: #f8fafc; }
        .total-row td { background-color: #f8fafc !important; font-weight: 900; color: #0f172a; border-top: 2px solid #e2e8f0; }
        
        /* Paginación UI */
        .pagination { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 20px; }
        .page-info { font-size: 12px; font-weight: 600; color: #64748b; }
        .btn-nav { background: white; color: #1e293b; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-nav:hover:not(:disabled) { background: #f1f5f9; border-color: #cbd5e1; }
        .btn-nav:disabled { opacity: 0.4; cursor: not-allowed; }

        @media print {
          .actions, .pagination { display: none; }
          body { padding: 0; background: white; }
          .table-container { box-shadow: none; border: none; border-radius: 0; }
          th { background: #eee !important; color: black !important; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <div class="actions">
          <button class="btn btn-excel" onclick="downloadCSV()">Exportar a Excel</button>
        </div>
      </div>
      
      <div id="report-content" class="table-container">
        <!-- Se llenará dinámicamente -->
      </div>

      <div class="pagination">
        <button id="prevBtn" class="btn-nav" onclick="changePage(-1)">Anterior</button>
        <span id="pageInfo" class="page-info">Página 1 de 1</span>
        <button id="nextBtn" class="btn-nav" onclick="changePage(1)">Siguiente</button>
      </div>

      <script>
        const reportData = ${JSON.stringify(data)};
        const rawHeaders = ${JSON.stringify(headers)};
        const translationDict = ${JSON.stringify(translationDict)};
        const filename = "${filename}";
        const PAGE_SIZE = 50;
        let currentPage = 1;
        const totalPages = Math.ceil(reportData.length / PAGE_SIZE);

        function formatVal(key, val) {
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') {
            if (Array.isArray(val)) {
              return val.map(it => it.description || it.name || it.item_name || JSON.stringify(it)).join(' | ');
            }
            return val.name || val.description || JSON.stringify(val);
          }
          return val.toString();
        }

        function renderPage(page) {
          const start = (page - 1) * PAGE_SIZE;
          const end = start + PAGE_SIZE;
          const pageData = reportData.slice(start, end);
          
          let html = '<table><thead><tr>';
          rawHeaders.forEach(h => {
             html += '<th>' + (translationDict[h.toLowerCase()] || h.toUpperCase()) + '</th>';
          });
          html += '</tr></thead><tbody>';
          
          pageData.forEach(row => {
            const isTotal = row['Producto']?.includes('TOTAL') || row['Proveedor']?.includes('TOTAL');
            html += '<tr class="' + (isTotal ? 'total-row' : '') + '">';
            rawHeaders.forEach(h => {
              html += '<td>' + formatVal(h, row[h]) + '</td>';
            });
            html += '</tr>';
          });
          
          html += '</tbody></table>';
          document.getElementById('report-content').innerHTML = html;
          document.getElementById('pageInfo').innerText = 'Página ' + page + ' de ' + totalPages;
          document.getElementById('prevBtn').disabled = (page === 1);
          document.getElementById('nextBtn').disabled = (page === totalPages);
        }

        function changePage(delta) {
          currentPage += delta;
          if (currentPage < 1) currentPage = 1;
          if (currentPage > totalPages) currentPage = totalPages;
          renderPage(currentPage);
          window.scrollTo(0, 0);
        }

        function downloadCSV() {
          const separator = ';'; 
          const csvRows = [];
          const headers = rawHeaders.map(h => translationDict[h.toLowerCase()] || h.toUpperCase());
          csvRows.push(headers.join(separator));
          
          reportData.forEach(row => {
            const values = rawHeaders.map(h => {
              let rawVal = row[h] ?? '';
              if (typeof rawVal === 'object') {
                if (Array.isArray(rawVal)) {
                  rawVal = rawVal.map(it => it.description || it.name || it.item_name || JSON.stringify(it)).join(' | ');
                } else { rawVal = rawVal.name || rawVal.description || JSON.stringify(rawVal); }
              }
              const val = rawVal.toString().replace(/"/g, '""');
              return '"' + val + '"';
            });
            csvRows.push(values.join(separator));
          });
          
          const csvString = "\\uFEFF" + csvRows.join('\\n');
          const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", filename + ".csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        renderPage(1);
      </script>
    </body>
    </html>
  `;
};
