import React, { useRef, useState } from 'react';
import { storageService } from '../../services/storageService';
import { 
  X, 
  Printer, 
  Download, 
  Receipt, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Building,
  User as UserIcon,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  FileText
} from 'lucide-react';

export type VoucherType = 
  | 'payment' 
  | 'expense' 
  | 'cashier_audit' 
  | 'modification' 
  | 'advance' 
  | 'deduction' 
  | 'debt' 
  | 'debt_payment' 
  | 'salary_slip' 
  | 'treasury'
  | 'statement_report';

interface PrintVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherType: VoucherType;
  title?: string;
  data: any;
}

export const PrintVoucherModal: React.FC<PrintVoucherModalProps> = ({
  isOpen,
  onClose,
  voucherType,
  title,
  data
}) => {
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');
  const voucherRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const settings = storageService.getSettings();
  const currency = settings.currency || 'ر.ي';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = voucherRef.current;
    if (!element) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>${title || 'سند مالي رسمي'} - ${settings.studioName}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; direction: rtl; padding: 20px; color: #1e293b; background: #fff; }
          .header { text-align: center; border-bottom: 2px solid #991b1b; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: bold; color: #881337; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: right; font-size: 13px; }
          th { background: #f8fafc; color: #0f172a; font-weight: bold; }
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
    link.download = `Voucher_${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper to resolve title
  const getVoucherTitle = () => {
    if (title) return title;
    switch (voucherType) {
      case 'payment':
        return 'سند قبض وتحصيل نقدي / بنكي';
      case 'expense':
        return 'سند صرف مصروفات رسمي';
      case 'cashier_audit':
        return 'إشعار توثيق عملية كاشير معتمدة';
      case 'modification':
        return 'إشعار رقابة وتعديل حركة حساسة';
      case 'advance':
        return 'سند صرف سلفة موظف';
      case 'deduction':
        return 'إشعار خصم واستقطاع إداري';
      case 'debt':
        return 'سند إثبات مديونية آجل';
      case 'debt_payment':
        return 'سند سداد دفعة من مديونية';
      case 'salary_slip':
        return 'قسيمة راتب شهري ومستحقات';
      case 'treasury':
        return 'كشف جرد الخزينة والأرصدة';
      case 'statement_report':
        return 'كشف حساب مالي رسمي';
      default:
        return 'سند مالي رسمي';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-4xl w-full text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Control Bar */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-2xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">{getVoucherTitle()}</h2>
              <span className="text-xs text-slate-400">معاينة المستند الرسمي قبل الطباعة أو الحفظ</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setPrintFormat('a4')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  printFormat === 'a4' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                مقاس A4 رسمي
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('thermal')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  printFormat === 'thermal' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                إيصال كاشير 80mm
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة المستند</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل HTML</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Viewport */}
        <div className="p-6 overflow-y-auto bg-slate-950/90 flex justify-center flex-1">
          <div
            ref={voucherRef}
            id="printable-voucher"
            className={`relative overflow-hidden bg-white text-slate-900 shadow-2xl transition-all font-sans ${
              printFormat === 'a4' 
                ? 'w-full max-w-[210mm] min-h-[140mm] p-8 md:p-10 rounded-2xl border border-slate-300' 
                : 'w-[80mm] p-4 text-[11px] rounded-xl border border-slate-300'
            }`}
          >
            {/* Watermark */}
            <div 
              className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden" 
              style={{ opacity: 0.04, zIndex: 0 }}
              aria-hidden="true"
            >
              <svg className="w-[100mm] h-[100mm] text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
              </svg>
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between border-b-2 border-rose-900/80 pb-4 mb-5">
              <div className="space-y-1 text-right">
                <h1 className="text-xl md:text-2xl font-black text-rose-950 tracking-tight">
                  {settings.studioName}
                </h1>
                <p className="text-xs text-rose-800 font-semibold">{settings.englishName || 'Studio Alfan 3'} - {settings.tagline}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-700 shrink-0" />
                    <span>{settings.address}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-rose-700 shrink-0" />
                    <span dir="ltr">{settings.phone} / {settings.whatsapp}</span>
                  </span>
                </div>
              </div>

              <div className="text-left bg-rose-50 border border-rose-200 p-2.5 rounded-xl shrink-0">
                <span className="text-[10px] block font-bold text-rose-800 uppercase tracking-wider">
                  {getVoucherTitle()}
                </span>
                <span className="text-sm font-black font-mono text-rose-950 block mt-0.5">
                  {data.voucherNumber || data.orderNumber || data.id || `VOUCH-${Date.now().toString().slice(-6)}`}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                  {data.date || new Date().toISOString().split('T')[0]} {data.time || ''}
                </span>
              </div>
            </div>

            {/* Body content based on Voucher Type */}
            <div className="relative z-10 space-y-4 text-xs md:text-sm">
              
              {/* PAYMENT VOUCHER */}
              {voucherType === 'payment' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 text-xs block">اسم العميل / المقبوض منه:</span>
                      <strong className="text-slate-900 font-black text-sm">{data.customerName || 'عميل نقدي'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">رقم الفاتورة / الطلب:</span>
                      <strong className="text-rose-950 font-mono font-bold text-sm">{data.orderNumber || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">طريقة القبض:</span>
                      <span className="font-bold text-slate-800">
                        {data.method === 'cash' ? '💵 نقدي (من الصندوق)' : `🏦 بنكي / محفظة (${data.walletName || 'حوالة'})`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">رقم المرجع / الإشعار:</span>
                      <span className="font-mono font-bold text-slate-800">{data.transactionNumber || '-'}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-emerald-800 font-bold block text-xs">المبلغ المقبوض:</span>
                      <span className="text-slate-600 text-xs">فقط لا غير</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-700 font-mono">
                      {(data.amount || 0).toLocaleString()} <span className="text-sm font-sans">{currency}</span>
                    </div>
                  </div>

                  {data.details && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs">
                      <span className="font-bold text-slate-900 block mb-1">البيان والشرح:</span>
                      {data.details}
                    </div>
                  )}
                </div>
              )}

              {/* EXPENSE VOUCHER */}
              {voucherType === 'expense' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 text-xs block">اصرفوا للسيد / الجهة المستلمة:</span>
                      <strong className="text-slate-900 font-black text-sm">{data.recipient}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">بند المصروف / التصنيف:</span>
                      <strong className="text-rose-950 font-bold text-sm">{data.category}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">طريقة الصرف:</span>
                      <span className="font-bold text-slate-800">
                        {data.paymentMethod === 'cash' ? '💵 نقدي من الصندوق' : '🏦 تحويل بنكي / محفظة'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">تاريخ وساعة الصرف:</span>
                      <span className="font-mono font-bold text-slate-800">{data.date} {data.time || ''}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-rose-800 font-bold block text-xs">المبلغ المنصرف:</span>
                      <span className="text-slate-600 text-xs">تم الصرف قانونياً بموجب هذا السند</span>
                    </div>
                    <div className="text-2xl font-black text-rose-700 font-mono">
                      {(data.amount || 0).toLocaleString()} <span className="text-sm font-sans">{currency}</span>
                    </div>
                  </div>

                  {data.description && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs">
                      <span className="font-bold text-slate-900 block mb-1">البيان والشرح:</span>
                      {data.description}
                    </div>
                  )}
                </div>
              )}

              {/* CASHIER AUDIT / OPERATION SLIP */}
              {voucherType === 'cashier_audit' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 text-xs block">الموظف / الكاشير القائم بالعملية:</span>
                      <strong className="text-slate-900 font-black text-sm">{data.userName} (#{data.userNumber || 1})</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">نوع الحركة المنجزة:</span>
                      <strong className="text-rose-950 font-bold text-sm">{data.action}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">رقم الفاتورة / الطلب المرتبط:</span>
                      <span className="font-mono font-bold text-slate-800">{data.orderNumber || 'لا ينطبق'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">التوقيت المسجل:</span>
                      <span className="font-mono font-bold text-slate-800">{data.date || data.timestamp?.split(' ')[0]} {data.time || data.timestamp?.split(' ')[1] || ''}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl">
                    <span className="font-bold text-slate-900 block text-xs mb-1">تفاصيل ومحتوى الحركة:</span>
                    <p className="text-slate-800 leading-relaxed text-xs font-mono">{data.details}</p>
                  </div>
                </div>
              )}

              {/* MODIFICATION / SECURITY AUDIT SLIP */}
              {voucherType === 'modification' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <div>
                      <span className="text-purple-700 text-xs block">المستخدم الفاعل:</span>
                      <strong className="text-purple-950 font-black text-sm">{data.userName} (#{data.userNumber || 1})</strong>
                    </div>
                    <div>
                      <span className="text-purple-700 text-xs block">نوع التعديل / الإلغاء:</span>
                      <strong className="text-rose-800 font-bold text-sm">{data.action}</strong>
                    </div>
                    <div>
                      <span className="text-purple-700 text-xs block">رقم الفاتورة المتأثرة:</span>
                      <span className="font-mono font-bold text-slate-800">{data.orderNumber || '-'}</span>
                    </div>
                    <div>
                      <span className="text-purple-700 text-xs block">التاريخ والوقت:</span>
                      <span className="font-mono font-bold text-slate-800">{data.timestamp}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl">
                    <span className="font-bold text-slate-900 block text-xs mb-1">بيان التعديل المسجل:</span>
                    <p className="text-slate-800 leading-relaxed text-xs">{data.details}</p>
                  </div>
                </div>
              )}

              {/* EMPLOYEE ADVANCE / DEDUCTION / DEBT */}
              {(voucherType === 'advance' || voucherType === 'deduction' || voucherType === 'debt' || voucherType === 'debt_payment') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 text-xs block">اسم الموظف:</span>
                      <strong className="text-slate-900 font-black text-sm">{data.employeeName || data.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">الوظيفة / القسم:</span>
                      <span className="font-bold text-slate-800">{data.role || 'كادر الاستديو'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">التاريخ:</span>
                      <span className="font-mono font-bold text-slate-800">{data.date || new Date().toISOString().split('T')[0]}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">السبب / الشهر:</span>
                      <span className="font-bold text-slate-800">{data.month || data.reason || 'مستحقات إدارية'}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-rose-800 font-bold block text-xs">قيمة المستند:</span>
                      <span className="text-slate-600 text-xs">{getVoucherTitle()}</span>
                    </div>
                    <div className="text-2xl font-black text-rose-800 font-mono">
                      {(data.amount || 0).toLocaleString()} <span className="text-sm font-sans">{currency}</span>
                    </div>
                  </div>

                  {data.notes && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs">
                      <span className="font-bold text-slate-900 block mb-1">ملاحظات:</span>
                      {data.notes}
                    </div>
                  )}
                </div>
              )}

              {/* SALARY SLIP */}
              {voucherType === 'salary_slip' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 text-xs block">اسم الموظف:</span>
                      <strong className="text-slate-900 font-black text-sm">{data.employeeName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">شهر الراتب:</span>
                      <strong className="text-rose-950 font-mono font-bold text-sm">{data.month}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">الراتب الأساسي:</span>
                      <span className="font-mono font-bold text-slate-800">{(data.baseSalary || 0).toLocaleString()} {currency}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">مجموع الاستقطاعات والسلف:</span>
                      <span className="font-mono font-bold text-rose-700">{((data.advances || 0) + (data.deductions || 0)).toLocaleString()} {currency}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-emerald-800 font-bold block text-xs">صافي الراتب المستلم:</span>
                      <span className="text-slate-600 text-xs">تم تسليم الراتب وإبراء الذمة للشهر المحدد</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-700 font-mono">
                      {(data.netSalary || 0).toLocaleString()} <span className="text-sm font-sans">{currency}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TREASURY REPORT */}
              {voucherType === 'treasury' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                      <span className="text-xs text-emerald-800 font-bold block">السيولة النقدية (الكاش)</span>
                      <strong className="text-base font-black text-emerald-700 font-mono block mt-1">
                        {(data.cashBalance || 0).toLocaleString()} {currency}
                      </strong>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                      <span className="text-xs text-blue-800 font-bold block">أرصدة المحافظ البنكية</span>
                      <strong className="text-base font-black text-blue-700 font-mono block mt-1">
                        {(data.bankBalance || 0).toLocaleString()} {currency}
                      </strong>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                      <span className="text-xs text-amber-800 font-bold block">ديون العملاء المتبقية</span>
                      <strong className="text-base font-black text-amber-700 font-mono block mt-1">
                        {(data.debtsBalance || 0).toLocaleString()} {currency}
                      </strong>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <p className="font-bold text-slate-900 mb-1">بيان فحص الجرد المالي:</p>
                    <p>تم إعداد وتدقيق تقرير الأرصدة والسيولة آلياً من واقع سجلات وقيود النظام بتاريخ {new Date().toLocaleDateString('ar-YE')}.</p>
                  </div>
                </div>
              )}

            </div>

            {/* Official Signature Lines */}
            <div className="relative z-10 pt-8 mt-6 border-t border-slate-200 grid grid-cols-3 text-center text-xs text-slate-700">
              <div className="space-y-8">
                <span className="font-bold">توقيع المستلم / العميل</span>
                <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto"></div>
              </div>
              <div className="space-y-8">
                <span className="font-bold">المحاسب / الكاشير</span>
                <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto">
                  <span className="text-[10px] text-slate-400">{data.cashierName || data.userName || 'أمين الصندوق'}</span>
                </div>
              </div>
              <div className="space-y-8">
                <span className="font-bold">اعتماد الإدارة والختم</span>
                <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto"></div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3 mt-6">
              مستند إلكتروني رسمي صادر من {settings.studioName} - للتصوير والطباعة والإنتاج الفني
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
