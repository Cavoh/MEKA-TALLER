export interface Tenant {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
  custom_name?: string;
  invoice_prefix?: string;
  invoice_next_number?: number;
  payment_link_credit?: string;
  payment_link_debit?: string;
  invoiceConfig: {
    fields: string[];
    designId: string;
  };
  nit?: string;
}

export type Tab = 'DASHBOARD' | 'CLIENTES' | 'MANTENIMIENTO' | 'FACTURAR' | 'COMPRAS' | 'INVENTARIO' | 'REPORTES' | 'CONFIGURACION' | 'ROLES' | 'PERSONAL' | 'USUARIOS' | 'CXC' | 'CXP' | 'INFORMES';

export interface WorkshopContextType {
  user: any;
  tenant: Tenant | null;
  staff: Personal | null;
  permissions: { category: string; status: boolean }[];
  hasActionPermission: (actionId: string) => boolean;
  logout: () => void;
  switchStaff: () => void;
  showToast?: (msg: string, type?: string) => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  
  // Navegación y Modales
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isAppearanceOpen: boolean;
  setIsAppearanceOpen: (open: boolean) => void;
  visibleTabs: Tab[];
}

export interface UserProfile {
  id: string;
  email: string;
  tenantId: string;
  roleId: string;
  nombre?: string;
}

export interface Client {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  idType: string;
  idNumber: string;
  discount: number;
}

export interface InventoryItem {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  description: string;
  sku?: string;
  supplier?: string;
  iva?: number;
  stock_minimo?: number;
}

export interface MaintenanceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
  locked?: boolean;
}

export interface MaintenanceHistory {
  id: string;
  date: string;
  mechanic: string;
  km?: number;
  notes: string;
  photos: string[];
  items: MaintenanceItem[];
  status?: 'open' | 'closed';
}

export interface MaintenanceRecord {
  id: string;
  tenantId: string;
  clientId: string;
  vehiclePlate: string;
  status: 'open' | 'closed';
  history: MaintenanceHistory[];
}

export interface InvoiceItem {
  sku?: string;
  description: string;
  quantity: number;
  price: number;
  discount: number;
  iva: number;
  total: number;
}

export interface Invoice {
  id: string;
  tenantId: string;
  clientId: string;
  maintenanceId?: string;
  invoiceNumber: string;
  date: string;
  subtotal: number;
  discount: number;
  taxable_base?: number;
  iva_total?: number;
  total: number;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  client_address?: string;
  client_id_type?: string;
  client_id_number?: string;
  client_discount?: number;
  items: InvoiceItem[];
}

export interface Role {
  id: string;
  tenantId: string;
  name: string;
  permissions: {
    category: string;
    status: boolean;
  }[];
}

export interface Personal {
  id: string;
  tenantId: string;
  nombre: string;
  contrasena: string;
  rolName: string;
  rolId: string;
  createdAt?: string;
}

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  idType: string;
  idNumber: string;
  phone: string;
  email: string;
  address: string;
  discount: number;
  retefuente: number;
  reteica: number;
}

export interface Shipping {
  id: string;
  tenantId: string;
  supplierId: string;
  date: string;
  items: InvoiceItem[];
  total: number;
  paymentMethod: string;
  invoiceNumber: string;
}

export interface ArqueoCaja {
  id: number;
  tenant_id: string;
  estado: 'abierta' | 'cerrada';
  fecha_apertura: string;
  fecha_cierre?: string;
  apertura_efectivo: number;
  apertura_tarjeta_debito: number;
  apertura_tarjeta_credito: number;
  apertura_nequi: number;
  apertura_daviplata: number;
  ventas_efectivo: number;
  ventas_tarjeta_debito: number;
  ventas_tarjeta_credito: number;
  ventas_nequi: number;
  ventas_daviplata: number;
  cierre_efectivo: number;
  cierre_tarjeta_debito: number;
  cierre_tarjeta_credito: number;
  cierre_nequi: number;
  cierre_daviplata: number;
  diferencia_total: number;
  ventas_credito?: number;
  abonos_cxc?: number;
  abonos_cxp?: number;
  observaciones?: string;
  usuario_id: string;
}

export interface Receivable {
  id: string;
  tenant_id: string;
  client_id: string;
  invoice_id?: string;
  total_amount: number;
  paid_amount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID';
  due_date?: string;
  created_at: string;
}

export interface ReceivablePayment {
  id: string;
  tenant_id: string;
  receivable_id: string;
  amount: number;
  payment_method: string;
  notes?: string;
  payment_date: string;
  "RC No."?: string;
}

export interface Payable {
  id: string;
  tenant_id: string;
  supplier_id: string;
  shipping_id?: string;
  total_amount: number;
  paid_amount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID';
  due_date?: string;
  created_at: string;
}

export interface PayablePayment {
  id: string;
  tenant_id: string;
  payable_id: string;
  amount: number;
  payment_method: string;
  notes?: string;
  payment_date: string;
  "CE No."?: string;
}

export interface UnifiedTransaction {
  id: string;
  date: string;
  type: 'INGRESO' | 'EGRESO';
  sourceType: 'FACTURA' | 'REMISIÓN' | 'ABONO CXC' | 'PAGO CXP';
  documentNumber: string;
  paymentMethod: string;
  mechanic: string;
  entityName: string;
  total: number;
  discount: number;
  taxableBase: number;
  ivaTotal: number;
  originalPayload: any;
}
