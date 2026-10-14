import React, { useState, useMemo, useRef } from 'react';
import { Customer, Order, PaymentRecord } from '../../types';
import { storageService } from '../../services/storageService';
import { 
  X, 
  Printer, 
  FileText, 
  Calendar, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Share2, 
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { WalletIcon, getWalletConfig } from './WalletIcons';

interface CustomerStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
}

interface StatementLedgerRow {
  id: string;
  date: string;
  time: string;
  type: 'order' | 'payment';
  typeLabel: string;
  referenceNumber: string;
  description: string;
  debit: number;   // مدين (عليه)
  credit: number;  // دائن (له / سداد)
  balance: number; // الرصيد التراكمي
  paymentMethod?: string;
  walletType?: string;
  walletName?: string;
}

export const CustomerStatementModal: React.FC<CustomerStatementModalProps> = ({
  isOpen,
  onClose,
  customer
}) => {
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'three_months' | 'custom'>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !customer) return null;

  const settings = storageService.getSettings();
  const currency = settings.currency || 'ر.ي';
  const allOrders = storageService.getOrders().filter(o => o.customerId === customer.id);
  const allPayments: PaymentRecord[] = storageService.getAllPayments().filter((p: PaymentRecord) => {
    // Match either by order's customerId or customerName
    const order = allOrders.find(o => o.id === p.orderId);
    return order !== undefined || p.customerName === customer.name;
  });

  // Calculate Ledger Entries
  const statementData = useMemo(() => {
    const rawRows: {
      date: string;
      time: string;
      type: 'order' | 'payment';
      typeLabel: string;
      referenceNumber: string;
      description: string;
      debit: number;
      credit: number;
      walletType?: string;
      walletName?: string;
      rawTimestamp: number;
    }[] = [];

    // 1. Add Orders as Debit (مدين - عليه)
    allOrders.forEach(order => {
      const orderDate = order.orderDate || order.createdAt.split('T')[0];
      const rawTimestamp = new Date(order.createdAt || `${orderDate}T12:00:00`).getTime();
      rawRows.push({
        date: orderDate,
        time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
        type: 'order',
        typeLabel: 'فاتورة طلب',
        referenceNumber: order.orderNumber,
        description: `طلب خدمة: ${order.serviceTitle}${order.items && order.items.length > 0 ? ` (${order.items.length} بنود)` : ''}`,
        debit: order.totalAmount,
        credit: 0,
        rawTimestamp
      });
    });

    // 2. Add Payments as Credit (دائن - له)
    allPayments.forEach((pay: PaymentRecord) => {
      const payDate = pay.date;
      const rawTimestamp = new Date(`${payDate}T${pay.time || '12:00:00'}`).getTime();
      const methodLabel = pay.method === 'cash' 
        ? 'سند قبض نقدي' 
        : `دفعة عبر ${pay.walletName || 'المحفظة الإلكترونية'}`;

      rawRows.push({
        date: payDate,
        time: pay.time || '12:00:00',
        type: 'payment',
        typeLabel: methodLabel,
        referenceNumber: pay.transactionNumber || pay.transferNumber || `PAY-${pay.id.substring(0, 6)}`,
        description: `سداد للطلب رقم ${pay.orderNumber}${pay.senderName ? ` (المحول: ${pay.senderName})` : ''}${pay.notes ? ` - ${pay.notes}` : ''}`,
        debit: 0,
        credit: pay.amount,
        walletType: pay.walletType,
        walletName: pay.walletName,
        rawTimestamp
      });
    });

    // Sort chronologically ascending to calculate running balance
    rawRows.sort((a, b) => a.rawTimestamp - b.rawTimestamp);

    // Apply Date Range Filter if selected
    const now = new Date();
    let filteredRaw = rawRows;

    if (dateFilter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      filteredRaw = rawRows.filter(r => r.rawTimestamp >= startOfMonth);
    } else if (dateFilter === 'three_months') {
      const startOfThreeMonths = new Date(now.getFullYear(), now.getMonth() - 2, 1).getTime();
      filteredRaw = rawRows.filter(r => r.rawTimestamp >= startOfThreeMonths);
    } else if (dateFilter === 'custom') {
      if (fromDate) {
        const fromTs = new Date(`${fromDate}T00:00:00`).getTime();
        filteredRaw = filteredRaw.filter(r => r.rawTimestamp >= fromTs);
      }
      if (toDate) {
        const toTs = new Date(`${toDate}T23:59:59`).getTime();
        filteredRaw = filteredRaw.filter(r => r.rawTimestamp <= toTs);
      }
    }

    // Build ledger with cumulative balance
    let runningBalance = 0;
    const ledgerRows: StatementLedgerRow[] = filteredRaw.map((r, index) => {
      runningBalance += (r.debit - r.credit);
      return {
        id: `row-${index}`,
        date: r.date,
        time: r.time,
        type: r.type,
        typeLabel: r.typeLabel,
        referenceNumber: r.referenceNumber,
        description: r.description,
        debit: r.debit,
        credit: r.credit,
        balance: runningBalance,
        walletType: r.walletType,
        walletName: r.walletName
      };
    });

    const totalDebits = ledgerRows.reduce((sum, r) => sum + r.debit, 0);
    const totalCredits = ledgerRows.reduce((sum, r) => sum + r.credit, 0);
    const netBalance = runningBalance;

    return {
      rows: ledgerRows,
      totalDebits,
      totalCredits,
      netBalance
    };
  }, [allOrders, allPayments, dateFilter, fromDate, toDate, customer]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `
*كشف حساب العميل: ${customer.name}*
رقم العميل: ${customer.customerNumber}
الهاتف: ${customer.phone}
---------------------------------
إجمالي التعاملات (المبيعات): ${statementData.totalDebits.toLocaleString()} ${currency}
إجمالي المسدد: ${statementData.totalCredits.toLocaleString()} ${currency}
المتبقي بذمته (المديونية): ${statementData.netBalance.toLocaleString()} ${currency}
عدد الحركات: ${statementData.rows.length}
تاريخ الاستخراج: ${new Date().toISOString().split('T')[0]}
${settings.studioName}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-5xl w-full flex flex-col max-h-[94vh] overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Modal Action Bar (Hidden on print) */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>كشف حساب العميل:</span>
                <span className="text-blue-400">{customer.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {customer.customerNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                كشف حركات تفصيلي يشمل جميع طلبات التصوير والدفعات المحولة ونقدية ورصيد المديونية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
              title="نسخ ملخص الحساب"
            >
              <Copy className="w-4 h-4 text-slate-400" />
              <span>{copyFeedback ? 'تم النسخ!' : 'نسخ الملخص'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كشف الحساب / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Date Filter Bar (Hidden on print) */}
        <div className="p-3 bg-slate-900 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              <span>فترة الكشف:</span>
            </span>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              كل الفترات
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                dateFilter === 'month'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              الشهر الحالي
            </button>
            <button
              onClick={() => setDateFilter('three_months')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                dateFilter === 'three_months'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              آخر 3 أشهر
            </button>
            <button
              onClick={() => setDateFilter('custom')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                dateFilter === 'custom'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              فترة مخصصة
            </button>
          </div>

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-slate-400">من:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">إلى:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
            </div>
          )}

          <div className="text-slate-400">
            عدد الحركات: <span className="font-bold text-white font-mono">{statementData.rows.length}</span>
          </div>
        </div>

        {/* Scrollable Printable Document Area */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8 bg-slate-900/50">
          <div 
            id="printable-customer-statement" 
            ref={printAreaRef}
            className="bg-slate-950/70 p-6 sm:p-8 rounded-2xl border border-slate-800 text-slate-100 space-y-6 max-w-4xl mx-auto shadow-xl"
          >
            {/* Header: Studio Brand & Document Meta */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                {settings.logoUrl ? (
                  <img 
                    src={settings.logoUrl} 
                    alt="Logo" 
                    className="w-14 h-14 object-contain rounded-xl border border-slate-700 bg-slate-900 p-1" 
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 text-2xl font-black">
                    📸
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-black text-white tracking-wide">
                    {settings.studioName || 'استوديو الفخامة للتصوير والإنتاج'}
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">{settings.tagline}</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                    <span>هاتف: <span className="font-mono text-slate-300">{settings.phone}</span></span>
                    <span>•</span>
                    <span>{settings.address}</span>
                  </p>
                </div>
              </div>

              <div className="text-right sm:text-left bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400 font-semibold">المستند:</span>
                  <span className="font-bold text-amber-400">كشف حساب عميل رسمي</span>
                </div>
                <div className="flex items-center justify-between gap-4 font-mono">
                  <span className="text-slate-400">الرقم المرجعي:</span>
                  <span className="font-bold text-blue-400">STMT-{customer.customerNumber}</span>
                </div>
                <div className="flex items-center justify-between gap-4 font-mono">
                  <span className="text-slate-400">تاريخ الإصدار:</span>
                  <span className="text-slate-300">{new Date().toISOString().split('T')[0]}</span>
                </div>
              </div>
            </div>

            {/* Customer Information Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">اسم العميل:</span>
                <span className="font-bold text-white text-sm">{customer.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">رقم الحساب / العميل:</span>
                <span className="font-mono font-bold text-blue-400 text-sm">{customer.customerNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">رقم الهاتف:</span>
                <span className="font-mono text-slate-200 text-sm" dir="ltr">{customer.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">العنوان / المنطقة:</span>
                <span className="text-slate-300 truncate block">{customer.address || 'اليمن'}</span>
              </div>
            </div>

            {/* Financial Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-blue-950/30 border border-blue-500/30 rounded-xl text-right">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-blue-300">إجمالي المبيعات (مدين)</span>
                  <ArrowDownLeft className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-lg font-black text-white font-mono">
                  {statementData.totalDebits.toLocaleString()} <span className="text-xs text-blue-400 font-sans">{currency}</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  إجمالي قيمة فواتير وطلبات العميل
                </span>
              </div>

              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-right">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-emerald-300">إجمالي المسدد (دائن)</span>
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-lg font-black text-emerald-300 font-mono">
                  {statementData.totalCredits.toLocaleString()} <span className="text-xs text-emerald-400 font-sans">{currency}</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  الدفعات النقدية والمحولة المستلمة
                </span>
              </div>

              <div className={`p-3.5 rounded-xl text-right border ${
                statementData.netBalance > 0
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 border-slate-700/80 text-emerald-400'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">
                    {statementData.netBalance > 0 ? 'الرصيد المتبقي (مديونية)' : 'حالة الحساب (خالص)'}
                  </span>
                  {statementData.netBalance > 0 ? (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="text-lg font-black font-mono">
                  {statementData.netBalance.toLocaleString()} <span className="text-xs font-sans">{currency}</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {statementData.netBalance > 0 ? 'مبلغ متبقي بذمة العميل' : 'تم تسديد كامل الحساب'}
                </span>
              </div>
            </div>

            {/* Statement Ledger Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 text-center">#</th>
                    <th className="py-2.5 px-3">التاريخ</th>
                    <th className="py-2.5 px-3">رقم المرجع / السند</th>
                    <th className="py-2.5 px-3">نوع الحركة</th>
                    <th className="py-2.5 px-3">البيان والتفاصيل</th>
                    <th className="py-2.5 px-3 text-left">مدين (قيمة الطلب)</th>
                    <th className="py-2.5 px-3 text-left">دائن (المسدد)</th>
                    <th className="py-2.5 px-3 text-left">الرصيد التراكمي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {statementData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        لا توجد حركات مالية مسجلة للعميل خلال هذه الفترة.
                      </td>
                    </tr>
                  ) : (
                    statementData.rows.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-400 whitespace-nowrap">
                          {row.referenceNumber}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            row.type === 'order'
                              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {row.walletType ? (
                              <WalletIcon type={row.walletType} size="sm" className="inline-block" />
                            ) : null}
                            <span>{row.typeLabel}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate">
                          {row.description}
                        </td>
                        <td className="py-2.5 px-3 text-left font-mono font-bold text-white whitespace-nowrap">
                          {row.debit > 0 ? row.debit.toLocaleString() : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-left font-mono font-bold text-emerald-400 whitespace-nowrap">
                          {row.credit > 0 ? row.credit.toLocaleString() : '-'}
                        </td>
                        <td className={`py-2.5 px-3 text-left font-mono font-bold whitespace-nowrap ${
                          row.balance > 0 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {row.balance.toLocaleString()} {currency}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-xs">
                  <tr>
                    <td colSpan={5} className="py-3 px-4 text-right text-slate-300">
                      إجمالي الحركات والرصيد النهائي:
                    </td>
                    <td className="py-3 px-3 text-left font-mono text-white">
                      {statementData.totalDebits.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-left font-mono text-emerald-400">
                      {statementData.totalCredits.toLocaleString()}
                    </td>
                    <td className={`py-3 px-3 text-left font-mono font-black ${
                      statementData.netBalance > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {statementData.netBalance.toLocaleString()} {currency}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Official Signatures & Stamp section */}
            <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-6 text-center text-xs text-slate-400">
              <div className="space-y-6">
                <p className="font-bold text-slate-300">المحاسب المالي</p>
                <div className="h-10 border-b border-dashed border-slate-700" />
                <p className="text-[10px]">التوقيع / التاريخ</p>
              </div>

              <div className="space-y-6">
                <p className="font-bold text-slate-300">اعتماد إدارة الاستوديو</p>
                <div className="h-10 border-b border-dashed border-slate-700 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 border border-slate-700 rounded-full px-3 py-1">
                    الختم الرسمي
                  </span>
                </div>
                <p className="text-[10px]">الاعتماد والختم</p>
              </div>

              <div className="space-y-6">
                <p className="font-bold text-slate-300">توقيع واستلام العميل</p>
                <div className="h-10 border-b border-dashed border-slate-700" />
                <p className="text-[10px] truncate">{customer.name}</p>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="pt-4 text-center text-[10px] text-slate-400 border-t border-slate-900">
              * يعتبر هذا الكشف مستنداً رسمياً ومعتمداً صادراً من {settings.studioName}. يرجى مراجعة الحساب خلال 7 أيام من تاريخه.
            </div>

          </div>
        </div>

        {/* Modal Footer (Hidden on print) */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-t border-slate-800 print:hidden shrink-0">
          <div className="text-xs text-slate-400">
            الرصيد المتبقي بذمة العميل: <span className="font-bold font-mono text-amber-400">{statementData.netBalance.toLocaleString()} {currency}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كشف الحساب</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
