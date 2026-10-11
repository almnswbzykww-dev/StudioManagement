import React, { useState, useMemo } from 'react';
import { Expense, PaymentRecord, PaymentMethod, BankWalletType, Order, AuditLog } from '../../types';
import { storageService } from '../../services/storageService';
import { PageShell } from '../common/PageShell';
import { EmptyState } from '../common/EmptyState';
import { InvoiceModal } from '../common/InvoiceModal';
import { PrintVoucherModal, VoucherType } from '../common/PrintVoucherModal';
import { 
  CircleDollarSign, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Trash2, 
  X, 
  FileText, 
  Banknote,
  Building,
  CheckCircle2,
  Filter,
  Search,
  Download,
  Printer,
  ShieldCheck,
  Eye,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle,
  History
} from 'lucide-react';

interface AccountingPageProps {
  onClose: () => void;
  onEditOrder?: (order: Order) => void;
}

export const AccountingPage: React.FC<AccountingPageProps> = ({ onClose, onEditOrder }) => {
  const [activeTab, setActiveTab] = useState<'cashier_audit' | 'invoices_review' | 'payments' | 'modifications' | 'treasury' | 'expenses'>('cashier_audit');
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Search and Filter States (Requirement 5: البحث حسب التاريخ، الوقت، رقم الفاتورة، اسم العميل)
  const [searchDate, setSearchDate] = useState('');
  const [searchTime, setSearchTime] = useState('');
  const [searchInvoiceNumber, setSearchInvoiceNumber] = useState('');
  const [searchCustomerName, setSearchCustomerName] = useState('');
  const [selectedCashier, setSelectedCashier] = useState<string>('all');

  // Viewing invoice modal
  const [viewingInvoiceOrder, setViewingInvoiceOrder] = useState<Order | null>(null);

  // Print voucher modal state for every operation and transaction
  const [printVoucherData, setPrintVoucherData] = useState<{
    isOpen: boolean;
    type: VoucherType;
    title?: string;
    data: any;
  }>({
    isOpen: false,
    type: 'payment',
    data: null
  });

  const openPrintVoucher = (type: VoucherType, data: any, title?: string) => {
    setPrintVoucherData({
      isOpen: true,
      type,
      title,
      data
    });
  };

  // Form fields for expense
  const [category, setCategory] = useState('إيجار الاستديو');
  const [amount, setAmount] = useState<number | string>('');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [walletType, setWalletType] = useState<BankWalletType>('kuraimi');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [errorMsg, setErrorMsg] = useState('');

  const orders = storageService.getOrders();
  const expenses = storageService.getExpenses();
  const allPayments = storageService.getAllPayments();
  const users = storageService.getUsers();
  const auditLogs = storageService.getAuditLogs();
  const settings = storageService.getSettings();
  const currency = settings.currency;
  const canEdit = storageService.canEditInvoices();

  const todayStr = new Date().toISOString().split('T')[0];

  // Financial Computations
  const totalRevenues = allPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenues - totalExpenses;

  // Filtered Cashier Operations Review (Requirement 4 & 5: اسم المستخدم، رقم المستخدم، العملية، رقم الفاتورة/الطلب، التاريخ، الوقت)
  const cashierLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Must be cashier/order/payment related or general audit log
      const isCashierOp = 
        log.module === 'المدفوعات والصندوق' || 
        log.module === 'المحاسبة والمصروفات' ||
        log.action.includes('فاتورة') ||
        log.action.includes('طلب') ||
        log.action.includes('دفعة') ||
        Boolean(log.orderNumber);

      if (!isCashierOp) return false;

      // Filter by Date
      if (searchDate && log.date && !log.date.includes(searchDate) && !log.timestamp.includes(searchDate)) {
        return false;
      }

      // Filter by Time
      if (searchTime && log.time && !log.time.toLowerCase().includes(searchTime.toLowerCase())) {
        return false;
      }

      // Filter by Invoice Number
      if (searchInvoiceNumber) {
        const query = searchInvoiceNumber.toLowerCase();
        const matchesOrder = log.orderNumber && log.orderNumber.toLowerCase().includes(query);
        const matchesDetails = log.details.toLowerCase().includes(query);
        if (!matchesOrder && !matchesDetails) return false;
      }

      // Filter by Customer / User
      if (searchCustomerName) {
        const query = searchCustomerName.toLowerCase();
        const matchesCust = log.details.toLowerCase().includes(query);
        const matchesUser = log.userName.toLowerCase().includes(query);
        if (!matchesCust && !matchesUser) return false;
      }

      if (selectedCashier !== 'all' && log.userId !== selectedCashier) {
        return false;
      }

      return true;
    });
  }, [auditLogs, searchDate, searchTime, searchInvoiceNumber, searchCustomerName, selectedCashier]);

  // Filtered Invoices List (Requirement 5: مراجعة الفواتير السابقة + البحث حسب التاريخ، الوقت، رقم الفاتورة، اسم العميل)
  const filteredInvoices = useMemo(() => {
    return orders.filter(order => {
      if (searchInvoiceNumber && !order.orderNumber.toLowerCase().includes(searchInvoiceNumber.toLowerCase())) {
        return false;
      }
      if (searchCustomerName && !order.customerName.toLowerCase().includes(searchCustomerName.toLowerCase()) && !order.customerPhone.includes(searchCustomerName)) {
        return false;
      }
      if (searchDate && order.orderDate !== searchDate && !order.createdAt.includes(searchDate)) {
        return false;
      }
      if (searchTime && !order.createdAt.toLowerCase().includes(searchTime.toLowerCase())) {
        return false;
      }
      if (selectedCashier !== 'all' && order.createdById !== selectedCashier) {
        return false;
      }
      return true;
    });
  }, [orders, searchInvoiceNumber, searchCustomerName, searchDate, searchTime, selectedCashier]);

  // Filtered Payments List (Requirement 5: مراجعة الدفعات)
  const filteredPayments = useMemo(() => {
    return allPayments.filter(p => {
      if (searchInvoiceNumber && !p.orderNumber.toLowerCase().includes(searchInvoiceNumber.toLowerCase())) {
        return false;
      }
      if (searchCustomerName && !p.customerName.toLowerCase().includes(searchCustomerName.toLowerCase())) {
        return false;
      }
      if (searchDate && p.date !== searchDate) {
        return false;
      }
      if (searchTime && !p.time.toLowerCase().includes(searchTime.toLowerCase())) {
        return false;
      }
      if (selectedCashier !== 'all' && p.cashierId !== selectedCashier) {
        return false;
      }
      return true;
    });
  }, [allPayments, searchInvoiceNumber, searchCustomerName, searchDate, searchTime, selectedCashier]);

  // Filtered Modifications & Cancellations (Requirement 5: مراجعة التعديلات والإلغاءات حسب الصلاحيات)
  const modificationsLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const isModOrCancel = 
        log.action.includes('تعديل') || 
        log.action.includes('حذف') || 
        log.action.includes('إلغاء') || 
        log.action.includes('صلاحيات') ||
        log.action.includes('تغيير');
      
      if (!isModOrCancel) return false;

      if (searchDate && log.date && !log.date.includes(searchDate)) return false;
      if (searchInvoiceNumber && log.orderNumber && !log.orderNumber.toLowerCase().includes(searchInvoiceNumber.toLowerCase())) return false;
      return true;
    });
  }, [auditLogs, searchDate, searchInvoiceNumber]);

  // Export to Excel / CSV with UTF-8 BOM
  const handleExportExcel = () => {
    let rows: string[][] = [];
    let filename = `Accounting_Export_${todayStr}.csv`;

    if (activeTab === 'cashier_audit') {
      filename = `Cashier_Operations_${todayStr}.csv`;
      rows.push(['اسم المستخدم', 'رقم المستخدم', 'العملية', 'رقم الفاتورة/الطلب', 'التاريخ', 'الوقت', 'التفاصيل']);
      cashierLogs.forEach(l => {
        rows.push([
          `"${l.userName}"`,
          `"#${l.userNumber || '-'}"`,
          `"${l.action}"`,
          `"${l.orderNumber || '-'}"`,
          `"${l.date || l.timestamp.split(' ')[0]}"`,
          `"${l.time || l.timestamp.split(' ')[1] || '-'}"`,
          `"${l.details.replace(/"/g, '""')}"`
        ]);
      });
    } else if (activeTab === 'invoices_review') {
      filename = `Invoices_Report_${todayStr}.csv`;
      rows.push(['رقم الفاتورة', 'اسم العميل', 'الهاتف', 'نوع الطلب', 'تاريخ الطلب', 'السعر الإجمالي', 'المدفوع', 'المتبقي', 'الحالة', 'الكاشير']);
      filteredInvoices.forEach(o => {
        rows.push([
          `"${o.orderNumber}"`,
          `"${o.customerName}"`,
          `"${o.customerPhone}"`,
          `"${o.serviceTitle}"`,
          `"${o.orderDate}"`,
          `"${o.totalAmount}"`,
          `"${o.paidAmount}"`,
          `"${o.remainingAmount}"`,
          `"${o.status}"`,
          `"${o.createdByName}"`
        ]);
      });
    } else {
      filename = `Payments_Report_${todayStr}.csv`;
      rows.push(['رقم الفاتورة', 'العميل', 'المبلغ', 'طريقة الدفع', 'المحفظة / الحساب', 'رقم المرجع', 'التاريخ', 'الوقت', 'الكاشير']);
      filteredPayments.forEach(p => {
        rows.push([
          `"${p.orderNumber}"`,
          `"${p.customerName}"`,
          `"${p.amount}"`,
          `"${p.method === 'cash' ? 'نقدي' : 'بنكي'}"`,
          `"${p.walletName || '-'}"`,
          `"${p.transactionNumber || '-'}"`,
          `"${p.date}"`,
          `"${p.time}"`,
          `"${p.cashierName}"`
        ]);
      });
    }

    const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export to Print / PDF report
  const handlePrintReport = () => {
    window.print();
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('يرجى إدخال مبلغ صحيح.');
      return;
    }
    if (!recipient.trim()) {
      setErrorMsg('يرجى تحديد اسم المستلم / الجهة.');
      return;
    }

    try {
      storageService.addExpense({
        category,
        amount: numAmount,
        date: expenseDate,
        time: new Date().toTimeString().split(' ')[0],
        recipient,
        description,
        paymentMethod,
        walletType: paymentMethod === 'bank_wallet' ? walletType : undefined
      });

      setShowAddExpense(false);
      setAmount('');
      setRecipient('');
      setDescription('');
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ المصروف');
    }
  };

  const handleEditInvoiceClick = (order: Order) => {
    if (!canEdit) {
      alert('⚠️ تنبيه الصلاحيات: لا تستطيع تعديل الفاتورة المحفوظة. تعديل الفواتير مخصص لمدير النظام أو لمن يمنحه الصلاحية.');
      return;
    }
    if (onEditOrder) {
      onEditOrder(order);
    }
  };

  return (
    <PageShell
      title="الحسابات، الكشوفات، ومراجعة أعمال الكاشير"
      subtitle="متابعة دقيقة لعمليات الكاشير، الفواتير السابقة، الدفعات، التعديلات، والخزينة العامة"
      icon={<CircleDollarSign className="w-5 h-5 text-emerald-400" />}
      onClose={onClose}
      actions={
        <div className="flex items-center gap-2">
          {/* Export to Excel */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="تصدير الكشف إلى ملف Excel (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>تصدير Excel</span>
          </button>

          {/* Print / PDF */}
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-700/80 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="طباعة الكشف / حفظ كـ PDF"
          >
            <Printer className="w-4 h-4 text-blue-300" />
            <span>طباعة PDF</span>
          </button>

          {/* Add Expense Button */}
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>سند صرف</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* KPI Mini Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/85 border border-slate-800 p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">إجمالي الإيرادات</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-black text-white font-mono">
              {totalRevenues.toLocaleString()} <span className="text-xs text-slate-400 font-sans">{currency}</span>
            </p>
          </div>

          <div className="bg-slate-900/85 border border-slate-800 p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">إجمالي المصروفات</span>
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-xl font-black text-rose-400 font-mono">
              {totalExpenses.toLocaleString()} <span className="text-xs text-slate-400 font-sans">{currency}</span>
            </p>
          </div>

          <div className="bg-slate-900/85 border border-slate-800 p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">صافي الأرباح</span>
              <CircleDollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <p className={`text-xl font-black font-mono ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netProfit.toLocaleString()} <span className="text-xs text-slate-400 font-sans">{currency}</span>
            </p>
          </div>

          <div className="bg-slate-900/85 border border-slate-800 p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">عدد الفواتير المسجلة</span>
              <Receipt className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-black text-amber-300 font-mono">
              {orders.length} <span className="text-xs text-slate-400 font-sans">فاتورة</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation (Requirement 4 & 5) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('cashier_audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'cashier_audit'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>مراجعة عمليات الكاشير</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices_review')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'invoices_review'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>مراجعة الفواتير السابقة</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'payments'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>مراجعة الدفعات</span>
          </button>

          <button
            onClick={() => setActiveTab('modifications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'modifications'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>مراجعة التعديلات والإلغاءات</span>
          </button>

          <button
            onClick={() => setActiveTab('treasury')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'treasury'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>الخزينة والأرصدة</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'expenses'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>المصروفات اليومية</span>
          </button>
        </div>

        {/* Universal Search & Filter Bar (Requirement 5: البحث حسب التاريخ، الوقت، رقم الفاتورة، اسم العميل) */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>أدوات البحث والفلترة السريعة:</span>
            </span>
            {(searchDate || searchTime || searchInvoiceNumber || searchCustomerName || selectedCashier !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchDate('');
                  setSearchTime('');
                  setSearchInvoiceNumber('');
                  setSearchCustomerName('');
                  setSelectedCashier('all');
                }}
                className="text-[11px] text-rose-400 hover:underline cursor-pointer"
              >
                تفريغ الفلاتر
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            {/* 1. البحث حسب التاريخ */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">البحث حسب التاريخ (Date)</label>
              <div className="relative">
                <input
                  type="date"
                  value={searchDate}
                  onChange={e => setSearchDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            {/* 2. البحث حسب الوقت */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">البحث حسب الوقت (Time)</label>
              <input
                type="text"
                value={searchTime}
                onChange={e => setSearchTime(e.target.value)}
                placeholder="مثال: 10:24 أو PM"
                dir="ltr"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono text-center focus:border-amber-400 outline-none"
              />
            </div>

            {/* 3. البحث حسب رقم الفاتورة */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">البحث حسب رقم الفاتورة</label>
              <input
                type="text"
                value={searchInvoiceNumber}
                onChange={e => setSearchInvoiceNumber(e.target.value)}
                placeholder="ORD-2026-..."
                dir="ltr"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono text-center focus:border-amber-400 outline-none"
              />
            </div>

            {/* 4. البحث حسب اسم العميل */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">البحث حسب اسم العميل</label>
              <input
                type="text"
                value={searchCustomerName}
                onChange={e => setSearchCustomerName(e.target.value)}
                placeholder="أدخل اسم العميل..."
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>

            {/* 5. تصفية بحسب الكاشير / المستخدم */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">المستخدم / الكاشير</label>
              <select
                value={selectedCashier}
                onChange={e => setSelectedCashier(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 outline-none"
              >
                <option value="all">كافة الكاشير والمستخدمين</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    #{u.userNumber} - {u.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab 1: مراجعة عمليات الكاشير (Requirement 4: اسم المستخدم، رقم المستخدم، العملية، رقم الفاتورة/الطلب، التاريخ، الوقت) */}
        {activeTab === 'cashier_audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-amber-400">📋</span>
                  <span>سجل مراجعة وتدقيق أعمال الكاشير (Cashier Audit Log)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  توثيق دقيق لكل عملية كاشير تشمل اسم المستخدم ورقم المستخدم والعملية ورقم الفاتورة والتاريخ والوقت
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  title="طباعة كشف حركات الكاشير"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>طباعة كشف الحركات</span>
                </button>

                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  {cashierLogs.length} حركة مسجلة
                </span>
              </div>
            </div>

            {cashierLogs.length === 0 ? (
              <EmptyState
                title="لا توجد عمليات كاشير مطابقة"
                description="لم يتم العثور على أي حركات كاشير وفق معايير البحث والفلترة المحددة."
              />
            ) : (
              <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/80 shadow-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">رقم المستخدم</th>
                      <th className="py-3 px-4">اسم المستخدم</th>
                      <th className="py-3 px-4">العملية المنجزة</th>
                      <th className="py-3 px-4">رقم الفاتورة / الطلب</th>
                      <th className="py-3 px-4">التاريخ (English)</th>
                      <th className="py-3 px-4">الوقت (English)</th>
                      <th className="py-3 px-4">تفاصيل الحركة</th>
                      <th className="py-3 px-4 text-center">طباعة العملية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {cashierLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-850/50">
                        {/* 1. رقم المستخدم */}
                        <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                          #{log.userNumber || 1}
                        </td>

                        {/* 2. اسم المستخدم */}
                        <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                            <span>{log.userName}</span>
                          </div>
                        </td>

                        {/* 3. العملية */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            log.action.includes('إنشاء') 
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                              : log.action.includes('دفعة')
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {log.action}
                          </span>
                        </td>

                        {/* 4. رقم الفاتورة/الطلب */}
                        <td className="py-3 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                          {log.orderNumber ? (
                            <span className="bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                              {log.orderNumber}
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>

                        {/* 5. التاريخ بالأرقام الإنجليزية */}
                        <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                          {log.date || log.timestamp.split(' ')[0]}
                        </td>

                        {/* 6. الوقت بالأرقام الإنجليزية */}
                        <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap" dir="ltr">
                          {log.time || log.timestamp.split(' ')[1] || '10:00 AM'}
                        </td>

                        {/* 7. تفاصيل الحركة */}
                        <td className="py-3 px-4 text-slate-400 text-[11px] max-w-sm truncate">
                          {log.details}
                        </td>

                        {/* 8. طباعة إشعار العملية */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openPrintVoucher('cashier_audit', log, `إشعار عملية كاشير: ${log.action}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold cursor-pointer transition-all shadow-sm"
                            title="طباعة إشعار رسمي وتوثيق لهذه الحركة"
                          >
                            <Printer className="w-3.5 h-3.5 text-amber-300" />
                            <span>طباعة الإشعار</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: مراجعة الفواتير السابقة (Requirement 5: مراجعة الفواتير السابقة) */}
        {activeTab === 'invoices_review' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-400" />
                  <span>مراجعة الفواتير السابقة والطلبات المسجلة</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  استعراض الفواتير السابقة، الطباعة، ومراجعة تفاصيل السعر والمدفوع والمتبقي
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  title="طباعة كشف الفواتير المحفوظة"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-300" />
                  <span>طباعة كشف الفواتير</span>
                </button>

                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  {filteredInvoices.length} فاتورة
                </span>
              </div>
            </div>

            {filteredInvoices.length === 0 ? (
              <EmptyState
                title="لا توجد فواتير مطابقة"
                description="لم يتم العثور على أي فواتير تطابق معايير البحث الحالية."
              />
            ) : (
              <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/80 shadow-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">رقم الفاتورة</th>
                      <th className="py-3 px-4">العميل</th>
                      <th className="py-3 px-4">نوع الطلب</th>
                      <th className="py-3 px-4">تاريخ الطلب</th>
                      <th className="py-3 px-4">السعر</th>
                      <th className="py-3 px-4">المدفوع</th>
                      <th className="py-3 px-4">المتبقي</th>
                      <th className="py-3 px-4">الكاشير المنشئ</th>
                      <th className="py-3 px-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredInvoices.map(order => (
                      <tr key={order.id} className="hover:bg-slate-850/50">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-white">{order.customerName}</p>
                          <p className="text-[11px] text-slate-400 font-mono" dir="ltr">{order.customerPhone}</p>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-300">
                          {order.serviceTitle}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                          {order.orderDate}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                          {order.totalAmount.toLocaleString()} {currency}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                          {order.paidAmount.toLocaleString()} {currency}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                          <span className={order.remainingAmount > 0 ? 'text-amber-400' : 'text-slate-500'}>
                            {order.remainingAmount.toLocaleString()} {currency}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                          {order.createdByName}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Preview & Print Invoice */}
                            <button
                              onClick={() => setViewingInvoiceOrder(order)}
                              className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-600/30 rounded-lg cursor-pointer transition-colors"
                              title="معاينة وطباعة الفاتورة"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Edit Invoice (Restricted according to permissions) */}
                            <button
                              onClick={() => handleEditInvoiceClick(order)}
                              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                                canEdit ? 'text-amber-400 hover:text-white hover:bg-amber-600/30' : 'text-slate-600 hover:text-amber-400'
                              }`}
                              title={canEdit ? "تعديل الفاتورة المحفوظة" : "تعديل الفاتورة مقفل للكاشير (خاص بالمدير)"}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: مراجعة الدفعات (Requirement 5: مراجعة الدفعات) */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span>مراجعة الدفعات المسجلة وسندات القبض</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  تفاصيل المبالغ المحصلة نقدياً وعبر المحافظ الإلكترونية والحسابات البنكية
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  title="طباعة كشف الدفعات والمقبوضات"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-300" />
                  <span>طباعة كشف الدفعات</span>
                </button>

                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {filteredPayments.length} دفعة
                </span>
              </div>
            </div>

            {filteredPayments.length === 0 ? (
              <EmptyState
                title="لا توجد دفعات مطابقة"
                description="لم يتم العثور على أي دفعات محصلة تطابق معايير البحث."
              />
            ) : (
              <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/80 shadow-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">رقم الفاتورة</th>
                      <th className="py-3 px-4">اسم العميل</th>
                      <th className="py-3 px-4">المبلغ المقبوض</th>
                      <th className="py-3 px-4">طريقة الدفع</th>
                      <th className="py-3 px-4">المحفظة / الحساب</th>
                      <th className="py-3 px-4">رقم المرجع / الإشعار</th>
                      <th className="py-3 px-4">التاريخ</th>
                      <th className="py-3 px-4">الوقت</th>
                      <th className="py-3 px-4">المستلم (الكاشير)</th>
                      <th className="py-3 px-4 text-center">طباعة السند</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredPayments.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-slate-850/50">
                        <td className="py-3 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                          {p.orderNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                          {p.customerName}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                          {p.amount.toLocaleString()} {currency}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.method === 'cash' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {p.method === 'cash' ? '💵 نقدي' : '🏦 بنكي / إلكتروني'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                          {p.walletName || '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-amber-400 whitespace-nowrap">
                          {p.transactionNumber || '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                          {p.date}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap" dir="ltr">
                          {p.time || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                          {p.cashierName}
                        </td>

                        {/* زر طباعة سند القبض */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openPrintVoucher('payment', p, `سند قبض: ${p.customerName} - ${p.orderNumber}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold cursor-pointer transition-all shadow-sm"
                            title="طباعة سند قبض رسمي لهذه الدفعة"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-300" />
                            <span>طباعة سند القبض</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: مراجعة التعديلات والإلغاءات حسب الصلاحيات (Requirement 5) */}
        {activeTab === 'modifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>مراجعة التعديلات والإلغاءات والحركات الحساسة</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  سجل خاص بالمدير لمراقبة أي تعديل أو إلغاء تم على الفواتير والأسعار والصلاحيات
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  title="طباعة سجل التعديلات والرقابة"
                >
                  <Printer className="w-3.5 h-3.5 text-purple-300" />
                  <span>طباعة سجل التعديلات</span>
                </button>

                <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  {modificationsLogs.length} حركة تعديل
                </span>
              </div>
            </div>

            {modificationsLogs.length === 0 ? (
              <EmptyState
                title="لا توجد تعديلات أو إلغاءات"
                description="لم تسجل أي عمليات تعديل أو إلغاء في السجل حتى الآن."
              />
            ) : (
              <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/80 shadow-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">التاريخ والوقت</th>
                      <th className="py-3 px-4">رقم المستخدم</th>
                      <th className="py-3 px-4">المستخدم الفاعل</th>
                      <th className="py-3 px-4">نوع التعديل / الإلغاء</th>
                      <th className="py-3 px-4">رقم الفاتورة المتأثرة</th>
                      <th className="py-3 px-4">تفاصيل التعديل</th>
                      <th className="py-3 px-4 text-center">طباعة الإشعار</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {modificationsLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-850/50">
                        <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                          #{log.userNumber || 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                          {log.userName}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-cyan-400 whitespace-nowrap">
                          {log.orderNumber || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-[11px]">
                          {log.details}
                        </td>

                        {/* زر طباعة إشعار التعديل */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openPrintVoucher('modification', log, `إشعار رقابة وتعديل: ${log.action}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-lg text-[11px] font-bold cursor-pointer transition-all shadow-sm"
                            title="طباعة إشعار رسمي لهذا التعديل"
                          >
                            <Printer className="w-3.5 h-3.5 text-purple-300" />
                            <span>طباعة الإشعار</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: الخزينة والأرصدة */}
        {activeTab === 'treasury' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-white">تفاصيل أرصدة الخزينة والمحافظ الإلكترونية</h3>
              <button
                type="button"
                onClick={() => openPrintVoucher('treasury', {
                  cashBalance: allPayments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0),
                  bankBalance: allPayments.filter(p => p.method === 'bank_wallet').reduce((sum, p) => sum + p.amount, 0),
                  debtsBalance: orders.reduce((sum, o) => sum + o.remainingAmount, 0)
                }, 'كشف جرد الخزينة والسيولة الشامل')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                title="طباعة تقرير جرد الخزينة والمحافظ"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-300" />
                <span>طباعة تقرير الخزينة الشامل</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">السيولة النقدية (الصندوق / الكاش)</span>
                  <button
                    type="button"
                    onClick={() => openPrintVoucher('treasury', {
                      cashBalance: allPayments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0),
                      bankBalance: 0,
                      debtsBalance: 0
                    }, 'كشف جرد الصندوق والسيولة النقدية')}
                    className="p-1 text-emerald-400 hover:text-white hover:bg-emerald-600/30 rounded-lg transition-all"
                    title="طباعة جرد الكاش"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-2xl font-black text-emerald-400 font-mono">
                  {allPayments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0).toLocaleString()} {currency}
                </p>
                <p className="text-[11px] text-slate-500">المبالغ المقبوضة كاش في درج الكاشير</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">أرصدة المحافظ البنكية والإلكترونية</span>
                  <button
                    type="button"
                    onClick={() => openPrintVoucher('treasury', {
                      cashBalance: 0,
                      bankBalance: allPayments.filter(p => p.method === 'bank_wallet').reduce((sum, p) => sum + p.amount, 0),
                      debtsBalance: 0
                    }, 'كشف أرصدة المحافظ البنكية والإلكترونية')}
                    className="p-1 text-blue-400 hover:text-white hover:bg-blue-600/30 rounded-lg transition-all"
                    title="طباعة جرد المحافظ"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-2xl font-black text-blue-400 font-mono">
                  {allPayments.filter(p => p.method === 'bank_wallet').reduce((sum, p) => sum + p.amount, 0).toLocaleString()} {currency}
                </p>
                <p className="text-[11px] text-slate-500">إجمالي الحوالات والمحافظ (كريمي، جيب، ون كاش)</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">إجمالي الديون المتبقية على العملاء</span>
                  <button
                    type="button"
                    onClick={() => openPrintVoucher('treasury', {
                      cashBalance: 0,
                      bankBalance: 0,
                      debtsBalance: orders.reduce((sum, o) => sum + o.remainingAmount, 0)
                    }, 'كشف ديون العملاء المتبقية')}
                    className="p-1 text-amber-400 hover:text-white hover:bg-amber-600/30 rounded-lg transition-all"
                    title="طباعة تقرير الديون"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-2xl font-black text-amber-400 font-mono">
                  {orders.reduce((sum, o) => sum + o.remainingAmount, 0).toLocaleString()} {currency}
                </p>
                <p className="text-[11px] text-slate-500">مبالغ مستحقة للتحصيل عند تسليم الطلبات</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: المصروفات اليومية */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-white">سجل المصروفات وسندات الصرف اليومية</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  title="طباعة كشف المصروفات"
                >
                  <Printer className="w-3.5 h-3.5 text-rose-300" />
                  <span>طباعة كشف المصروفات</span>
                </button>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>سند صرف جديد</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/80 shadow-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">رقم السند</th>
                    <th className="py-3 px-4">بند المصروف</th>
                    <th className="py-3 px-4">المبلغ المنصرف</th>
                    <th className="py-3 px-4">المستلم / الجهة</th>
                    <th className="py-3 px-4">طريقة الصرف</th>
                    <th className="py-3 px-4">التاريخ</th>
                    <th className="py-3 px-4">البيان</th>
                    <th className="py-3 px-4 text-center">طباعة السند</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {expenses.map(e => (
                    <tr key={e.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4 font-mono font-bold text-rose-400">{e.voucherNumber}</td>
                      <td className="py-3 px-4 font-bold text-white">{e.category}</td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-400">{e.amount.toLocaleString()} {currency}</td>
                      <td className="py-3 px-4 text-slate-300">{e.recipient}</td>
                      <td className="py-3 px-4">{e.paymentMethod === 'cash' ? '💵 نقدي' : '🏦 بنكي'}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{e.date}</td>
                      <td className="py-3 px-4 text-slate-400">{e.description || '-'}</td>

                      {/* زر طباعة سند الصرف */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openPrintVoucher('expense', e, `سند صرف: ${e.recipient} - ${e.voucherNumber}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-[11px] font-bold cursor-pointer transition-all shadow-sm"
                          title="طباعة سند صرف رسمي لهذا المصروف"
                        >
                          <Printer className="w-3.5 h-3.5 text-rose-300" />
                          <span>طباعة سند الصرف</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Expense Modal */}
        {showAddExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-100 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h3 className="text-base font-bold text-white">تسجيل سند صرف مصروف</h3>
                <button
                  onClick={() => setShowAddExpense(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl mb-4">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSaveExpense} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">بند المصروف</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="إيجار الاستديو">إيجار الاستديو</option>
                    <option value="كهرباء ومياه وطاقة شمسية">كهرباء ومياه وطاقة شمسية</option>
                    <option value="أحبار وورق ومستلزمات طباعة">أحبار وورق ومستلزمات طباعة</option>
                    <option value="صيانة دورية للمعدات والكاميرات">صيانة دورية للمعدات والكاميرات</option>
                    <option value="ضيافة ونظافة الاستديو">ضيافة ونظافة الاستديو</option>
                    <option value="إعلانات وتسويق ورعاية">إعلانات وتسويق ورعاية</option>
                    <option value="أجور نقل ومواصلات">أجور نقل ومواصلات</option>
                    <option value="مصروفات إدارية أخرى">مصروفات إدارية أخرى</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      المبلغ المنصرف ({currency}) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-rose-400 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">تاريخ الصرف</label>
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={e => setExpenseDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    المستلم / الجهة <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    placeholder="اسم الشخص أو الشركة المستلمة للمبلغ"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">طريقة الصرف</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-2 rounded-lg text-xs font-semibold cursor-pointer border ${
                        paymentMethod === 'cash' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      💵 نقدي من الصندوق
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_wallet')}
                      className={`p-2 rounded-lg text-xs font-semibold cursor-pointer border ${
                        paymentMethod === 'bank_wallet' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      🏦 تحويل بنكي / محفظة
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">البيان والشرح</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="شرح تفاصيل المصروف..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 cursor-pointer"
                  >
                    حفظ وتأكيد السند
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invoice Preview Modal */}
        {viewingInvoiceOrder && (
          <InvoiceModal
            order={viewingInvoiceOrder}
            isOpen={Boolean(viewingInvoiceOrder)}
            onClose={() => setViewingInvoiceOrder(null)}
          />
        )}

        {/* Universal Print Voucher Modal for Operations */}
        {printVoucherData.isOpen && (
          <PrintVoucherModal
            isOpen={printVoucherData.isOpen}
            onClose={() => setPrintVoucherData(prev => ({ ...prev, isOpen: false }))}
            voucherType={printVoucherData.type}
            title={printVoucherData.title}
            data={printVoucherData.data}
          />
        )}

      </div>
    </PageShell>
  );
};
