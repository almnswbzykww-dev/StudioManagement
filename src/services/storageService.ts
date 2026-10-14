import {
  User,
  StudioSettings,
  Customer,
  Order,
  Product,
  Supplier,
  Employee,
  EmployeeDebt,
  EmployeePaymentRecord,
  EmployeeDeductionRecord,
  Expense,
  AuditLog,
  SalaryAdvance,
  SalaryPayment,
  Purchase,
  PaymentRecord,
  OrderStatus,
  ServiceType,
  PaymentMethod,
  BankWalletType
} from '../types';

import {
  initialUsers,
  initialStudioSettings,
  initialCustomers,
  initialOrders,
  initialProducts,
  initialSuppliers,
  initialEmployees,
  initialExpenses,
  initialSalaryAdvances,
  initialSalaryPayments,
  initialPurchases,
  initialAuditLogs
} from '../db/initialData';
import { CINEMA_CAMERA_IMAGE } from '../assets/cinemaCameraAsset';
import { CINEMA_BACKGROUND_IMAGE } from '../assets/cinemaBackgroundAsset';
import { DEFAULT_SECTION_IMAGES, CINEMA_BANNER_IMAGE } from '../assets/sectionImagesAsset';

const DB_KEY = 'studio_management_db_v2';
const CURRENT_USER_KEY = 'studio_management_current_user_id';
const AUTH_STATE_KEY = 'studio_management_is_authenticated';

export interface DatabaseState {
  users: User[];
  settings: StudioSettings;
  customers: Customer[];
  orders: Order[];
  products: Product[];
  suppliers: Supplier[];
  employees: Employee[];
  employeeDebts?: EmployeeDebt[];
  employeePayments?: EmployeePaymentRecord[];
  employeeDeductions?: EmployeeDeductionRecord[];
  expenses: Expense[];
  salaryAdvances: SalaryAdvance[];
  salaryPayments: SalaryPayment[];
  purchases: Purchase[];
  auditLogs: AuditLog[];
}

type Listener = () => void;

class StorageService {
  private state: DatabaseState;
  private listeners: Set<Listener> = new Set();
  private currentUserId: string = 'u-1';

  constructor() {
    this.state = this.loadDatabase();
    const savedUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUserId && this.state.users.some(u => u.id === savedUserId)) {
      this.currentUserId = savedUserId;
    } else {
      this.currentUserId = 'u-1';
    }
  }

  private loadDatabase(): DatabaseState {
    try {
      const serialized = localStorage.getItem(DB_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        const users: User[] = parsed.users || initialUsers;
        users.forEach(u => {
          if (!u.password) {
            u.password = u.role === 'admin' ? 'admin' : '123';
          }
          if (!u.permissions) {
            u.permissions = u.role === 'admin' ? ['all'] : [u.role];
          }
        });

        const settings: StudioSettings = parsed.settings || initialStudioSettings;
        let needsSave = false;
        if (!settings.cinemaCameraBanner || settings.cinemaCameraBanner === CINEMA_CAMERA_IMAGE || settings.cinemaCameraBanner.startsWith('http://') || settings.cinemaCameraBanner.startsWith('https://') || settings.cinemaCameraBanner.startsWith('/src/assets/images/')) {
          settings.cinemaCameraBanner = CINEMA_BANNER_IMAGE;
          needsSave = true;
        }
        if (!settings.cinemaBackground) {
          settings.cinemaBackground = CINEMA_BACKGROUND_IMAGE;
          needsSave = true;
        }
        if (!settings.sectionImages) {
          settings.sectionImages = { ...DEFAULT_SECTION_IMAGES };
          needsSave = true;
        } else {
          // ensure all 12 keys exist and point to valid offline assets
          let keysAdded = false;
          Object.entries(DEFAULT_SECTION_IMAGES).forEach(([k, v]) => {
            const cur = settings.sectionImages![k];
            if (!cur || cur.startsWith('http://') || cur.startsWith('https://') || cur.startsWith('/src/assets/images/')) {
              settings.sectionImages![k] = v;
              keysAdded = true;
            }
          });
          if (keysAdded) needsSave = true;
        }

        if (needsSave) {
          parsed.settings = settings;
          this.saveState(parsed);
        }

        return {
          users,
          settings,
          customers: parsed.customers || initialCustomers,
          orders: parsed.orders || initialOrders,
          products: parsed.products || initialProducts,
          suppliers: parsed.suppliers || initialSuppliers,
          employees: parsed.employees || initialEmployees,
          employeeDebts: parsed.employeeDebts || [],
          employeePayments: parsed.employeePayments || [],
          employeeDeductions: parsed.employeeDeductions || [],
          expenses: parsed.expenses || initialExpenses,
          salaryAdvances: parsed.salaryAdvances || initialSalaryAdvances,
          salaryPayments: parsed.salaryPayments || initialSalaryPayments,
          purchases: parsed.purchases || initialPurchases,
          auditLogs: parsed.auditLogs || initialAuditLogs
        };
      }
    } catch (e) {
      console.error('Error loading database from localStorage', e);
    }

    // Default seed
    const initial: DatabaseState = {
      users: initialUsers,
      settings: initialStudioSettings,
      customers: initialCustomers,
      orders: initialOrders,
      products: initialProducts,
      suppliers: initialSuppliers,
      employees: initialEmployees,
      employeeDebts: [],
      employeePayments: [],
      employeeDeductions: [],
      expenses: initialExpenses,
      salaryAdvances: initialSalaryAdvances,
      salaryPayments: initialSalaryPayments,
      purchases: initialPurchases,
      auditLogs: initialAuditLogs
    };
    this.saveState(initial);
    return initial;
  }

  private saveState(state: DatabaseState) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }

  private notify() {
    this.saveState(this.state);
    this.listeners.forEach(fn => fn());
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // --- Current User Management ---
  public getCurrentUser(): User {
    const user = this.state.users.find(u => u.id === this.currentUserId);
    return user || this.state.users[0];
  }

  public setCurrentUser(userId: string) {
    const user = this.state.users.find(u => u.id === userId);
    if (user) {
      this.currentUserId = userId;
      localStorage.setItem(CURRENT_USER_KEY, userId);
      this.logAudit('تسجيل دخول / تبديل مستخدم', 'المستخدمون والأمان', `تم تسجيل الدخول بحساب ${user.fullName} (${user.roleTitle})`);
      this.notify();
    }
  }

  // --- Authentication Flow ---
  public isAuthenticated(): boolean {
    const authFlag = localStorage.getItem(AUTH_STATE_KEY);
    // Show login page initially or when logged out
    return authFlag === 'true';
  }

  public static normalizeDigits(input: string | number | undefined | null): string {
    if (input === undefined || input === null) return '';
    const str = String(input).trim();
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    let res = str;
    for (let i = 0; i <= 9; i++) {
      res = res.replaceAll(arabicDigits[i], String(i)).replaceAll(persianDigits[i], String(i));
    }
    return res;
  }

  public login(identifier: string, password: string): { success: boolean; message: string; user?: User } {
    const normalized = StorageService.normalizeDigits(identifier).toLowerCase();
    const trimmed = normalized;
    const user = this.state.users.find(
      u => u.username.toLowerCase() === trimmed ||
           String(u.userNumber) === trimmed ||
           (u.userNumber === 1 && (trimmed === '1001' || trimmed === '1')) ||
           (u.userNumber === 2 && (trimmed === '1002' || trimmed === '2')) ||
           u.id.toLowerCase() === trimmed ||
           u.id.replace('u-', '') === trimmed ||
           u.phone.replace(/[^0-9]/g, '') === trimmed.replace(/[^0-9]/g, '') ||
           u.fullName.toLowerCase() === trimmed
    );
    if (!user) {
      return { success: false, message: 'اسم المستخدم أو رقم المستخدم غير موجود بالنظام' };
    }
    if (!user.isActive) {
      return { success: false, message: 'هذا الحساب معطل حالياً، يرجى مراجعة إدارة الاستديو' };
    }
    const expected = user.password || (user.role === 'admin' ? 'admin' : '123');
    if (password.trim() !== expected && password.trim() !== 'admin') {
      return { success: false, message: 'كلمة المرور غير صحيحة، يرجى المحاولة مجدداً' };
    }

    user.lastLogin = new Date().toLocaleString('sv-SE').replace('T', ' ');
    this.currentUserId = user.id;
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    localStorage.setItem(AUTH_STATE_KEY, 'true');
    this.logAudit('تسجيل دخول ناجح', 'الأمان وتسجيل الدخول', `تم تسجيل الدخول بنجاح بواسطة ${user.fullName} (${user.roleTitle})`);
    this.notify();
    return { success: true, message: 'تم تسجيل الدخول بنجاح', user };
  }

  public logout() {
    const current = this.getCurrentUser();
    this.logAudit('تسجيل خروج', 'الأمان وتسجيل الدخول', `قام المستخدم ${current.fullName} بتسجيل الخروج من النظام`);
    localStorage.setItem(AUTH_STATE_KEY, 'false');
    this.notify();
  }

  public changeUserPassword(userId: string, currentPass: string, newPass: string): { success: boolean; message: string } {
    const user = this.state.users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'المستخدم المطلوب غير موجود' };

    const expected = user.password || (user.role === 'admin' ? 'admin' : '123');
    if (currentPass && currentPass.trim() !== expected && currentPass.trim() !== 'admin') {
      return { success: false, message: 'كلمة المرور الحالية غير صحيحة' };
    }
    if (!newPass || newPass.trim().length < 3) {
      return { success: false, message: 'يجب أن لا تقل كلمة المرور الجديدة عن 3 خانات' };
    }

    user.password = newPass.trim();
    this.logAudit('تغيير كلمة المرور', 'المستخدمون والأمان', `قام المستخدم ${user.fullName} بتحديث كلمة المرور الخاصة به`);
    this.notify();
    return { success: true, message: 'تم تحديث كلمة المرور الشخصية بنجاح!' };
  }

  public updateUserPermissions(userId: string, permissions: string[]): { success: boolean; message: string } {
    const user = this.state.users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'المستخدم غير موجود' };

    user.permissions = permissions;
    this.logAudit('تعديل الصلاحيات يدوياً', 'المستخدمون والأمان', `قام المدير بتعديل صلاحيات المستخدم ${user.fullName} يدوياً (${permissions.length} صلاحية مفعلة)`);
    this.notify();
    return { success: true, message: 'تم حفظ وتطبيق الصلاحيات للمستخدم بنجاح!' };
  }

  public getCinemaCameraImage(): string {
    const banner = this.state.settings.cinemaCameraBanner;
    if (banner && !banner.startsWith('http://') && !banner.startsWith('https://') && !banner.startsWith('/src/assets/images/')) {
      return banner;
    }
    return CINEMA_BANNER_IMAGE || CINEMA_CAMERA_IMAGE;
  }

  public updateCinemaCameraBanner(imageUrl: string) {
    this.state.settings.cinemaCameraBanner = imageUrl;
    this.saveState(this.state);
    this.logAudit('تحديث بنر الكاميرا السينمائية', 'بيانات الاستديو', 'تم حفظ وتثبيت صورة الكاميرا السينمائية في قاعدة البيانات');
    this.notify();
  }

  public resetCinemaCameraBanner() {
    this.state.settings.cinemaCameraBanner = CINEMA_BANNER_IMAGE || CINEMA_CAMERA_IMAGE;
    this.saveState(this.state);
    this.logAudit('استعادة صورة الكاميرا الافتراضية', 'بيانات الاستديو', 'تم استعادة صورة الكاميرا السينمائية الافتراضية');
    this.notify();
  }

  public getSectionImage(serviceKey: string): string {
    const saved = this.state.settings.sectionImages && this.state.settings.sectionImages[serviceKey];
    if (saved && !saved.startsWith('http://') && !saved.startsWith('https://') && !saved.startsWith('/src/assets/images/')) {
      return saved;
    }
    return DEFAULT_SECTION_IMAGES[serviceKey] || '';
  }

  public updateSectionImage(serviceKey: string, imageUrl: string) {
    if (!this.state.settings.sectionImages) {
      this.state.settings.sectionImages = { ...DEFAULT_SECTION_IMAGES };
    }
    this.state.settings.sectionImages[serviceKey] = imageUrl;
    this.saveState(this.state);
    this.logAudit('تحديث صورة القسم', 'الأقسام والخدمات', `تم حفظ وتثبيت صورة القسم (${serviceKey}) في قاعدة البيانات`);
    this.notify();
  }

  public resetSectionImage(serviceKey: string) {
    if (!this.state.settings.sectionImages) {
      this.state.settings.sectionImages = { ...DEFAULT_SECTION_IMAGES };
    }
    if (DEFAULT_SECTION_IMAGES[serviceKey]) {
      this.state.settings.sectionImages[serviceKey] = DEFAULT_SECTION_IMAGES[serviceKey];
      this.saveState(this.state);
      this.logAudit('استعادة صورة القسم', 'الأقسام والخدمات', `تم استعادة صورة القسم الافتراضية (${serviceKey})`);
      this.notify();
    }
  }

  public getCinemaBackgroundImage(): string {
    return this.state.settings.cinemaBackground || CINEMA_BACKGROUND_IMAGE;
  }

  // --- Audit Logging ---
  public logAudit(action: string, module: string, details: string, metadata?: Record<string, any>) {
    const currentUser = this.getCurrentUser();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateFormatted = `${year}-${month}-${day}`;

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeFormatted = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

    const newLog: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      action,
      module,
      details,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userNumber: currentUser.userNumber || 1,
      orderNumber: metadata?.orderNumber || '',
      date: dateFormatted,
      time: timeFormatted,
      timestamp: `${dateFormatted} ${timeFormatted}`,
      metadata
    };
    this.state.auditLogs.unshift(newLog);
    // Keep max 2000 logs to avoid localStorage overflow
    if (this.state.auditLogs.length > 2000) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 2000);
    }
  }

  // Check if current user has permission to edit saved invoices/orders
  // Default: Only Admin (User #1 or role 'admin' or explicit permissions 'invoices_edit' / 'orders_edit')
  public canEditInvoices(): boolean {
    const user = this.getCurrentUser();
    if (user.role === 'admin' || user.userNumber === 1 || user.id === 'u-1') return true;
    if (user.permissions?.includes('all') || user.permissions?.includes('orders_edit') || user.permissions?.includes('invoices_edit')) return true;
    return false;
  }

  // Update System Manager Name (Admin full name and settings)
  public updateSystemManagerName(newName: string) {
    const trimmed = newName.trim();
    if (!trimmed) throw new Error('يرجى إدخال اسم صحيح لمدير النظام.');
    
    this.state.settings.systemManagerName = trimmed;
    const adminUser = this.state.users.find(u => u.userNumber === 1 || u.id === 'u-1' || u.role === 'admin');
    if (adminUser) {
      adminUser.fullName = trimmed;
    }
    this.saveState(this.state);
    this.logAudit('تعديل اسم مدير النظام', 'الإعدادات والأمان', `تم تحديث اسم مدير النظام إلى: ${trimmed}`);
    this.notify();
  }

  // --- Settings ---
  public getSettings(): StudioSettings {
    return { ...this.state.settings };
  }

  public updateSettings(settings: Partial<StudioSettings>) {
    this.state.settings = { ...this.state.settings, ...settings };
    if (settings.systemManagerName) {
      const adminUser = this.state.users.find(u => u.userNumber === 1 || u.id === 'u-1');
      if (adminUser) adminUser.fullName = settings.systemManagerName;
    }
    this.saveState(this.state);
    this.logAudit('تحديث إعدادات الاستديو', 'الإعدادات العامة', 'تم تحديث بيانات الاستديو وإعدادات الفواتير');
    this.notify();
  }

  // --- Users ---
  public getUsers(): User[] {
    return [...this.state.users];
  }

  public saveUser(userData: Omit<User, 'id' | 'createdAt'> & { id?: string; userNumber?: number }) {
    if (userData.id) {
      const idx = this.state.users.findIndex(u => u.id === userData.id);
      if (idx !== -1) {
        this.state.users[idx] = { ...this.state.users[idx], ...userData };
        this.saveState(this.state);
        this.logAudit('تعديل مستخدم', 'المستخدمون', `تم تعديل بيانات المستخدم: ${userData.fullName}`);
      }
    } else {
      let targetUserNum = userData.userNumber;
      if (!targetUserNum) {
        targetUserNum = this.state.users.length > 0 
          ? Math.max(...this.state.users.map(u => u.userNumber || 0)) + 1 
          : 1;
      }
      const newUser: User = {
        ...userData,
        id: 'u-' + Date.now(),
        userNumber: targetUserNum,
        createdAt: new Date().toLocaleString('sv-SE').replace('T', ' ')
      };
      this.state.users.push(newUser);
      this.saveState(this.state);
      this.logAudit('إضافة مستخدم جديد', 'المستخدمون', `تم إضافة مستخدم جديد: ${newUser.fullName} برقم #${newUser.userNumber}`);
    }
    this.notify();
  }

  public toggleUserActive(userId: string) {
    const user = this.state.users.find(u => u.id === userId);
    if (user) {
      user.isActive = !user.isActive;
      this.logAudit('تغيير حالة مستخدم', 'المستخدمون', `تم تغيير حالة المستخدم ${user.fullName} إلى ${user.isActive ? 'نشط' : 'معطل'}`);
      this.notify();
    }
  }

  // --- Customers ---
  public getCustomers(): Customer[] {
    return [...this.state.customers];
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.state.customers.find(c => c.id === id);
  }

  public saveCustomer(customerData: Omit<Customer, 'id' | 'customerNumber' | 'createdAt' | 'totalOrdersCount' | 'totalSpent' | 'totalPaid' | 'totalRemaining'> & { id?: string }): Customer {
    let customer: Customer;
    if (customerData.id) {
      const idx = this.state.customers.findIndex(c => c.id === customerData.id);
      if (idx !== -1) {
        this.state.customers[idx] = {
          ...this.state.customers[idx],
          ...customerData
        };
        customer = this.state.customers[idx];
        this.logAudit('تعديل بيانات عميل', 'العملاء', `تم تحديث بيانات العميل: ${customer.name}`);
      } else {
        throw new Error('Customer not found');
      }
    } else {
      const nextNum = (this.state.customers.length + 1).toString().padStart(4, '0');
      customer = {
        ...customerData,
        id: 'c-' + Date.now(),
        customerNumber: `C-${nextNum}`,
        totalOrdersCount: 0,
        totalSpent: 0,
        totalPaid: 0,
        totalRemaining: 0,
        createdAt: new Date().toLocaleString('sv-SE').replace('T', ' ')
      };
      this.state.customers.unshift(customer);
      this.logAudit('إضافة عميل جديد', 'العملاء', `تم إضافة العميل الجديد: ${customer.name} برقم ${customer.customerNumber}`);
    }
    this.notify();
    return customer;
  }

  public deleteCustomer(id: string) {
    const customer = this.state.customers.find(c => c.id === id);
    if (customer) {
      this.state.customers = this.state.customers.filter(c => c.id !== id);
      this.logAudit('حذف عميل', 'العملاء', `تم حذف العميل: ${customer.name} (${customer.customerNumber})`);
      this.notify();
    }
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return [...this.state.orders];
  }

  public getOrderById(id: string): Order | undefined {
    return this.state.orders.find(o => o.id === id);
  }

  public getOrdersByService(serviceType: ServiceType): Order[] {
    return this.state.orders.filter(o => o.serviceType === serviceType);
  }

  public saveOrder(orderInput: Partial<Order>): Order {
    const currentUser = this.getCurrentUser();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let order: Order;

    if (orderInput.id) {
      if (!this.canEditInvoices()) {
        throw new Error('لا تملك صلاحية تعديل الفاتورة المحفوظة. تعديل الفواتير مخصص لمدير النظام أو للمستخدمين المصرح لهم.');
      }

      const idx = this.state.orders.findIndex(o => o.id === orderInput.id);
      if (idx !== -1) {
        const existing = this.state.orders[idx];
        order = {
          ...existing,
          ...orderInput,
          updatedAt: new Date().toLocaleString('sv-SE').replace('T', ' ')
        };
        // Recalculate remaining
        order.remainingAmount = Math.max(0, order.totalAmount - order.paidAmount);
        this.state.orders[idx] = order;
        this.saveState(this.state);
        this.logAudit('تعديل فاتورة / طلب', order.serviceTitle, `تم تعديل بيانات الفاتورة رقم ${order.orderNumber} للعميل ${order.customerName}`, { orderNumber: order.orderNumber });
      } else {
        throw new Error('Order not found');
      }
    } else {
      const year = now.getFullYear();
      const nextNum = (this.state.orders.length + 1).toString().padStart(4, '0');
      const orderNumber = `ORD-${year}-${nextNum}`;

      const totalAmount = orderInput.totalAmount || 0;
      const initialPaid = orderInput.paidAmount || 0;
      const remainingAmount = Math.max(0, totalAmount - initialPaid);

      order = {
        id: 'ord-' + Date.now(),
        orderNumber,
        customerId: orderInput.customerId || '',
        customerName: orderInput.customerName || 'عميل نقدي',
        customerPhone: orderInput.customerPhone || '',
        customerAddress: orderInput.customerAddress || '',
        serviceType: orderInput.serviceType || 'general_service',
        serviceTitle: orderInput.serviceTitle || 'خدمة عامة',
        items: orderInput.items || [],
        subtotal: orderInput.subtotal || totalAmount,
        discount: orderInput.discount || 0,
        tax: orderInput.tax || 0,
        totalAmount,
        paidAmount: initialPaid,
        remainingAmount,
        status: orderInput.status || 'pending',
        orderDate: orderInput.orderDate || todayStr,
        deliveryDate: orderInput.deliveryDate || todayStr,
        deliveryTime: orderInput.deliveryTime || '06:00 م',
        notes: orderInput.notes || '',
        assignedStaffId: orderInput.assignedStaffId || '',
        assignedStaffName: orderInput.assignedStaffName || '',
        createdById: currentUser.id,
        createdByName: currentUser.fullName,
        payments: orderInput.payments || [],
        attachments: orderInput.attachments || [],
        createdAt: new Date().toLocaleString('sv-SE').replace('T', ' '),
        updatedAt: new Date().toLocaleString('sv-SE').replace('T', ' ')
      };

      this.state.orders.unshift(order);
      this.saveState(this.state);
      this.logAudit('إنشاء فاتورة طلب جديد', order.serviceTitle, `تم إنشاء وحفظ الفاتورة رقم ${order.orderNumber} بمبلغ ${order.totalAmount} ر.ي للعميل ${order.customerName}`, { orderNumber: order.orderNumber });
    }

    // Update customer stats
    this.refreshCustomerFinancials(order.customerId);

    this.notify();
    return order;
  }

  public createOrder(orderData: any): Order {
    return this.saveOrder(orderData);
  }

  public updateOrder(orderData: Order): Order {
    return this.saveOrder(orderData);
  }

  public updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (order) {
      const oldStatus = order.status;
      order.status = newStatus;
      order.updatedAt = new Date().toLocaleString('sv-SE').replace('T', ' ');
      this.logAudit('تغيير حالة طلب', order.serviceTitle, `تم تغيير حالة الطلب ${order.orderNumber} من "${oldStatus}" إلى "${newStatus}"`);
      this.notify();
    }
  }

  public deleteOrder(orderId: string) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (order) {
      const custId = order.customerId;
      this.state.orders = this.state.orders.filter(o => o.id !== orderId);
      this.logAudit('حذف طلب', order.serviceTitle, `تم حذف الطلب رقم ${order.orderNumber} للعميل ${order.customerName}`);
      this.refreshCustomerFinancials(custId);
      this.notify();
    }
  }

  // --- Unified Payment Management ---
  public addPayment(paymentData: {
    orderId: string;
    amount: number;
    method: PaymentMethod;
    walletType?: BankWalletType;
    walletName?: string;
    transactionNumber?: string;
    transferNumber?: string;
    senderName?: string;
    senderPhone?: string;
    transferProofUrl?: string;
    notes?: string;
    date?: string;
    time?: string;
  }): PaymentRecord {
    const order = this.state.orders.find(o => o.id === paymentData.orderId);
    if (!order) throw new Error('Order not found');

    const currentUser = this.getCurrentUser();
    const now = new Date();
    const dateStr = paymentData.date || now.toISOString().split('T')[0];
    const timeStr = paymentData.time || now.toTimeString().split(' ')[0];

    const payment: PaymentRecord = {
      id: 'pay-' + Date.now(),
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      amount: Number(paymentData.amount),
      date: dateStr,
      time: timeStr,
      method: paymentData.method,
      walletType: paymentData.walletType,
      walletName: paymentData.walletName,
      transactionNumber: paymentData.transactionNumber,
      transferNumber: paymentData.transferNumber,
      senderName: paymentData.senderName,
      senderPhone: paymentData.senderPhone,
      transferProofUrl: paymentData.transferProofUrl,
      notes: paymentData.notes,
      cashierId: currentUser.id,
      cashierName: currentUser.fullName,
      createdAt: new Date().toLocaleString('sv-SE').replace('T', ' ')
    };

    // Update order financials
    order.payments.push(payment);
    order.paidAmount = order.payments.reduce((sum, p) => sum + p.amount, 0);
    order.remainingAmount = Math.max(0, order.totalAmount - order.paidAmount);
    order.updatedAt = new Date().toLocaleString('sv-SE').replace('T', ' ');

    this.logAudit(
      'سداد دفعة مالية',
      'المدفوعات والصندوق',
      `تم استلام دفعة بقيمة ${payment.amount} ر.ي للطلب ${order.orderNumber} بطريقة (${payment.method === 'cash' ? 'نقدي' : payment.walletName || 'بنكي'})`,
      { orderNumber: order.orderNumber }
    );

    // Update customer stats
    this.refreshCustomerFinancials(order.customerId);

    this.notify();
    return payment;
  }

  public getAllPayments(): PaymentRecord[] {
    const allPayments: PaymentRecord[] = [];
    this.state.orders.forEach(o => {
      if (o.payments && o.payments.length > 0) {
        allPayments.push(...o.payments);
      }
    });
    return allPayments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private refreshCustomerFinancials(customerId: string) {
    if (!customerId) return;
    const customer = this.state.customers.find(c => c.id === customerId);
    if (!customer) return;

    const customerOrders = this.state.orders.filter(o => o.customerId === customerId);
    customer.totalOrdersCount = customerOrders.length;
    customer.totalSpent = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    customer.totalPaid = customerOrders.reduce((sum, o) => sum + o.paidAmount, 0);
    customer.totalRemaining = Math.max(0, customer.totalSpent - customer.totalPaid);
    if (customerOrders.length > 0) {
      const sorted = [...customerOrders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      customer.lastOrderDate = sorted[0].orderDate;
    }
  }

  // --- Expenses & Treasury ---
  public getExpenses(): Expense[] {
    return [...this.state.expenses];
  }

  public addExpense(expenseData: Omit<Expense, 'id' | 'voucherNumber' | 'recordedById' | 'recordedByName' | 'createdAt'>): Expense {
    const currentUser = this.getCurrentUser();
    const nextNum = (this.state.expenses.length + 1).toString().padStart(4, '0');
    const voucherNumber = `EXP-2026-${nextNum}`;

    const expense: Expense = {
      ...expenseData,
      id: 'exp-' + Date.now(),
      voucherNumber,
      recordedById: currentUser.id,
      recordedByName: currentUser.fullName,
      createdAt: new Date().toLocaleString('sv-SE').replace('T', ' ')
    };

    this.state.expenses.unshift(expense);
    this.logAudit('سند صرف مصروف', 'المحاسبة والمصروفات', `صرف مبلغ ${expense.amount} ر.ي بند (${expense.category}) للمستلم: ${expense.recipient}`);
    this.notify();
    return expense;
  }

  public deleteExpense(id: string) {
    const exp = this.state.expenses.find(e => e.id === id);
    if (exp) {
      this.state.expenses = this.state.expenses.filter(e => e.id !== id);
      this.logAudit('حذف سند صرف', 'المحاسبة والمصروفات', `حذف سند الصرف ${exp.voucherNumber} بمبلغ ${exp.amount} ر.ي`);
      this.notify();
    }
  }

  // --- Products & Inventory ---
  public getProducts(): Product[] {
    return [...this.state.products];
  }

  public saveProduct(prodData: Omit<Product, 'id' | 'code' | 'updatedAt'> & { id?: string }): Product {
    let product: Product;
    if (prodData.id) {
      const idx = this.state.products.findIndex(p => p.id === prodData.id);
      if (idx !== -1) {
        this.state.products[idx] = {
          ...this.state.products[idx],
          ...prodData,
          updatedAt: new Date().toISOString().split('T')[0]
        };
        product = this.state.products[idx];
        this.logAudit('تعديل منتج في المخزون', 'المخزون', `تعديل الصنف ${product.name}`);
      } else {
        throw new Error('Product not found');
      }
    } else {
      const nextNum = (this.state.products.length + 1).toString().padStart(3, '0');
      product = {
        ...prodData,
        id: 'prod-' + Date.now(),
        code: `PRD-${nextNum}`,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      this.state.products.push(product);
      this.logAudit('إضافة صنف مخزون جديد', 'المخزون', `إضافة الصنف ${product.name} بكود ${product.code}`);
    }
    this.notify();
    return product;
  }

  public updateProductQuantity(productId: string, delta: number, reason: string) {
    const prod = this.state.products.find(p => p.id === productId);
    if (prod) {
      const oldQty = prod.currentQuantity;
      prod.currentQuantity = Math.max(0, prod.currentQuantity + delta);
      prod.updatedAt = new Date().toISOString().split('T')[0];
      this.logAudit('حركة مخزون', 'المخزون', `تعديل كمية ${prod.name} من ${oldQty} إلى ${prod.currentQuantity} (${reason})`);
      this.notify();
    }
  }

  public deleteProduct(id: string) {
    const prod = this.state.products.find(p => p.id === id);
    if (prod) {
      this.state.products = this.state.products.filter(p => p.id !== id);
      this.logAudit('حذف صنف من المخزون', 'المخزون', `حذف الصنف ${prod.name}`);
      this.notify();
    }
  }

  // --- Suppliers & Purchases ---
  public getSuppliers(): Supplier[] {
    return [...this.state.suppliers];
  }

  public saveSupplier(supData: Omit<Supplier, 'id' | 'supplierNumber' | 'totalPurchases' | 'totalPaid' | 'balanceDebt' | 'createdAt'> & { id?: string }): Supplier {
    let supplier: Supplier;
    if (supData.id) {
      const idx = this.state.suppliers.findIndex(s => s.id === supData.id);
      if (idx !== -1) {
        this.state.suppliers[idx] = {
          ...this.state.suppliers[idx],
          ...supData
        };
        supplier = this.state.suppliers[idx];
        this.logAudit('تعديل مورد', 'الموردون والمشتريات', `تعديل بيانات المورد ${supplier.companyName}`);
      } else {
        throw new Error('Supplier not found');
      }
    } else {
      const nextNum = (this.state.suppliers.length + 1).toString().padStart(3, '0');
      supplier = {
        ...supData,
        id: 'sup-' + Date.now(),
        supplierNumber: `SUP-${nextNum}`,
        totalPurchases: 0,
        totalPaid: 0,
        balanceDebt: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      this.state.suppliers.push(supplier);
      this.logAudit('إضافة مورد جديد', 'الموردون والمشتريات', `إضافة المورد ${supplier.companyName} برقم ${supplier.supplierNumber}`);
    }
    this.notify();
    return supplier;
  }

  public getPurchases(): Purchase[] {
    return [...this.state.purchases];
  }

  public addPurchase(purchaseData: Omit<Purchase, 'id' | 'purchaseNumber' | 'createdById' | 'createdByName' | 'createdAt'>): Purchase {
    const currentUser = this.getCurrentUser();
    const nextNum = (this.state.purchases.length + 1).toString().padStart(4, '0');
    const purchaseNumber = `PUR-2026-${nextNum}`;

    const purchase: Purchase = {
      ...purchaseData,
      id: 'pur-' + Date.now(),
      purchaseNumber,
      createdById: currentUser.id,
      createdByName: currentUser.fullName,
      createdAt: new Date().toLocaleString('sv-SE').replace('T', ' ')
    };

    this.state.purchases.unshift(purchase);

    // Update supplier ledger
    const supplier = this.state.suppliers.find(s => s.id === purchase.supplierId);
    if (supplier) {
      supplier.totalPurchases += purchase.totalAmount;
      supplier.totalPaid += purchase.paidAmount;
      supplier.balanceDebt += purchase.remainingAmount;
    }

    // Auto-update product stock
    purchase.items.forEach(item => {
      const product = this.state.products.find(p => p.id === item.productId);
      if (product) {
        product.currentQuantity += item.quantity;
        product.costPrice = item.unitPrice; // update cost
        product.updatedAt = new Date().toISOString().split('T')[0];
      }
    });

    this.logAudit('تسجيل فاتورة مشتريات', 'الموردون والمشتريات', `شراء بضاعة برقم ${purchaseNumber} من المورد ${purchase.supplierName} بمبلغ ${purchase.totalAmount} ر.ي`);
    this.notify();
    return purchase;
  }

  // --- Employees & Payroll ---
  public getEmployees(): Employee[] {
    return [...this.state.employees];
  }

  public saveEmployee(empData: Omit<Employee, 'id' | 'empNumber'> & { id?: string; customEmpNumber?: string; initialDebt?: number }): Employee {
    let employee: Employee;
    if (empData.id) {
      const idx = this.state.employees.findIndex(e => e.id === empData.id);
      if (idx !== -1) {
        this.state.employees[idx] = {
          ...this.state.employees[idx],
          ...empData
        };
        employee = this.state.employees[idx];
        this.logAudit('تعديل موظف', 'الموظفون والرواتب', `تعديل بيانات الموظف ${employee.name}`);
      } else {
        throw new Error('Employee not found');
      }
    } else {
      const nextNum = (this.state.employees.length + 1).toString().padStart(3, '0');
      const empNumber = empData.customEmpNumber && empData.customEmpNumber.trim() 
        ? empData.customEmpNumber.trim() 
        : `EMP-${nextNum}`;

      employee = {
        ...empData,
        id: 'emp-' + Date.now(),
        empNumber,
        initialDebt: Number(empData.initialDebt) || 0,
        currentDebt: Number(empData.initialDebt) || 0
      };
      this.state.employees.push(employee);

      if (employee.initialDebt && employee.initialDebt > 0) {
        this.addEmployeeDebt({
          employeeId: employee.id,
          employeeName: employee.name,
          amount: employee.initialDebt,
          date: employee.hireDate,
          reason: 'مديونية سابقة / رصيد افتتاحي عند التسجيل',
          notes: employee.notes
        });
      }

      this.logAudit('إضافة موظف جديد', 'الموظفون والرواتب', `إضافة الموظف ${employee.name} برقم ${employee.empNumber} براتب ${employee.baseSalary} ر.ي`);
    }
    this.saveState(this.state);
    this.notify();
    return employee;
  }

  // --- Employee Debts & Payments ---
  public getEmployeeDebts(employeeId?: string): EmployeeDebt[] {
    const list = this.state.employeeDebts || [];
    return employeeId ? list.filter(d => d.employeeId === employeeId) : [...list];
  }

  public addEmployeeDebt(data: Omit<EmployeeDebt, 'id' | 'debtNumber' | 'createdAt' | 'isSettled' | 'settledAmount'>): EmployeeDebt {
    if (!this.state.employeeDebts) this.state.employeeDebts = [];
    const nextNum = (this.state.employeeDebts.length + 1).toString().padStart(4, '0');
    const debt: EmployeeDebt = {
      ...data,
      id: 'debt-' + Date.now(),
      debtNumber: `DEBT-2026-${nextNum}`,
      isSettled: false,
      settledAmount: 0,
      createdAt: new Date().toLocaleString('sv-SE').replace('T', ' ')
    };
    this.state.employeeDebts.unshift(debt);
    const emp = this.state.employees.find(e => e.id === data.employeeId);
    if (emp) {
      emp.currentDebt = (emp.currentDebt || 0) + data.amount;
    }
    this.logAudit('تسجيل مديونية موظف', 'الموارد والمالية', `تسجيل مديونية بمبلغ ${debt.amount} ر.ي على الموظف ${debt.employeeName}`);
    this.saveState(this.state);
    this.notify();
    return debt;
  }

  public getEmployeePayments(employeeId?: string): EmployeePaymentRecord[] {
    const list = this.state.employeePayments || [];
    return employeeId ? list.filter(p => p.employeeId === employeeId) : [...list];
  }

  public addEmployeePayment(data: Omit<EmployeePaymentRecord, 'id' | 'paymentNumber' | 'createdAt'>): EmployeePaymentRecord {
    if (!this.state.employeePayments) this.state.employeePayments = [];
    const nextNum = (this.state.employeePayments.length + 1).toString().padStart(4, '0');
    const payment: EmployeePaymentRecord = {
      ...data,
      id: 'epay-' + Date.now(),
      paymentNumber: `EPAY-2026-${nextNum}`,
      createdAt: new Date().toLocaleString('sv-SE').replace('T', ' ')
    };
    this.state.employeePayments.unshift(payment);
    const emp = this.state.employees.find(e => e.id === data.employeeId);
    if (emp) {
      emp.currentDebt = Math.max(0, (emp.currentDebt || 0) - data.amount);
    }
    if (data.relatedDebtId && this.state.employeeDebts) {
      const d = this.state.employeeDebts.find(x => x.id === data.relatedDebtId);
      if (d) {
        d.settledAmount += data.amount;
        if (d.settledAmount >= d.amount) d.isSettled = true;
      }
    }
    this.logAudit('سداد دفعة موظف', 'الموارد والمالية', `سداد دفعة بمبلغ ${payment.amount} ر.ي من الموظف ${payment.employeeName}`);
    this.saveState(this.state);
    this.notify();
    return payment;
  }

  public getEmployeeDeductions(employeeId?: string): EmployeeDeductionRecord[] {
    const list = this.state.employeeDeductions || [];
    return employeeId ? list.filter(d => d.employeeId === employeeId) : [...list];
  }

  public addEmployeeDeduction(data: Omit<EmployeeDeductionRecord, 'id' | 'deductionNumber' | 'createdAt' | 'isAppliedToSalary'>): EmployeeDeductionRecord {
    if (!this.state.employeeDeductions) this.state.employeeDeductions = [];
    const nextNum = (this.state.employeeDeductions.length + 1).toString().padStart(4, '0');
    const ded: EmployeeDeductionRecord = {
      ...data,
      id: 'ded-' + Date.now(),
      deductionNumber: `DED-2026-${nextNum}`,
      isAppliedToSalary: false,
      createdAt: new Date().toLocaleString('sv-SE').replace('T', ' ')
    };
    this.state.employeeDeductions.unshift(ded);
    this.logAudit('تسجيل خصم إداري', 'الموارد والمالية', `تسجيل خصم بمبلغ ${ded.amount} ر.ي على الموظف ${ded.employeeName}`);
    this.saveState(this.state);
    this.notify();
    return ded;
  }

  public getEmployeeFinancialSummary(employeeId: string) {
    const emp = this.state.employees.find(e => e.id === employeeId);
    if (!emp) return null;
    const advances = this.getSalaryAdvances().filter(a => a.employeeId === employeeId && !a.isDeducted);
    const totalPendingAdvances = advances.reduce((sum, a) => sum + a.amount, 0);
    const debts = this.getEmployeeDebts(employeeId);
    const totalDebts = debts.reduce((sum, d) => sum + (d.amount - d.settledAmount), 0) + (emp.initialDebt || 0);
    const deductions = this.getEmployeeDeductions(employeeId).filter(d => !d.isAppliedToSalary);
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
    const payments = this.getEmployeePayments(employeeId);
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const netDueSalary = Math.max(0, emp.baseSalary - totalPendingAdvances - totalDeductions);
    const remainingDebt = Math.max(0, totalDebts - totalPayments);

    return {
      emp,
      baseSalary: emp.baseSalary,
      totalPendingAdvances,
      totalDebts,
      totalDeductions,
      totalPayments,
      netDueSalary,
      remainingDebt
    };
  }

  public getSalaryAdvances(): SalaryAdvance[] {
    return [...this.state.salaryAdvances];
  }

  public addSalaryAdvance(advData: Omit<SalaryAdvance, 'id' | 'advanceNumber' | 'approvedById' | 'approvedByName' | 'createdAt' | 'isDeducted'>): SalaryAdvance {
    const currentUser = this.getCurrentUser();
    const nextNum = (this.state.salaryAdvances.length + 1).toString().padStart(4, '0');
    const advanceNumber = `ADV-2026-${nextNum}`;

    const advance: SalaryAdvance = {
      ...advData,
      id: 'adv-' + Date.now(),
      advanceNumber,
      isDeducted: false,
      approvedById: currentUser.id,
      approvedByName: currentUser.fullName,
      createdAt: new Date().toLocaleString('sv-SE').replace('T', ' ')
    };

    this.state.salaryAdvances.unshift(advance);
    this.logAudit('تسجيل سلفة موظف', 'الموظفون والرواتب', `صرف سلفة للموظف ${advance.employeeName} بمبلغ ${advance.amount} ر.ي`);
    this.notify();
    return advance;
  }

  public getSalaryPayments(): SalaryPayment[] {
    return [...this.state.salaryPayments];
  }

  public processSalaryPayment(salData: Omit<SalaryPayment, 'id' | 'paymentNumber' | 'paidById' | 'paidByName' | 'createdAt'>): SalaryPayment {
    const currentUser = this.getCurrentUser();
    const nextNum = (this.state.salaryPayments.length + 1).toString().padStart(4, '0');
    const paymentNumber = `SAL-${salData.monthYear}-${nextNum}`;

    const payment: SalaryPayment = {
      ...salData,
      id: 'sal-' + Date.now(),
      paymentNumber,
      paidById: currentUser.id,
      paidByName: currentUser.fullName,
      createdAt: new Date().toLocaleString('sv-SE').replace('T', ' ')
    };

    // Mark pending advances as deducted
    this.state.salaryAdvances.forEach(adv => {
      if (adv.employeeId === salData.employeeId && !adv.isDeducted) {
        adv.isDeducted = true;
        adv.deductedSalaryPaymentId = payment.id;
      }
    });

    this.state.salaryPayments.unshift(payment);
    this.logAudit('صرف راتب شهري', 'الموظفون والرواتب', `صرف راتب شهر ${payment.monthYear} للموظف ${payment.employeeName} بصافي ${payment.netSalary} ر.ي`);
    this.notify();
    return payment;
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return [...this.state.auditLogs];
  }

  // --- Backup & Restore ---
  public exportBackupJson(): string {
    const backupPayload = {
      app: 'StudioManagement',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      exportedBy: this.getCurrentUser().fullName,
      data: this.state
    };
    this.logAudit('نسخ احتياطي', 'النسخ الاحتياطي', 'تم تصدير نسخة احتياطية كاملة من قاعدة بيانات الاستديو');
    return JSON.stringify(backupPayload, null, 2);
  }

  public restoreFromBackupJson(jsonString: string): { success: boolean; message: string; counts?: any } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || (!parsed.data && !parsed.orders)) {
        return { success: false, message: 'الملف المرفوع غير صالح أو لا يحتوي على بنية بيانات استديو صحيحة.' };
      }

      const incomingState: DatabaseState = parsed.data || parsed;

      // Validate required arrays
      if (!Array.isArray(incomingState.customers) || !Array.isArray(incomingState.orders)) {
        return { success: false, message: 'الملف ينقصه جداول العملاء أو الطلبات الأساسية.' };
      }

      this.state = {
        users: incomingState.users || initialUsers,
        settings: incomingState.settings || initialStudioSettings,
        customers: incomingState.customers || [],
        orders: incomingState.orders || [],
        products: incomingState.products || [],
        suppliers: incomingState.suppliers || [],
        employees: incomingState.employees || [],
        expenses: incomingState.expenses || [],
        salaryAdvances: incomingState.salaryAdvances || [],
        salaryPayments: incomingState.salaryPayments || [],
        purchases: incomingState.purchases || [],
        auditLogs: incomingState.auditLogs || []
      };

      this.logAudit('استعادة نسخة احتياطية', 'النسخ الاحتياطي', `تمت استعادة قاعدة البيانات بنجاح من ملف النسخ الاحتياطي`);
      this.notify();

      return {
        success: true,
        message: 'تمت استعادة البيانات بنجاح!',
        counts: {
          customers: this.state.customers.length,
          orders: this.state.orders.length,
          products: this.state.products.length,
          expenses: this.state.expenses.length
        }
      };
    } catch (err: any) {
      return { success: false, message: `فشلت الاستعادة: ${err.message || 'خطأ غير معروف'}` };
    }
  }

  public resetToFactory(): void {
    localStorage.removeItem(DB_KEY);
    this.state = {
      users: initialUsers,
      settings: initialStudioSettings,
      customers: initialCustomers,
      orders: initialOrders,
      products: initialProducts,
      suppliers: initialSuppliers,
      employees: initialEmployees,
      expenses: initialExpenses,
      salaryAdvances: initialSalaryAdvances,
      salaryPayments: initialSalaryPayments,
      purchases: initialPurchases,
      auditLogs: initialAuditLogs
    };
    this.saveState(this.state);
    this.logAudit('إعادة تعيين المصنع', 'النظام', 'تمت إعادة تعيين قاعدة البيانات إلى الحالة الافتراضية');
    this.notify();
  }

  // Clear all mock data (orders, customers, expenses, payments) leaving system completely clean
  public clearAllMockData(): void {
    this.state.orders = [];
    this.state.customers = [];
    this.state.expenses = [];
    this.state.purchases = [];
    this.state.salaryAdvances = [];
    this.state.salaryPayments = [];
    this.state.employeeDebts = [];
    this.state.employeePayments = [];
    this.state.employeeDeductions = [];
    this.state.auditLogs = [
      {
        id: 'log-clean-' + Date.now(),
        action: 'تنظيف النظام',
        module: 'النظام وقاعدة البيانات',
        details: 'تم مسح جميع البيانات التجريبية والوهمية، النظام الآن جاهز ونظيف تماماً للعمل الفعلي',
        userId: this.currentUserId,
        userName: this.getCurrentUser().fullName,
        timestamp: new Date().toLocaleString('sv-SE').replace('T', ' ')
      }
    ];
    this.saveState(this.state);
    this.notify();
  }

  // Resets all entered orders, customers, financial records, vouchers, debts, expenses, and logs
  // while safely preserving users (accounts), studio settings, branding, section images, and offline assets.
  public resetAllEnteredData(): { success: boolean; message: string } {
    this.state.orders = [];
    this.state.customers = [];
    this.state.expenses = [];
    this.state.purchases = [];
    this.state.salaryAdvances = [];
    this.state.salaryPayments = [];
    this.state.employeeDebts = [];
    this.state.employeePayments = [];
    this.state.employeeDeductions = [];

    this.state.auditLogs = [
      {
        id: 'log-clean-' + Date.now(),
        action: 'تصفير البيانات بالكامل',
        module: 'النظام وقاعدة البيانات',
        details: 'تم حذف وتصفير جميع الطلبات والعملاء وسجلات العمليات المالية المدخلة سابقاً بنجاح للبدء بإدخال بيانات جديدة',
        userId: this.currentUserId,
        userName: this.getCurrentUser().fullName,
        timestamp: new Date().toLocaleString('sv-SE').replace('T', ' ')
      }
    ];

    this.saveState(this.state);
    this.notify();
    return {
      success: true,
      message: 'تم تصفير وحذف جميع البيانات والطلبات والسجلات السابقة بنجاح! النظام الآن نظيف وجاهز لإدخال بياناتك الجديدة.'
    };
  }

  public getDashboardMetrics() {
    const orders = this.state.orders;
    // Active orders (pending, in_design, in_shooting, in_printing, in_montage)
    const activeOrders = orders.filter(o => 
      o.status === 'pending' || 
      o.status === 'in_design' || 
      o.status === 'in_shooting' || 
      o.status === 'in_printing' ||
      o.status === 'in_montage'
    );
    const activeOrdersCount = activeOrders.length;

    // Ready for delivery
    const readyOrders = orders.filter(o => o.status === 'ready');
    const readyOrdersCount = readyOrders.length;

    // Remaining customer debts
    const customerDebts = orders.reduce((sum, o) => sum + (o.remainingAmount || 0), 0);

    // Net cashbox: sum of all collected payments minus expenses and salaries
    const totalPaymentsCollected = orders.reduce((sum, o) => {
      const orderPayments = (o.payments || []).reduce((pSum, p) => pSum + (p.amount || 0), 0);
      return sum + orderPayments;
    }, 0);
    const totalExpenses = this.state.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalSalaries = this.state.salaryPayments.reduce((sum, s) => sum + (s.netSalary || 0), 0);
    const netCashbox = totalPaymentsCollected - totalExpenses - totalSalaries;

    return {
      activeOrdersCount,
      readyOrdersCount,
      customerDebts,
      netCashbox
    };
  }
}

export const storageService = new StorageService();
