import React, { useState, useEffect } from 'react';
import { Order, Customer, ServiceType, OrderStatus, PaymentMethod, BankWalletType, PaymentRecord } from '../../types';
import { storageService } from '../../services/storageService';
import { 
  X, 
  Save, 
  Printer, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Phone, 
  Banknote, 
  Wallet, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  ChevronDown
} from 'lucide-react';
import { WalletSelector, WalletIcon, WALLET_CONFIGS } from '../common/WalletIcons';

interface OrderEditorModalProps {
  order?: Order | null;
  initialServiceType?: ServiceType;
  lockServiceType?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (order: Order, shouldPrint?: boolean) => void;
}

// Days of the week in natural Arabic order (Saturday through Friday)
const DAYS_OF_WEEK = [
  { index: 6, name: 'السبت' },
  { index: 0, name: 'الأحد' },
  { index: 1, name: 'الاثنين' },
  { index: 2, name: 'الثلاثاء' },
  { index: 3, name: 'الأربعاء' },
  { index: 4, name: 'الخميس' },
  { index: 5, name: 'الجمعة' }
];

// Helper to get Arabic weekday name from a YYYY-MM-DD date string
const getArabicDayName = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(d);
  } catch {
    return '';
  }
};

// Helper to calculate difference in calendar days between two YYYY-MM-DD strings
const getDaysDiff = (fromStr: string, toStr: string): number => {
  if (!fromStr || !toStr) return 0;
  try {
    const f = new Date(fromStr + 'T12:00:00').getTime();
    const t = new Date(toStr + 'T12:00:00').getTime();
    return Math.round((t - f) / 86400000);
  } catch {
    return 0;
  }
};

// Helper to calculate the next date matching a chosen day of week index starting from a base date
const getDateForWeekday = (targetDayIndex: number, baseDateStr?: string): string => {
  const base = baseDateStr ? new Date(baseDateStr + 'T12:00:00') : new Date();
  const currentDayIndex = base.getDay();
  let diff = targetDayIndex - currentDayIndex;
  if (diff < 0) {
    diff += 7; // move to upcoming occurrence of this weekday
  }
  const targetDate = new Date(base.getTime() + diff * 86400000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}`;
};

export const OrderEditorModal: React.FC<OrderEditorModalProps> = ({
  order,
  initialServiceType = 'wedding_board',
  lockServiceType = false,
  isOpen,
  onClose,
  onSaved
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(order && order.id);

  // 1. Customer Data
  const [customerName, setCustomerName] = useState(order?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(order?.customerPhone || '');
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);

  // 2. Service / Order Type
  const [serviceType, setServiceType] = useState<ServiceType>(order?.serviceType || initialServiceType);

  // 3. Dates & Times (Date & Time in English numerals, Day in Arabic)
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDeliveryStr = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];

  const [bookingDate, setBookingDate] = useState(order?.orderDate || todayStr);
  const [bookingTime, setBookingTime] = useState(order?.notes?.includes('الوقت:') ? '10:00 AM' : '10:00 AM');
  const [deliveryDate, setDeliveryDate] = useState(order?.deliveryDate || defaultDeliveryStr);
  const [deliveryTime, setDeliveryTime] = useState(order?.deliveryTime || '06:00 PM');

  // Interactive toggle states for opening the full 7-days week pickers
  const [showBookingWeekPicker, setShowBookingWeekPicker] = useState(true);
  const [showDeliveryWeekPicker, setShowDeliveryWeekPicker] = useState(true);

  // Handle choosing a specific weekday for booking: automatically updates bookingDate & advances deliveryDate
  const handleSelectBookingDay = (dayIndex: number) => {
    const newBookingDate = getDateForWeekday(dayIndex);
    setBookingDate(newBookingDate);

    // If current delivery date is before new booking date, automatically advance delivery date relative to new booking date
    const currentDiff = getDaysDiff(bookingDate, deliveryDate);
    const duration = currentDiff > 0 ? currentDiff : 3;
    const nextDelivery = new Date(new Date(newBookingDate + 'T12:00:00').getTime() + duration * 86400000);
    const pad = (n: number) => String(n).padStart(2, '0');
    setDeliveryDate(`${nextDelivery.getFullYear()}-${pad(nextDelivery.getMonth() + 1)}-${pad(nextDelivery.getDate())}`);
  };

  // Handle choosing a specific weekday for delivery: automatically updates deliveryDate starting from bookingDate onwards
  const handleSelectDeliveryDay = (dayIndex: number, forceNextWeek = false) => {
    const base = new Date(bookingDate + 'T12:00:00');
    const baseDayIndex = base.getDay();
    let diff = dayIndex - baseDayIndex;
    if (diff < 0) {
      diff += 7; // next occurrence of this weekday after booking
    } else if (diff === 0 && forceNextWeek) {
      diff = 7; // one week after booking
    }
    const targetDate = new Date(base.getTime() + diff * 86400000);
    const pad = (n: number) => String(n).padStart(2, '0');
    setDeliveryDate(`${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}`);
  };

  // Handle setting delivery duration in days directly (0 days = same day, 1 day, 2 days, 3 days, 7 days)
  const handleSetDeliveryDurationDays = (days: number) => {
    const base = new Date(bookingDate + 'T12:00:00');
    const targetDate = new Date(base.getTime() + days * 86400000);
    const pad = (n: number) => String(n).padStart(2, '0');
    setDeliveryDate(`${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}`);
  };

  // Convert any Arabic/Indic numbers (٠-٩) or copy-pasted digits to standard English numbers (0-9)
  const toEnglishDigits = (str: string): string => {
    return str
      .replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
      .replace(/[^0-9.]/g, '');
  };

  // 4. Payment Method & Amounts - Initialized EMPTY by default for manual entry
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [totalPrice, setTotalPrice] = useState<string>(() => {
    if (order?.totalAmount) return String(order.totalAmount);
    if (order?.subtotal) return String(order.subtotal);
    return ''; // Empty by default as requested: خلي الحقل فاضي ويكون يقبل الارقام في اللغة الانجليزية
  });
  const [paidAmount, setPaidAmount] = useState<string>(() => {
    if (order?.paidAmount !== undefined && order.paidAmount > 0) return String(order.paidAmount);
    return ''; // Empty by default
  });
  const [walletType, setWalletType] = useState<BankWalletType | undefined>('kuraimi');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [note, setNote] = useState(order?.notes || '');
  const [errorMsg, setErrorMsg] = useState('');

  const settings = storageService.getSettings();
  const currency = settings.currency;
  const customers = storageService.getCustomers();

  // Numeric equivalents
  const numPrice = Number(totalPrice) || 0;
  const numPaid = Number(paidAmount) || 0;

  // Calculated remaining amount
  const remainingAmount = Math.max(0, numPrice - numPaid);

  // 12 Departments list
  const serviceOptions: { type: ServiceType; title: string }[] = [
    { type: 'wedding_board', title: 'لوحات العرسان' },
    { type: 'wedding_session', title: 'جلسات تصوير عرسان VIP' },
    { type: 'studio_photos', title: 'الصور وجلسات الاستديو' },
    { type: 'photo_albums', title: 'ألبومات الصور الفاخرة' },
    { type: 'advertising', title: 'الدعاية والإعلان والبنرات' },
    { type: 'graphic_design', title: 'التصميمات والشعارات' },
    { type: 'passport_photos', title: 'صور الجوازات والمعاملات' },
    { type: 'photo_restoration', title: 'ترميم وتلوين الصور' },
    { type: 'canvas_prints', title: 'لوحات الكانفس الفنية' },
    { type: 'video_montage', title: 'الفيديو والمونتاج السينمائي' },
    { type: 'outdoor_photo', title: 'التصوير الخارجي والمناسبات' },
    { type: 'thermal_print', title: 'الطباعة الحرارية والهدايا' }
  ];

  // Auto-detect existing customer by phone number to avoid duplicates
  useEffect(() => {
    const trimmedPhone = customerPhone.trim();
    if (trimmedPhone.length >= 6) {
      const matched = customers.find(c => c.phone.replace(/\D/g, '') === trimmedPhone.replace(/\D/g, ''));
      if (matched) {
        setExistingCustomer(matched);
        if (!customerName || customerName === '') {
          setCustomerName(matched.name);
        }
      } else {
        setExistingCustomer(null);
      }
    } else {
      setExistingCustomer(null);
    }
  }, [customerPhone, customers]);

  // Handle select customer from suggestions
  const handleSelectExistingCustomer = (c: Customer) => {
    setExistingCustomer(c);
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
  };

  const handleSave = (shouldPrint: boolean = false) => {
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('يرجى إدخال اسم العميل');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMsg('يرجى إدخال رقم هاتف العميل');
      return;
    }

    if (Number(totalPrice) <= 0) {
      setErrorMsg('يرجى تحديد السعر بشكل صحيح (أكبر من صفر)');
      return;
    }

    if (Number(paidAmount) < 0) {
      setErrorMsg('المبلغ المدفوع لا يمكن أن يكون سالباً');
      return;
    }

    if (Number(paidAmount) > Number(totalPrice)) {
      setErrorMsg('المبلغ المدفوع لا يمكن أن يتجاوز السعر الإجمالي');
      return;
    }

    if (paymentMethod === 'bank_wallet' && Number(paidAmount) > 0 && !referenceNumber.trim()) {
      setErrorMsg('يرجى إدخال رقم المرجع للعملية البنكية أو المحفظة');
      return;
    }

    // 1. Centralized Customer Management: Find or create customer (prevent duplication)
    let customerId = order?.customerId || '';
    const cleanPhone = customerPhone.trim();
    const matchedCust = customers.find(c => c.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, ''));

    if (matchedCust) {
      customerId = matchedCust.id;
      // Update existing customer stats
      storageService.saveCustomer({
        id: matchedCust.id,
        name: customerName.trim(),
        phone: cleanPhone,
        address: matchedCust.address || '',
        notes: matchedCust.notes || ''
      });
    } else if (!customerId) {
      // Create new customer centrally
      const newCustomer = storageService.saveCustomer({
        name: customerName.trim(),
        phone: cleanPhone
      });
      customerId = newCustomer.id;
    }

    // Determine Service Title
    const selectedServiceObj = serviceOptions.find(s => s.type === serviceType);
    const serviceTitle = selectedServiceObj ? selectedServiceObj.title : 'خدمة استديو';

    // Build or update order
    let targetOrder: Order;
    const finalPrice = Number(totalPrice);
    const finalPaid = Number(paidAmount);
    const finalRemaining = Math.max(0, finalPrice - finalPaid);

    const currentUser = storageService.getCurrentUser();

    if (isEditing && order) {
      targetOrder = {
        ...order,
        customerId,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        serviceType,
        serviceTitle,
        subtotal: finalPrice,
        totalAmount: finalPrice,
        paidAmount: finalPaid,
        remainingAmount: finalRemaining,
        orderDate: bookingDate,
        deliveryDate,
        deliveryTime,
        notes: note.trim()
      };
      storageService.updateOrder(targetOrder);
    } else {
      // New Order
      const initialPayments: PaymentRecord[] = finalPaid > 0 ? [{
        id: 'pay-' + Date.now(),
        orderId: '',
        orderNumber: '',
        customerName: customerName.trim(),
        amount: finalPaid,
        method: paymentMethod,
        walletType: paymentMethod === 'bank_wallet' ? walletType : undefined,
        walletName: paymentMethod === 'bank_wallet' ? (walletType && WALLET_CONFIGS[walletType] ? WALLET_CONFIGS[walletType].label : 'تحويل بنكي / محفظة') : undefined,
        transactionNumber: referenceNumber.trim(),
        date: bookingDate,
        time: bookingTime,
        cashierId: currentUser.id,
        cashierName: currentUser.fullName,
        createdAt: new Date().toISOString(),
        notes: note.trim()
      }] : [];

      const newOrderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'> = {
        customerId,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        serviceType,
        serviceTitle,
        items: [{
          id: 'item-1',
          serviceType,
          title: serviceTitle,
          quantity: 1,
          unitPrice: finalPrice,
          totalPrice: finalPrice,
          specifications: {}
        }],
        subtotal: finalPrice,
        discount: 0,
        tax: 0,
        totalAmount: finalPrice,
        paidAmount: finalPaid,
        remainingAmount: finalRemaining,
        status: finalPaid >= finalPrice ? 'ready' : 'pending',
        orderDate: bookingDate,
        deliveryDate,
        deliveryTime,
        notes: note.trim(),
        createdById: currentUser.id,
        createdByName: currentUser.fullName,
        payments: initialPayments
      };

      targetOrder = storageService.createOrder(newOrderData);
    }

    onSaved(targetOrder, shouldPrint);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div 
        className="bg-[#0b1328] border-2 border-amber-500/50 rounded-3xl max-w-4xl w-full shadow-[0_20px_70px_rgba(0,0,0,0.85)] text-slate-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200 select-none"
        dir="rtl"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                {isEditing ? 'تعديل بيانات الطلب' : 'إضافة طلب جديد'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                النموذج الموحد لجميع أقسام الاستديو • إدخال يدوي بالأرقام الإنجليزية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[82vh] overflow-y-auto">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs sm:text-sm rounded-xl font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. بيانات العميل (Customer Information) */}
          <div className="space-y-4 bg-slate-900/70 p-5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black text-amber-400 flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                <span>بيانات العميل</span>
              </h3>
              {existingCustomer && (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>عميل مسجل مسبقاً ({existingCustomer.name})</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم العميل *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="أدخل الاسم الكامل للعميل"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الهاتف * (أرقام إنجليزية)</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(toEnglishDigits(e.target.value))}
                  placeholder="مثال: 771234567"
                  dir="ltr"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono font-bold text-right tracking-wider"
                />
              </div>
            </div>

            {/* Service / Department Type */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع الطلب / القسم *</label>
              <select
                disabled={lockServiceType}
                value={serviceType}
                onChange={e => setServiceType(e.target.value as ServiceType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer font-bold"
              >
                {serviceOptions.map(opt => (
                  <option key={opt.type} value={opt.type}>
                    {opt.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. المواعيد (Appointments: Booking & Delivery) - اختيار اليوم وظهور أيام الأسبوع كاملة وتاريخ تلقائي ووقت يدوي */}
          <div className="space-y-4 bg-slate-900/70 p-5 rounded-2xl border border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/70 pb-3">
              <h3 className="text-xs sm:text-sm font-black text-amber-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>المواعيد والتسليم (أيام الأسبوع كاملة وتاريخ تلقائي ووقت يدوي)</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                الأرقام والتواريخ بالإنجليزية | أسماء الأيام بالعربية
              </span>
            </div>

            {/* شريط المسار الزمني المحسوب تلقائياً من يوم الحجز حتى موعد التسليم */}
            {(() => {
              const bookingDayName = getArabicDayName(bookingDate);
              const deliveryDayName = getArabicDayName(deliveryDate);
              const diffDays = getDaysDiff(bookingDate, deliveryDate);
              return (
                <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-slate-950 to-emerald-500/10 rounded-xl border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="font-bold text-slate-200">فترة الطلب والتسليم:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg flex items-center gap-1.5">
                      <span className="text-white font-sans">حجز:</span>
                      <span>{bookingDayName || 'يوم الحجز'}</span>
                      <span className="text-amber-200 tracking-wider">({bookingDate})</span>
                      <span className="text-slate-300 text-[11px] font-sans">| {bookingTime}</span>
                    </span>
                    <span className="text-amber-400 font-black text-sm px-1">⟵</span>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg flex items-center gap-1.5">
                      <span className="text-white font-sans">تسليم:</span>
                      <span>{deliveryDayName || 'يوم التسليم'}</span>
                      <span className="text-emerald-200 tracking-wider">({deliveryDate})</span>
                      <span className="text-slate-300 text-[11px] font-sans">| {deliveryTime}</span>
                    </span>
                    <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-lg text-[11px] font-sans font-bold">
                      {diffDays === 0 ? '⚡ تسليم في نفس اليوم' : diffDays === 1 ? '⏱ مدة الإنجاز: يوم واحد' : diffDays === 2 ? '⏱ مدة الإنجاز: يومان' : `⏱ مدة الإنجاز: ${diffDays} أيام`}
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* موعد الحجز */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-sm font-black text-white">موعد وتاريخ الحجز</span>
                  </span>

                  {/* زر إظهار واختيار اليوم من أيام الأسبوع */}
                  <button
                    type="button"
                    onClick={() => setShowBookingWeekPicker(prev => !prev)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-black text-xs transition-all cursor-pointer shadow-sm"
                    title="اضغط لإظهار أيام الأسبوع كاملة لاختيار يوم الحجز"
                  >
                    <span>اليوم: {getArabicDayName(bookingDate) || 'اختر اليوم'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform ${showBookingWeekPicker ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* لوحة أيام الأسبوع كاملة لاختيار يوم الحجز */}
                {showBookingWeekPicker && (
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>اختر يوم الحجز من أيام الأسبوع كاملة (تلقائي):</span>
                      <span className="text-amber-400 text-[10px]">اضغط على اليوم</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {DAYS_OF_WEEK.map(d => {
                        const computedDate = getDateForWeekday(d.index);
                        const isSelected = bookingDate === computedDate || (new Date(bookingDate + 'T12:00:00').getDay() === d.index);
                        return (
                          <button
                            key={d.index}
                            type="button"
                            onClick={() => handleSelectBookingDay(d.index)}
                            className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md scale-[1.03]'
                                : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                            }`}
                            title={`اختيار ${d.name} (${computedDate})`}
                          >
                            <span className="text-xs font-black">{d.name}</span>
                            <span className={`text-[9px] font-mono mt-0.5 ${isSelected ? 'text-slate-900 font-black' : 'text-slate-400'}`}>
                              {computedDate.slice(5)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      تاريخ الحجز (YYYY-MM-DD)
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={e => {
                        setBookingDate(e.target.value);
                        // Ensure delivery date is not before booking date
                        if (deliveryDate < e.target.value) {
                          const nextDelivery = new Date(new Date(e.target.value + 'T12:00:00').getTime() + 3 * 86400000);
                          const pad = (n: number) => String(n).padStart(2, '0');
                          setDeliveryDate(`${nextDelivery.getFullYear()}-${pad(nextDelivery.getMonth() + 1)}-${pad(nextDelivery.getDate())}`);
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white font-mono font-bold tracking-wider focus:outline-none focus:border-amber-400 shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      وقت الحجز (إدخال يدوي)
                    </label>
                    <input
                      type="text"
                      value={bookingTime}
                      onChange={e => setBookingTime(e.target.value)}
                      placeholder="10:00 AM"
                      dir="ltr"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white font-mono font-bold text-center tracking-wider focus:outline-none focus:border-amber-400 shadow-inner"
                    />
                  </div>
                </div>

                {/* أوقات سريعة للاختيار اليدوي للحجز */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400">أوقات مقترحة:</span>
                  {['09:00 AM', '10:00 AM', '02:00 PM', '04:30 PM', '08:00 PM'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setBookingTime(t)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        bookingTime === t
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* موعد التسليم */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-sm font-black text-white">موعد وتاريخ التسليم</span>
                  </span>

                  {/* زر إظهار واختيار يوم التسليم من أيام الأسبوع */}
                  <button
                    type="button"
                    onClick={() => setShowDeliveryWeekPicker(prev => !prev)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-black text-xs transition-all cursor-pointer shadow-sm"
                    title="اضغط لإظهار أيام الأسبوع كاملة لاختيار يوم التسليم"
                  >
                    <span>اليوم: {getArabicDayName(deliveryDate) || 'اختر اليوم'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-emerald-400 transition-transform ${showDeliveryWeekPicker ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* لوحة أيام الأسبوع كاملة لاختيار يوم التسليم - تحسب التاريخ تلقائياً من يوم الحجز */}
                {showDeliveryWeekPicker && (
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>أيام الأسبوع للتسليم (محسوبة تلقائياً من يوم الحجز):</span>
                      <span className="text-emerald-400 text-[10px]">تاريخ فوري</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {DAYS_OF_WEEK.map(d => {
                        const base = new Date(bookingDate + 'T12:00:00');
                        const baseDayIndex = base.getDay();
                        let diff = d.index - baseDayIndex;
                        if (diff < 0) {
                          diff += 7;
                        }
                        const targetDate = new Date(base.getTime() + diff * 86400000);
                        const pad = (n: number) => String(n).padStart(2, '0');
                        const computedDate = `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}`;
                        const isSelected = deliveryDate === computedDate;

                        return (
                          <button
                            key={d.index}
                            type="button"
                            onClick={() => handleSelectDeliveryDay(d.index)}
                            className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-md scale-[1.03]'
                                : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                            }`}
                            title={`تسليم يوم ${d.name} (${computedDate})`}
                          >
                            <span className="text-xs font-black">{d.name}</span>
                            <span className={`text-[9px] font-mono mt-0.5 ${isSelected ? 'text-slate-900 font-black' : 'text-slate-400'}`}>
                              {diff === 0 ? 'اليوم' : `+${diff}د`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* خيارات فترات التسليم السريعة */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400">فترة الإنجاز السريعة:</span>
                  {[
                    { label: 'نفس اليوم (0)', days: 0 },
                    { label: 'غداً (+1)', days: 1 },
                    { label: 'بعد يومين (+2)', days: 2 },
                    { label: 'بعد 3 أيام (+3)', days: 3 },
                    { label: 'بعد أسبوع (+7)', days: 7 }
                  ].map(p => {
                    const diffDays = getDaysDiff(bookingDate, deliveryDate);
                    const isSelected = diffDays === p.days;
                    return (
                      <button
                        key={p.days}
                        type="button"
                        onClick={() => handleSetDeliveryDurationDays(p.days)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-black'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      تاريخ التسليم (تلقائي بالإنجليزية)
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={e => setDeliveryDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white font-mono font-bold tracking-wider focus:outline-none focus:border-emerald-400 shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      وقت التسليم (إدخال يدوي)
                    </label>
                    <input
                      type="text"
                      value={deliveryTime}
                      onChange={e => setDeliveryTime(e.target.value)}
                      placeholder="06:00 PM"
                      dir="ltr"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white font-mono font-bold text-center tracking-wider focus:outline-none focus:border-emerald-400 shadow-inner"
                    />
                  </div>
                </div>

                {/* أوقات سريعة للاختيار اليدوي للتسليم */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400">أوقات مقترحة للتسليم:</span>
                  {['12:00 PM', '04:00 PM', '06:00 PM', '08:00 PM', '10:00 PM'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDeliveryTime(t)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        deliveryTime === t
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. الدفع المالي (نقدي أو بنكي/إلكتروني) - إدخال يدوي للأرقام الإنجليزية بدون قيم مسبقة */}
          <div className="space-y-4 bg-slate-900/70 p-5 rounded-2xl border border-slate-800/80">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="text-xs sm:text-sm font-black text-amber-400 flex items-center gap-2">
                <Banknote className="w-4 h-4" />
                <span>طريقة الدفع وتفاصيل الحساب</span>
              </h3>

              {/* Toggle Buttons: Cash vs Bank/Electronic */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    paymentMethod === 'cash'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>دفع نقدي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_wallet')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    paymentMethod === 'bank_wallet'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>دفع بنكي / إلكتروني</span>
                </button>
              </div>
            </div>

            {/* Financial Amounts Inputs: Manual entry in English Digits (123...) with blank fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">تحديد السعر * (يدوياً بالأرقام الإنجليزية)</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={totalPrice}
                    onChange={e => setTotalPrice(toEnglishDigits(e.target.value))}
                    placeholder="أدخل السعر (مثال: 75000)"
                    dir="ltr"
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm sm:text-base text-white font-mono font-black text-right focus:outline-none focus:border-amber-400 tracking-wider"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">{currency}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المبلغ المدفوع * (يدوياً بالأرقام الإنجليزية)</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={paidAmount}
                    onChange={e => setPaidAmount(toEnglishDigits(e.target.value))}
                    placeholder="أدخل المدفوع (مثال: 25000)"
                    dir="ltr"
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm sm:text-base text-emerald-300 font-mono font-black text-right focus:outline-none focus:border-emerald-400 tracking-wider"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">{currency}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المبلغ المتبقي (يحسب تلقائياً)</label>
                <div className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm sm:text-base font-mono font-black text-rose-400 flex items-center justify-between tracking-wider" dir="ltr">
                  <span>{remainingAmount.toLocaleString('en-US')}</span>
                  <span className="text-xs text-slate-400 font-sans font-bold">{currency}</span>
                </div>
              </div>
            </div>

            {/* Extra Bank / Electronic Fields */}
            {paymentMethod === 'bank_wallet' && (
              <div className="pt-3 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      المحفظة المستلمة <span className="text-slate-400 font-normal text-[11px]">(اختياري - سطر واحد)</span>
                    </label>
                    {walletType && WALLET_CONFIGS[walletType] && (
                      <span className="text-xs font-bold text-amber-400">
                        {WALLET_CONFIGS[walletType].label}
                      </span>
                    )}
                  </div>
                  <WalletSelector
                    selectedType={walletType}
                    onSelect={setWalletType}
                    allowClear={true}
                    onClear={() => setWalletType(undefined)}
                    compact={true}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    رقم المرجع / رقم العملية في المحفظة *
                  </label>
                  <input
                    type="text"
                    required
                    value={referenceNumber}
                    onChange={e => setReferenceNumber(toEnglishDigits(e.target.value))}
                    placeholder="مثال: رقم العملية أو إشعار التحويل 8899120"
                    dir="ltr"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono font-bold tracking-wider text-right"
                  />
                </div>
              </div>
            )}

            {/* Note field */}
            <div className="pt-1">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">الملاحظة</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="أدخل أي ملاحظات خاصة بالطلب أو مواصفات إضافية"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

        </div>

        {/* Action Buttons: حفظ الطلب / حفظ وطباعة / إلغاء */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            إلغاء / رجوع
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الطلب</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-950/40 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>حفظ وطباعة الطلب</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
