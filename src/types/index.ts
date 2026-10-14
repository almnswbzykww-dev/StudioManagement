// Types for StudioManagement System

export type UserRole = 'admin' | 'cashier' | 'designer' | 'photographer' | 'accountant';

export interface User {
  id: string;
  userNumber: number; // e.g. #1 for Admin, #2, #3...
  username: string;
  fullName: string;
  role: UserRole;
  roleTitle: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions?: string[];
  password?: string;
}

export type ServiceType = 
  | 'wedding_board'      // لوحات العرسان الفاخرة
  | 'wedding_session'    // جلسة تصوير عرسان
  | 'studio_photos'      // الصور وجلسات الاستديو
  | 'photo_albums'       // ألبومات الصور الفاخرة
  | 'advertising'        // الدعاية والإعلان والبنرات
  | 'graphic_design'     // التصميمات والشعارات
  | 'passport_photos'    // تصوير الجوازات والمعاملات الرسمية
  | 'photo_restoration'  // ترميم وتلوين الصور القديمة
  | 'canvas_prints'      // لوحات الكانفس الفنية المشدودة
  | 'video_montage'      // الفيديو والمونتاج
  | 'outdoor_photo'      // التصوير الخارجي والمناسبات
  | 'thermal_print'      // الطباعة الحرارية والهدايا
  | 'general_service';   // خدمات عامة

export type OrderStatus = 
  | 'pending'          // قيد الانتظار
  | 'in_design'        // قيد التصميم
  | 'in_shooting'      // قيد التصوير
  | 'in_printing'      // قيد الطباعة
  | 'in_montage'       // قيد المونتاج
  | 'ready'            // جاهز للتسليم
  | 'delivered'        // تم التسليم
  | 'cancelled';       // ملغي

export interface Customer {
  id: string;
  customerNumber: string; // e.g. C-0001
  name: string;
  phone: string;
  secondaryPhone?: string;
  address?: string;
  notes?: string;
  totalOrdersCount: number;
  totalSpent: number;
  totalPaid: number;
  totalRemaining: number;
  createdAt: string;
  lastOrderDate?: string;
}

export type PaymentMethod = 'cash' | 'bank_wallet';

export type BankWalletType = 
  | 'kuraimi'       // كريمي / إم فلوس / كريمي جوال
  | 'jeeb'          // محفظة جيب
  | 'jawwali'       // محفظة جوالي
  | 'one_cash'      // محفظة ون كاش
  | 'floosak'       // محفظة فلوسك
  | 'cash_wallet'   // محفظة كاش
  | 'pyes'          // محفظة بيس (بنك الأمل)
  | 'mobile_money'  // محفظة موبايل موني
  | 'tadhamon_pay'  // تضامن باي (بنك التضامن)
  | 'qutaibi_banki' // بنك القطيبي / بنكي
  | 'shamel_money'  // محفظة شامل موني
  | 'remittance';   // شبكات الحوالات (النجم، الامتياز، يمن إكسبرس)

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  method: PaymentMethod;
  walletType?: BankWalletType;
  walletName?: string;
  transactionNumber?: string;
  transferNumber?: string;
  senderName?: string;
  senderPhone?: string;
  transferProofUrl?: string; // base64 or URL
  notes?: string;
  cashierId: string;
  cashierName: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  serviceType: ServiceType;
  title: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications: Record<string, any>;
  attachments?: string[];
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. ORD-2026-0001
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  serviceType: ServiceType;
  serviceTitle: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: OrderStatus;
  orderDate: string;
  deliveryDate: string;
  deliveryTime?: string;
  notes?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  createdById: string;
  createdByName: string;
  payments: PaymentRecord[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudioSettings {
  studioName: string;
  systemManagerName?: string;
  tagline: string;
  address: string;
  phone: string;
  secondaryPhone?: string;
  whatsapp: string;
  email: string;
  crNumber?: string; // سجل تجاري / رقم ضريبي
  taxRate: number; // percentage, e.g. 0 or 15
  currency: string; // ر.ي أو ر.س أو $
  logoUrl?: string; // base64
  cinemaCameraBanner?: string; // base64 or permanent local asset
  cinemaBackground?: string; // base64 permanent cinema background in database
  sectionImages?: Record<string, string>; // Permanent database section images for all 12 departments
  invoiceTitle: string;
  invoiceSubtitle: string;
  invoiceFooterNote: string;
  invoiceTerms: string;
  printSize: 'a4' | 'thermal_80mm';
  autoBackupInterval: 'daily' | 'weekly' | 'manual';
  lastBackupDate?: string;
}

export interface Expense {
  id: string;
  voucherNumber: string; // e.g. EXP-0001
  category: string; // إيجار، كهرباء، صيانة، أحبار، ضيافة، إعلانات، نقل، أخرى
  amount: number;
  date: string;
  time: string;
  recipient: string;
  description: string;
  paymentMethod: PaymentMethod;
  walletType?: BankWalletType;
  recordedById: string;
  recordedByName: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  empNumber: string; // EMP-001
  name: string;
  role: string;
  phone: string;
  idNumber?: string;
  hireDate: string;
  baseSalary: number;
  initialDebt?: number;
  currentDebt?: number;
  dailyRate?: number;
  isActive: boolean;
  notes?: string;
}

export interface EmployeeDebt {
  id: string;
  debtNumber: string; // DEBT-2026-0001
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  reason: string;
  isSettled: boolean;
  settledAmount: number;
  notes?: string;
  createdAt: string;
}

export interface EmployeePaymentRecord {
  id: string;
  paymentNumber: string; // EPAY-2026-0001
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  description: string;
  relatedDebtId?: string;
  notes?: string;
  createdAt: string;
}

export interface EmployeeDeductionRecord {
  id: string;
  deductionNumber: string; // DED-2026-0001
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  monthYear: string;
  reason: string;
  isAppliedToSalary: boolean;
  notes?: string;
  createdAt: string;
}

export interface SalaryAdvance {
  id: string;
  advanceNumber: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  monthTarget: string; // e.g. 2026-10
  isDeducted: boolean;
  deductedSalaryPaymentId?: string;
  notes?: string;
  approvedById: string;
  approvedByName: string;
  createdAt: string;
}

export interface SalaryPayment {
  id: string;
  paymentNumber: string;
  employeeId: string;
  employeeName: string;
  monthYear: string; // e.g. 2026-10
  baseSalary: number;
  allowances: number;
  deductions: number;
  advancesDeducted: number;
  netSalary: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  paidById: string;
  paidByName: string;
  createdAt: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string; // ورق طباعة، أحبار، أكواب وهدايا، ألواح خشب وأكريليك، ألبومات وإطارات، ملحقات
  unit: string; // حبة، متر، رول، كرتون، لتر
  currentQuantity: number;
  minQuantity: number; // حد التنبيه
  costPrice: number;
  sellingPrice: number;
  supplierName?: string;
  location?: string;
  notes?: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjust' | 'return';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  unitPrice: number;
  reference?: string; // Order or Purchase ID
  notes?: string;
  date: string;
  createdByName: string;
}

export interface Supplier {
  id: string;
  supplierNumber: string;
  name: string;
  companyName: string;
  phone: string;
  address?: string;
  category: string; // أحبار، ورق، أجهزة، إطارات
  totalPurchases: number;
  totalPaid: number;
  balanceDebt: number; // مستحقات المورد
  notes?: string;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string; // PUR-2026-0001
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  purchaseDate: string;
  paymentMethod: PaymentMethod;
  invoiceReference?: string;
  notes?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  module: string;
  details: string;
  userId: string;
  userName: string;
  userNumber?: number; // رقم المستخدم
  orderNumber?: string; // رقم الفاتورة أو الطلب
  date?: string; // التاريخ بالأرقام الإنجليزية
  time?: string; // الوقت بالأرقام الإنجليزية
  timestamp: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export interface BackupMetadata {
  id: string;
  createdAt: string;
  version: string;
  recordsCount: {
    customers: number;
    orders: number;
    payments: number;
    expenses: number;
    employees: number;
    products: number;
    suppliers: number;
    purchases: number;
    auditLogs: number;
  };
  fileSizeKB: number;
  createdByName: string;
}
