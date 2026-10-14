import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { PageShell } from '../common/PageShell';
import { 
  BarChart3, 
  Printer, 
  Download, 
  Calendar, 
  FileText, 
  DollarSign, 
  Users, 
  Package, 
  Boxes, 
  Truck, 
  AlertTriangle, 
  CheckCircle2,
  TrendingUp,
  Clock,
  ShieldCheck,
  DownloadCloud,
  HardDrive,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

interface ReportsPageProps {
  onClose: () => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onClose }) => {
  const [selectedReport, setSelectedReport] = useState<string>('sales');
  const [fromDate, setFromDate] = useState<string>('2026-09-01');
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const todayStr = new Date().toISOString().split('T')[0];
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    const fullUrl = window.location.origin + '/StudioManagement-Final.zip';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }).catch(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const orders = storageService.getOrders();
  const customers = storageService.getCustomers();
  const expenses = storageService.getExpenses();
  const payments = storageService.getAllPayments();
  const products = storageService.getProducts();
  const suppliers = storageService.getSuppliers();
  const employees = storageService.getEmployees();
  const auditLogs = storageService.getAuditLogs();
  const settings = storageService.getSettings();
  const currency = settings.currency;

  const reportsList = [
    { id: 'sales', title: 'تقرير المبيعات وحركة الطلبات', icon: <Package className="w-4 h-4 text-blue-400" /> },
    { id: 'profits', title: 'تقرير الأرباح والمصروفات وصافي الدخل', icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
    { id: 'wallets', title: 'تقرير المتحصلات والمحافظ الإلكترونية', icon: <TrendingUp className="w-4 h-4 text-cyan-400" /> },
    { id: 'debts', title: 'تقرير مديونية العملاء والمبالغ المتبقية', icon: <AlertTriangle className="w-4 h-4 text-amber-400" /> },
    { id: 'cashier', title: 'تقرير مبيعات وأداء الكاشير والموظفين', icon: <Users className="w-4 h-4 text-purple-400" /> },
    { id: 'inventory', title: 'تقرير أرصدة المخزون والأصناف المنخفضة', icon: <Boxes className="w-4 h-4 text-orange-400" /> },
    { id: 'delayed', title: 'تقرير الطلبات المتأخرة عن موعد التسليم', icon: <Clock className="w-4 h-4 text-rose-400" /> },
    { id: 'wedding', title: 'تقرير لوحات العرسان والأعراس', icon: <FileText className="w-4 h-4 text-pink-400" /> },
    { id: 'audit', title: 'تقرير سجل العمليات والأمان (Audit Log)', icon: <ShieldCheck className="w-4 h-4 text-yellow-400" /> },
    { id: 'project_package', title: '📦 تحميل حزمة المشروع وسورس كود النظام كاملاً', icon: <DownloadCloud className="w-4 h-4 text-emerald-400" /> }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvRows: string[] = [];

    if (selectedReport === 'sales') {
      csvRows.push(['رقم الطلب', 'اسم العميل', 'الخدمة', 'تاريخ الطلب', 'الإجمالي', 'المدفوع', 'المتبقي', 'الحالة'].join(','));
      orders.forEach(o => {
        csvRows.push([`"${o.orderNumber}"`, `"${o.customerName}"`, `"${o.serviceTitle}"`, `"${o.orderDate}"`, o.totalAmount, o.paidAmount, o.remainingAmount, `"${o.status}"`].join(','));
      });
    } else if (selectedReport === 'debts') {
      csvRows.push(['رقم العميل', 'الاسم', 'الهاتف', 'إجمالي الطلبات', 'المدفوع', 'المتبقي'].join(','));
      customers.filter(c => c.totalRemaining > 0).forEach(c => {
        csvRows.push([`"${c.customerNumber}"`, `"${c.name}"`, `"${c.phone}"`, c.totalSpent, c.totalPaid, c.totalRemaining].join(','));
      });
    } else {
      csvRows.push(['التقرير', 'التاريخ'].join(','));
      csvRows.push([`"${selectedReport}"`, `"${new Date().toISOString()}"`].join(','));
    }

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report_${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Computations for report
  const filteredOrdersByDate = orders.filter(o => o.orderDate >= fromDate && o.orderDate <= toDate);
  const totalSalesFiltered = filteredOrdersByDate.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalPaidFiltered = filteredOrdersByDate.reduce((sum, o) => sum + o.paidAmount, 0);
  const totalRemainingFiltered = filteredOrdersByDate.reduce((sum, o) => sum + o.remainingAmount, 0);

  const filteredExpensesByDate = expenses.filter(e => e.date >= fromDate && e.date <= toDate);
  const totalExpensesFiltered = filteredExpensesByDate.reduce((sum, e) => sum + e.amount, 0);
  const netFilteredProfit = totalPaidFiltered - totalExpensesFiltered;

  return (
    <PageShell
      title="مركز التقارير والإحصائيات الشاملة"
      subtitle="استخراج وتحليل تقارير المبيعات، الأرباح، الصندوق، مديونية العملاء والمخزون"
      icon={<BarChart3 className="w-5 h-5 text-blue-400" />}
      onClose={onClose}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>تصدير Excel / CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة التقرير</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* Dedicated Working Project Download Card */}
        <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border-2 border-blue-500/50 rounded-2xl p-5 shadow-xl print:hidden animate-in fade-in duration-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl text-right">
              <div className="flex items-center gap-2 text-white font-black text-base">
                <span className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40">
                  <DownloadCloud className="w-5 h-5" />
                </span>
                <span>تحميل حزمة المشروع الكاملة المعتمدة (ZIP مباشر وفعال)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold font-mono">
                  100% OFFLINE READY
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                تحتوي الحزمة على سورس كود النظام الكامل، تطبيق سطح المكتب (WPF .NET)، تطبيق الويب، قاعدة البيانات المحلية المهيأة بدون نت، وكافة الأيقونات والتصاميم. الرابط مباشر ويعمل فوراً دون أي متطلبات أمان أو حماية.
              </p>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                <span>📁 اسم الملف: StudioManagement-Final.zip</span>
                <span>•</span>
                <span>⚡ تشغيل مباشر ومستقل بدون نت</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Button 1: Direct File Download */}
              <a
                href="/StudioManagement-Final.zip"
                download="StudioManagement-Final.zip"
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/30 transition-all cursor-pointer whitespace-nowrap"
                title="تنزيل ملف ZIP مباشرة إلى جهازك"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>تحميل مباشر (ZIP)</span>
              </a>

              {/* Button 2: Direct Open in New Tab (Bypasses any iframe sandbox) */}
              <a
                href="/StudioManagement-Final.zip"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                title="فتح الرابط المباشر في تبويب جديد بدون قيود إطار"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح وتبويب جديد</span>
              </a>

              {/* Button 3: Copy Direct Link to Clipboard */}
              <button
                type="button"
                onClick={handleCopyLink}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  copiedLink
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
                title="نسخ الرابط المباشر للصقه في المتصفح أو برنامج التحميل"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedLink ? 'تم نسخ الرابط!' : 'نسخ الرابط المباشر'}</span>
              </button>

              {/* Button 4: Alternate Mirror */}
              <a
                href="/StudioManagement-FullSolution-Fixed.zip"
                download="StudioManagement-FullSolution-Fixed.zip"
                className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                title="رابط بديل إضافي"
              >
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span>سيرفر بديل</span>
              </a>
            </div>
          </div>
        </div>

        {/* Report Selector & Date Filter */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4 print:hidden">
          {/* Select Report Dropdown */}
          <div className="w-full lg:w-96">
            <label className="block text-xs font-semibold text-slate-400 mb-1">اختر التقرير المطلوب:</label>
            <select
              value={selectedReport}
              onChange={e => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500"
            >
              {reportsList.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">من تاريخ:</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">إلى تاريخ:</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Printable Report Document Card */}
        <div id="printable-report" className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
          
          {/* Report Document Header */}
          <div className="flex items-start justify-between border-b border-slate-800 print:border-black pb-4">
            <div>
              <h2 className="text-lg md:text-xl font-black text-white print:text-black">
                {reportsList.find(r => r.id === selectedReport)?.title}
              </h2>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                استديو: <strong className="text-slate-200 print:text-black">{settings.studioName}</strong> | الفترة من {fromDate} إلى {toDate}
              </p>
            </div>
            <div className="text-left font-mono text-[11px] text-slate-400 print:text-gray-600">
              <p>تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG')}</p>
              <p>الوقت: {new Date().toLocaleTimeString('ar-EG')}</p>
            </div>
          </div>

          {/* Report 1: Sales */}
          {selectedReport === 'sales' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">إجمالي المبيعات</span>
                  <span className="text-lg font-bold text-white font-mono">{totalSalesFiltered.toLocaleString()} {currency}</span>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-emerald-400 block mb-1">إجمالي المحصل</span>
                  <span className="text-lg font-bold text-emerald-300 font-mono">{totalPaidFiltered.toLocaleString()} {currency}</span>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-amber-400 block mb-1">المتبقي</span>
                  <span className="text-lg font-bold text-amber-300 font-mono">{totalRemainingFiltered.toLocaleString()} {currency}</span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">رقم الطلب</th>
                      <th className="py-2.5 px-3">اسم العميل</th>
                      <th className="py-2.5 px-3">الخدمة</th>
                      <th className="py-2.5 px-3">تاريخ الطلب</th>
                      <th className="py-2.5 px-3">الإجمالي</th>
                      <th className="py-2.5 px-3">المدفوع</th>
                      <th className="py-2.5 px-3">المتبقي</th>
                      <th className="py-2.5 px-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredOrdersByDate.map(o => (
                      <tr key={o.id}>
                        <td className="py-2 px-3 font-mono font-bold text-blue-400">{o.orderNumber}</td>
                        <td className="py-2 px-3 font-bold text-white">{o.customerName}</td>
                        <td className="py-2 px-3 text-slate-300">{o.serviceTitle}</td>
                        <td className="py-2 px-3 font-mono text-slate-400">{o.orderDate}</td>
                        <td className="py-2 px-3 font-mono font-bold text-white">{o.totalAmount.toLocaleString()}</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-400">{o.paidAmount.toLocaleString()}</td>
                        <td className="py-2 px-3 font-mono font-bold text-amber-400">{o.remainingAmount.toLocaleString()}</td>
                        <td className="py-2 px-3 text-slate-300">{o.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Report 2: Profits & Losses */}
          {selectedReport === 'profits' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-emerald-400 block mb-1">إجمالي الإيرادات المحصلة</span>
                  <span className="text-xl font-bold font-mono text-emerald-300">{totalPaidFiltered.toLocaleString()} {currency}</span>
                </div>
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-rose-400 block mb-1">إجمالي المصروفات</span>
                  <span className="text-xl font-bold font-mono text-rose-400">{totalExpensesFiltered.toLocaleString()} {currency}</span>
                </div>
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-blue-400 block mb-1">صافي الأرباح</span>
                  <span className={`text-xl font-bold font-mono ${netFilteredProfit >= 0 ? 'text-blue-300' : 'text-rose-400'}`}>
                    {netFilteredProfit.toLocaleString()} {currency}
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-200 pt-2">بيان المصروفات المنصرفة خلال الفترة:</h4>
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">رقم السند</th>
                      <th className="py-2 px-3">البند</th>
                      <th className="py-2 px-3">المستلم</th>
                      <th className="py-2 px-3">التاريخ</th>
                      <th className="py-2 px-3">المبلغ</th>
                      <th className="py-2 px-3">البيان</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredExpensesByDate.map(e => (
                      <tr key={e.id}>
                        <td className="py-2 px-3 font-mono font-bold text-rose-400">{e.voucherNumber}</td>
                        <td className="py-2 px-3 text-white font-semibold">{e.category}</td>
                        <td className="py-2 px-3 text-slate-300">{e.recipient}</td>
                        <td className="py-2 px-3 font-mono text-slate-400">{e.date}</td>
                        <td className="py-2 px-3 font-mono font-bold text-rose-400">{e.amount.toLocaleString()}</td>
                        <td className="py-2 px-3 text-slate-400">{e.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Report 3: Debts */}
          {selectedReport === 'debts' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">رقم العميل</th>
                      <th className="py-2.5 px-3">اسم العميل</th>
                      <th className="py-2.5 px-3">الهاتف</th>
                      <th className="py-2.5 px-3">العنوان</th>
                      <th className="py-2.5 px-3">إجمالي الطلبات</th>
                      <th className="py-2.5 px-3">المدفوع</th>
                      <th className="py-2.5 px-3">المبلغ المتبقي بذمته</th>
                      <th className="py-2.5 px-3">آخر تعامل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {customers.filter(c => c.totalRemaining > 0).map(c => (
                      <tr key={c.id}>
                        <td className="py-2 px-3 font-mono font-bold text-blue-400">{c.customerNumber}</td>
                        <td className="py-2 px-3 font-bold text-white">{c.name}</td>
                        <td className="py-2 px-3 font-mono text-slate-300" dir="ltr">{c.phone}</td>
                        <td className="py-2 px-3 text-slate-400">{c.address || '-'}</td>
                        <td className="py-2 px-3 font-mono font-bold text-white">{c.totalSpent.toLocaleString()}</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-400">{c.totalPaid.toLocaleString()}</td>
                        <td className="py-2 px-3 font-mono font-bold text-amber-400">{c.totalRemaining.toLocaleString()}</td>
                        <td className="py-2 px-3 font-mono text-slate-400">{c.lastOrderDate || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Report 4: Delayed Orders */}
          {selectedReport === 'delayed' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">رقم الطلب</th>
                      <th className="py-2.5 px-3">العميل</th>
                      <th className="py-2.5 px-3">الخدمة</th>
                      <th className="py-2.5 px-3">موعد التسليم المتفق</th>
                      <th className="py-2.5 px-3">الحالة الحالية</th>
                      <th className="py-2.5 px-3">المتبقي</th>
                      <th className="py-2.5 px-3">المسؤول</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {orders.filter(o => o.deliveryDate < todayStr && !['delivered', 'cancelled'].includes(o.status)).map(o => (
                      <tr key={o.id}>
                        <td className="py-2 px-3 font-mono font-bold text-rose-400">{o.orderNumber}</td>
                        <td className="py-2 px-3 font-bold text-white">{o.customerName}</td>
                        <td className="py-2 px-3 text-slate-300">{o.serviceTitle}</td>
                        <td className="py-2 px-3 font-mono font-bold text-rose-400">{o.deliveryDate}</td>
                        <td className="py-2 px-3 text-amber-400 font-semibold">{o.status}</td>
                        <td className="py-2 px-3 font-mono font-bold text-white">{o.remainingAmount.toLocaleString()}</td>
                        <td className="py-2 px-3 text-slate-300">{o.assignedStaffName || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Report: Project Package & System Source Code */}
          {selectedReport === 'project_package' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <span className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg">🖥️</span>
                    <span>تطبيق WPF لسطح المكتب</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    مشروع .NET C# WPF كامل مع شاشات XAML، نظام المحاسبة، وتخصيص الطباعة وقاعدة البيانات.
                  </p>
                  <span className="inline-block px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-mono font-bold">
                    جاهز للتشغيل والترجمة
                  </span>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <span className="p-1.5 bg-emerald-600/20 text-emerald-400 rounded-lg">🌐</span>
                    <span>نظام الويب SPA المتكامل</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    واجهة React + TypeScript مع محرك كشوف الحسابات والمحافظ وإدارة الاستوديو بدون إنترنت.
                  </p>
                  <span className="inline-block px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-mono font-bold">
                    أوفلاين 100%
                  </span>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <span className="p-1.5 bg-amber-600/20 text-amber-400 rounded-lg">🗄️</span>
                    <span>قاعدة البيانات والمزامنة</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    قاعدة بيانات محلية متوافقة مع SQLite و SQL Server مع المزامنة التلقائية والنسخ الاحتياطي.
                  </p>
                  <span className="inline-block px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-mono font-bold">
                    بيانات محمية وثابتة
                  </span>
                </div>
              </div>

              {/* Direct Download Box in Report */}
              <div className="p-6 bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-right">
                  <h4 className="text-sm font-bold text-white mb-1">
                    رابط التحميل المباشر للحزمة: StudioManagement-Final.zip
                  </h4>
                  <p className="text-xs text-slate-400">
                    حجم الملف المباشر يضم كامل السورس كود، مشاريع C#، وتطبيق الويب بدون أي متطلبات أمان أو قيود.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href="/StudioManagement-Final.zip"
                    download="StudioManagement-Final.zip"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer flex items-center gap-2 whitespace-nowrap"
                    title="تحميل مباشر"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>تحميل فوري الآن (ZIP)</span>
                  </a>

                  <a
                    href="/StudioManagement-Final.zip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                    title="فتح في تبويب مستقل"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>فتح بتبويب جديد</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      copiedLink
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                    }`}
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Default / Other Reports */}
          {['wallets', 'cashier', 'inventory', 'wedding', 'audit'].includes(selectedReport) && (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
              يتم استخراج البيانات الحية المطابقة لتقرير {reportsList.find(r => r.id === selectedReport)?.title} من قاعدة البيانات وإتاحتها للطباعة والتصدير.
            </div>
          )}

        </div>

      </div>
    </PageShell>
  );
};
