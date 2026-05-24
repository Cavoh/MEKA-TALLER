import { describe, it, expect, vi, beforeEach } from 'vitest';
import { differenceInHours, startOfDay, parseISO, format } from 'date-fns';

describe('Caja - Flujo de Arqueo y Lógica de Negocio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Cálculo de Total Esperado (Sistema)', () => {
    it('debería calcular correctamente el flujo esperado sumando bases de apertura y ventas', () => {
      // Mock de bases de apertura
      const bases = { efectivo: 100000, tarjetaDebito: 0, tarjetaCredito: 0, nequi: 50000, daviplata: 0 };
      // Mock de ventas del día
      const ventas = { efectivo: 250000, tarjetaDebito: 50000, tarjetaCredito: 100000, nequi: 0, daviplata: 30000 };

      // Lógica utilizada en CierreCajaModal
      const expected = {
        efectivo: bases.efectivo + ventas.efectivo,
        tarjetaDebito: bases.tarjetaDebito + ventas.tarjetaDebito,
        tarjetaCredito: bases.tarjetaCredito + ventas.tarjetaCredito,
        nequi: bases.nequi + ventas.nequi,
        daviplata: bases.daviplata + ventas.daviplata
      };

      const totalEsperado = expected.efectivo + expected.tarjetaDebito + expected.tarjetaCredito + expected.nequi + expected.daviplata;

      // Verificaciones
      expect(expected.efectivo).toBe(350000); // 100k base + 250k ventas
      expect(expected.tarjetaDebito).toBe(50000);
      expect(expected.tarjetaCredito).toBe(100000);
      expect(expected.nequi).toBe(50000); // 50k base + 0 ventas
      expect(expected.daviplata).toBe(30000);
      expect(totalEsperado).toBe(580000); // Suma global
    });
  });

  describe('Validación de Tiempo (Alerta Caja Abierta > 24h)', () => {
    it('debería generar alerta (isOverdue = true) si han pasado más de 24 horas', () => {
      // Configuramos una apertura hace más de 24 horas
      const fechaApertura = '2026-04-06T10:00:00.000Z';
      const currentTime = new Date('2026-04-07T12:00:00.000Z'); // 26 horas después
      
      const isOverdue = differenceInHours(currentTime, new Date(fechaApertura)) >= 24;
      
      expect(isOverdue).toBe(true);
    });

    it('no debería generar alerta (isOverdue = false) si está dentro del límite de 24h', () => {
      // Apertura hoy mismo
      const fechaApertura = '2026-04-07T08:00:00.000Z';
      const currentTime = new Date('2026-04-07T18:00:00.000Z'); // 10 horas después
      
      const isOverdue = differenceInHours(currentTime, new Date(fechaApertura)) >= 24;
      
      expect(isOverdue).toBe(false);
    });
  });

  describe('Sincronización Automática de Filtros de Fecha para el Arqueo', () => {
    // Al cerrar caja (ReportsTab), si el filtro de fecha actual no incluye el día de la apertura,
    // el sistema ajusta 'dateFrom' automáticamente para garantizar que traiga de BD todas las ventas
    
    it('debería indicar ajuste de dateFrom si la fecha de apertura es anterior al filtro', () => {
      const cajaAbierta = { fecha_apertura: '2026-04-05T15:00:00Z' }; // 5 de Abril
      const dateFromFiltro = '2026-04-07'; // Filtro UI está configurado para 7 de Abril ("Hoy")

      const apertura = startOfDay(new Date(cajaAbierta.fecha_apertura));
      const currentFrom = startOfDay(parseISO(dateFromFiltro));
      
      const necesitaAjuste = apertura < currentFrom;
      const nuevoFiltroAplicado = format(apertura, 'yyyy-MM-dd');
      
      expect(necesitaAjuste).toBe(true); // Se debe ajustar porque 5 de Abri es < 7 de Abril
      expect(nuevoFiltroAplicado).toBe('2026-04-05'); // El filtro se debe retroceder al 5 de Abril
    });

    it('no debería ajustar el filtro si éste ya abarca o es igual a la fecha de apertura', () => {
      const cajaAbierta = { fecha_apertura: '2026-04-07T09:00:00Z' }; // 7 de Abril
      const dateFromFiltro = '2026-04-07'; // Filtro UI está para 7 de Abril ("Hoy")

      const apertura = startOfDay(new Date(cajaAbierta.fecha_apertura));
      const currentFrom = startOfDay(parseISO(dateFromFiltro));
      
      const necesitaAjuste = apertura < currentFrom;
      
      expect(necesitaAjuste).toBe(false); // No se ajusta porque coinciden
    });
  });

  describe('Flujos de Cartera y Proveedores (Abonos)', () => {
    it('debería calcular abonos CxC y CxP de forma independiente al saldo físico', () => {
      // Simulamos la lógica de getVentasCajaActual
      const movimientos = [
        { type: 'FACTURA', method: 'EFECTIVO', total: 100000 },
        { type: 'FACTURA', method: 'CREDITO', total: 50000 }, // No suma al físico
        { type: 'ABONO CXC', method: 'EFECTIVO', amount: 30000 },
        { type: 'PAGO CXP', method: 'TRANSFERENCIA', amount: 10000 }
      ];

      let res = { efectivo: 0, transferencia: 0, credito: 0, abonos_cxc: 0, abonos_cxp: 0 };

      movimientos.forEach(m => {
        if (m.type === 'FACTURA') {
          if (m.method === 'CREDITO') res.credito += m.total;
          else if (m.method === 'EFECTIVO') res.efectivo += m.total;
        } else if (m.type === 'ABONO CXC') {
          res.abonos_cxc += m.amount;
          if (m.method === 'EFECTIVO') res.efectivo += m.amount;
        } else if (m.type === 'PAGO CXP') {
          res.abonos_cxp += m.amount;
          if (m.method === 'TRANSFERENCIA') res.transferencia -= m.amount;
        }
      });

      expect(res.efectivo).toBe(130000); // 100k factura + 30k abono
      expect(res.credito).toBe(50000);   // 50k factura crédito
      expect(res.abonos_cxc).toBe(30000);
      expect(res.abonos_cxp).toBe(10000);
      expect(res.transferencia).toBe(-10000); // Salida de dinero
    });
  });
});
