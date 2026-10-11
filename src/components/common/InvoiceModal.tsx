import React, { useRef, useState } from 'react';
import { Order } from '../../types';
import { storageService } from '../../services/storageService';
import { 
  X, 
  Printer, 
  Download, 
  FileCheck, 
  Phone, 
  MapPin, 
  Mail, 
  Calendar, 
  Clock, 
  User as UserIcon,
  CheckCircle,
  Receipt
} from 'lucide-react';

interface InvoiceModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const settings = storageService.getSettings();
  const currency = settings.currency;

  // Format date and time with English numbers and Arabic day name
  const now = new Date();
  const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayNameArabic = arabicDays[now.getDay()];
  
  // Date in English numerals: YYYY-MM-DD
  const pad = (n: number) => String(n).padStart(2, '0');
  const invoiceDateEnglish = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  
  // Time in English numerals with AM/PM: 10:24 AM
  let hours = now.getHours();
  const minutes = pad(now.getMinutes());
  const ampm = hours >= 12 ? 'م' : 'ص';
  hours = hours % 12 || 12;
  const invoiceTimeEnglish = `${pad(hours)}:${minutes} ${ampm}`;

  // Helper to extract day name in Arabic for any date string
  const getArabicDayForDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return arabicDays[d.getDay()];
      }
    } catch {
      // ignore
    }
    return '';
  };

  const orderDayArabic = getArabicDayForDate(order.orderDate) || dayNameArabic;
  const deliveryDayArabic = getArabicDayForDate(order.deliveryDate);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = invoiceRef.current;
    if (!element) return;
    
    // Create simple HTML blob for saving
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>فاتورة ${order.orderNumber} - ${settings.studioName}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; direction: rtl; padding: 20px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #1e3a8a; }
          .sub { color: #64748b; font-size: 14px; margin-top: 4px; }
          .meta-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
          .meta-table td { padding: 6px; font-size: 13px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th, .items-table td { border: 1px solid #cbd5e1; padding: 10px; font-size: 13px; text-align: right; }
          .items-table th { background-color: #f1f5f9; color: #0f172a; }
          .total-box { margin-right: auto; width: 300px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc; }
          .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
          .grand-total { font-size: 16px; font-weight: bold; color: #1d4ed8; border-top: 1px solid #cbd5e1; padding-top: 6px; margin-top: 4px; }
          .footer { margin-top: 40px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 12px; white-space: pre-line; }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${order.orderNumber}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-4xl w-full text-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-800 border-b border-slate-700 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">معاينة وطباعة الفاتورة</h2>
              <span className="text-xs text-slate-400">رقم الفاتورة: {order.orderNumber}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setPrintFormat('a4')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  printFormat === 'a4' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                مقاس A4 رسمي
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('thermal')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  printFormat === 'thermal' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                إيصال كاشير 80mm
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الآن</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل HTML</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Viewport */}
        <div className="p-6 max-h-[82vh] overflow-y-auto bg-slate-950 flex justify-center">
          
          <div
            ref={invoiceRef}
            id="printable-invoice"
            className={`relative overflow-hidden bg-white text-slate-900 shadow-xl transition-all ${
              printFormat === 'a4' 
                ? 'w-full max-w-[210mm] min-h-[297mm] p-8 md:p-12 rounded-xl border border-slate-300' 
                : 'w-[80mm] p-4 text-[11px] rounded-lg border border-slate-300'
            }`}
          >
            {/* Camera Watermark (Requirement 7: ضع علامة مائية بشكل كاميرا في خلفية الفاتورة بشكل خفيف واحترافي) */}
            <div 
              className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden" 
              style={{ opacity: 0.045, zIndex: 0 }}
              aria-hidden="true"
            >
              <svg 
                className="w-[120mm] h-[120mm] text-slate-900" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
              </svg>
            </div>

            {/* Header Section */}
            <div className="relative z-10 flex items-start justify-between border-b-2 border-blue-900 pb-5 mb-6">
              <div className="space-y-1 max-w-sm">
                <h1 className="text-xl md:text-2xl font-black text-blue-950 tracking-tight">
                  {settings.studioName}
                </h1>
                <p className="text-xs text-blue-800 font-medium">{settings.tagline}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-700 shrink-0" />
                    <span>{settings.address}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-blue-700 shrink-0" />
                    <span dir="ltr">{settings.phone} / {settings.whatsapp}</span>
                  </span>
                  {settings.crNumber && (
                    <span className="text-[10px] text-slate-500 font-mono">س.ت: {settings.crNumber}</span>
                  )}
                </div>
              </div>

              {/* Logo / Badge */}
              <div className="text-center">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-20 h-20 object-contain rounded-xl border p-1" />
                ) : (
                  <div className="w-20 h-20 bg-blue-950 text-amber-400 rounded-2xl flex flex-col items-center justify-center font-bold shadow-md border-2 border-amber-400/40">
                    <span className="text-2xl">📸</span>
                    <span className="text-[10px] text-white font-medium mt-0.5">STUDIO</span>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Meta Grid */}
            <div className="relative z-10 grid grid-cols-2 gap-4 bg-slate-50/90 p-4 rounded-xl border border-slate-200 mb-6 text-xs backdrop-blur-xs">
              <div>
                <span className="text-slate-500 block mb-1">معلومات العميل والطلب:</span>
                <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                <p className="text-slate-700 mt-0.5">الهاتف: <span dir="ltr" className="font-medium">{order.customerPhone}</span></p>
                <p className="text-blue-800 mt-0.5 font-semibold">نوع الطلب / القسم: <span>{order.serviceTitle}</span></p>
                {order.customerAddress && <p className="text-slate-600 mt-0.5">العنوان: {order.customerAddress}</p>}
              </div>

              <div className="text-left space-y-1">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-slate-500">رقم الفاتورة:</span>
                  <span className="font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-xs">
                    {order.orderNumber}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-slate-500">موعد الحجز:</span>
                  <span className="font-semibold text-slate-800">
                    <span className="text-amber-700 font-bold ml-1">({orderDayArabic})</span>
                    <span className="font-mono">{order.orderDate}</span>
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-slate-500">موعد التسليم:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                    {deliveryDayArabic && <span className="ml-1">({deliveryDayArabic})</span>}
                    <span className="font-mono">{order.deliveryDate}</span> {order.deliveryTime && <span className="font-mono ml-1">{order.deliveryTime}</span>}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2 text-[11px] text-slate-500">
                  <span>منشئ الفاتورة:</span>
                  <span className="font-semibold text-slate-700">{order.createdByName}</span>
                </div>
              </div>
            </div>

            {/* Service & Items Table */}
            <div className="mb-6 overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-blue-950 text-white font-bold">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">الخدمة والمواصفات</th>
                    <th className="py-2.5 px-3 text-center">الكمية</th>
                    <th className="py-2.5 px-3 text-left">سعر الوحدة</th>
                    <th className="py-2.5 px-3 text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900 text-xs">{item.title}</p>
                          {item.description && <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>}
                          {item.specifications && Object.keys(item.specifications).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {Object.entries(item.specifications).map(([key, val]) => (
                                <span key={key} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded border border-slate-200 font-medium">
                                  {val}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">{item.quantity}</td>
                        <td className="py-3 px-3 text-left font-mono font-medium text-slate-700">
                          {item.unitPrice.toLocaleString()} {currency}
                        </td>
                        <td className="py-3 px-3 text-left font-mono font-bold text-slate-900">
                          {item.totalPrice.toLocaleString()} {currency}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-3 px-3 font-bold text-slate-500">1</td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{order.serviceTitle}</p>
                        {order.notes && <p className="text-[11px] text-slate-500 mt-0.5">{order.notes}</p>}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">1</td>
                      <td className="py-3 px-3 text-left font-mono font-medium text-slate-700">
                        {order.subtotal.toLocaleString()} {currency}
                      </td>
                      <td className="py-3 px-3 text-left font-mono font-bold text-slate-900">
                        {order.subtotal.toLocaleString()} {currency}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Payment History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              {/* Payment Installments History */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800 block mb-2">الدفعات المسجلة بالفاتورة:</span>
                {order.payments && order.payments.length > 0 ? (
                  <div className="space-y-1.5">
                    {order.payments.map((p, idx) => (
                      <div key={p.id || idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-200 last:border-b-0">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-medium text-slate-800">
                            {p.method === 'cash' ? 'نقدي' : p.walletName || 'بنكي'}
                          </span>
                          {p.transactionNumber && (
                            <span className="font-mono text-[10px] text-slate-500">({p.transactionNumber})</span>
                          )}
                        </div>
                        <div className="text-left font-mono font-bold text-emerald-700">
                          {p.amount.toLocaleString()} {currency}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">لم تسجل أي دفعات حتى الآن.</p>
                )}
              </div>

              {/* Totals Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>المبلغ الإجمالي الأصلي:</span>
                  <span className="font-mono font-medium">{order.subtotal.toLocaleString()} {currency}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>الخصم الممنوح:</span>
                    <span className="font-mono font-medium">- {order.discount.toLocaleString()} {currency}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-2 text-sm">
                  <span>الصافي المستحق:</span>
                  <span className="font-mono text-blue-900">{order.totalAmount.toLocaleString()} {currency}</span>
                </div>

                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>إجمالي المدفوع:</span>
                  <span className="font-mono">{order.paidAmount.toLocaleString()} {currency}</span>
                </div>

                <div className={`flex justify-between font-bold text-sm border-t border-slate-300 pt-2 ${
                  order.remainingAmount > 0 ? 'text-rose-700' : 'text-teal-700'
                }`}>
                  <span>المبلغ المتبقي للتسليم:</span>
                  <span className="font-mono">{order.remainingAmount.toLocaleString()} {currency}</span>
                </div>
              </div>
            </div>

            {/* Notes & Special Instructions */}
            {order.notes && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <span className="font-bold block mb-0.5">ملاحظات العمل والطباعة:</span>
                <p>{order.notes}</p>
              </div>
            )}

            {/* Terms & Footer */}
            <div className="border-t border-slate-200 pt-4 mt-6 text-center text-[10px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">{settings.invoiceFooterNote}</p>
              <p className="whitespace-pre-line text-slate-500 leading-relaxed max-w-xl mx-auto">
                {settings.invoiceTerms}
              </p>
              <div className="pt-3 flex justify-between text-slate-400 text-[9px] border-t border-slate-100">
                <span>تاريخ ووقت الطباعة: يوم {dayNameArabic} | {invoiceDateEnglish} - {invoiceTimeEnglish}</span>
                <span>نظام StudioManagement المتكامل © {new Date().getFullYear()}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-slate-800 border-t border-slate-700 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            إغلاق المعاينة
          </button>
        </div>

      </div>
    </div>
  );
};
