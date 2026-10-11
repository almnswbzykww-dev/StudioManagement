import React, { useState } from 'react';
import { Order, PaymentMethod, BankWalletType } from '../../types';
import { storageService } from '../../services/storageService';
import { 
  X, 
  CreditCard, 
  Banknote, 
  Wallet, 
  Plus, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  FileText, 
  Receipt, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  Phone,
  Image as ImageIcon
} from 'lucide-react';

interface PaymentModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onPaymentSuccess
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [walletType, setWalletType] = useState<BankWalletType>('kuraimi');
  
  // Form fields
  const [amount, setAmount] = useState<number | string>(order.remainingAmount || 0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(new Date().toTimeString().split(' ')[0].substring(0, 5));
  const [transactionNumber, setTransactionNumber] = useState('');
  const [transferNumber, setTransferNumber] = useState('');
  const [senderName, setSenderName] = useState(order.customerName || '');
  const [senderPhone, setSenderPhone] = useState(order.customerPhone || '');
  const [notes, setNotes] = useState('');
  const [transferProofUrl, setTransferProofUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const wallets: { type: BankWalletType; label: string; icon: string; color: string }[] = [
    { type: 'kuraimi', label: 'كريمي / إم فلوس (Kuraimi)', icon: '🏦', color: 'border-emerald-500/40 text-emerald-400' },
    { type: 'jeeb', label: 'جيب (Jeeb)', icon: '💳', color: 'border-purple-500/40 text-purple-400' },
    { type: 'jawwali', label: 'جوالي (Jawwali)', icon: '📱', color: 'border-blue-500/40 text-blue-400' },
    { type: 'one_cash', label: 'ون كاش (OneCash)', icon: '⚡', color: 'border-amber-500/40 text-amber-400' },
    { type: 'floosak', label: 'فلوسك (Floosak)', icon: '💰', color: 'border-cyan-500/40 text-cyan-400' }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTransferProofUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setErrorMsg('يرجى إدخال مبلغ صحيح أكبر من الصفر.');
      return;
    }

    if (numericAmount > order.remainingAmount + 1) {
      setErrorMsg(`المبلغ المدخل (${numericAmount.toLocaleString()} ر.ي) أكبر من المبلغ المتبقي (${order.remainingAmount.toLocaleString()} ر.ي).`);
      return;
    }

    const selectedWallet = wallets.find(w => w.type === walletType);

    try {
      storageService.addPayment({
        orderId: order.id,
        amount: numericAmount,
        method,
        walletType: method === 'bank_wallet' ? walletType : undefined,
        walletName: method === 'bank_wallet' ? selectedWallet?.label : undefined,
        transactionNumber: method === 'bank_wallet' ? transactionNumber : undefined,
        transferNumber: method === 'bank_wallet' ? transferNumber : undefined,
        senderName: method === 'bank_wallet' ? senderName : undefined,
        senderPhone: method === 'bank_wallet' ? senderPhone : undefined,
        transferProofUrl: method === 'bank_wallet' ? transferProofUrl : undefined,
        notes,
        date,
        time: time + ':00'
      });

      setSuccessMsg('تم تسجيل الدفعة وتحديث حساب الطلب بنجاح!');
      setShowAddForm(false);
      setAmount(0);
      setTransactionNumber('');
      setTransferNumber('');
      setNotes('');
      setTransferProofUrl('');

      setTimeout(() => {
        setSuccessMsg('');
        if (onPaymentSuccess) onPaymentSuccess();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ الدفعة');
    }
  };

  const currentUser = storageService.getCurrentUser();
  const currency = storageService.getSettings().currency;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-3xl w-full text-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">نظام الدفع والتحصيل الموحد</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                العميل: <span className="text-slate-200 font-semibold">{order.customerName}</span> ({order.customerPhone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">السعر الأصلي</span>
              <span className="text-base font-bold text-slate-200">{order.subtotal.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 mr-1">{currency}</span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">الخصم الممنوح</span>
              <span className="text-base font-bold text-amber-400">{order.discount.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 mr-1">{currency}</span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">الإجمالي المستحق</span>
              <span className="text-base font-bold text-blue-400">{order.totalAmount.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 mr-1">{currency}</span>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl">
              <span className="text-xs text-emerald-400 block mb-1">إجمالي المدفوع</span>
              <span className="text-base font-bold text-emerald-300">{order.paidAmount.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-400 mr-1">{currency}</span>
            </div>

            <div className={`p-3 rounded-xl border ${order.remainingAmount > 0 ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' : 'bg-teal-950/30 border-teal-500/30 text-teal-300'}`}>
              <span className="text-xs block mb-1 opacity-80">المبلغ المتبقي</span>
              <span className="text-base font-bold">{order.remainingAmount.toLocaleString()}</span>
              <span className="text-[10px] mr-1">{currency}</span>
            </div>
          </div>

          {/* Success / Error Messages */}
          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Add Payment Form Toggle */}
          {order.remainingAmount > 0 && (
            <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span>إضافة دفعة سداد جديدة</span>
                </h3>
                {!showAddForm && (
                  <button
                    onClick={() => {
                      setAmount(order.remainingAmount);
                      setShowAddForm(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-600/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>تسجيل دفعة الآن</span>
                  </button>
                )}
              </div>

              {showAddForm && (
                <form onSubmit={handleAddPayment} className="space-y-4">
                  {/* Select Payment Method */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">طريقة الدفع</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMethod('cash')}
                        className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                          method === 'cash'
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        <Banknote className="w-5 h-5 text-emerald-400" />
                        <span>💵 دفع نقدي (كاش)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMethod('bank_wallet')}
                        className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                          method === 'bank_wallet'
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-950'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        <Wallet className="w-5 h-5 text-blue-400" />
                        <span>🏦 بنكي / محافظ إلكترونية</span>
                      </button>
                    </div>
                  </div>

                  {/* Wallet Selection when bank_wallet is selected */}
                  {method === 'bank_wallet' && (
                    <div className="p-4 bg-slate-900/80 rounded-xl border border-blue-500/30 space-y-4 animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-2">اختر المحفظة أو البنك المستلم</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {wallets.map(w => (
                            <button
                              key={w.type}
                              type="button"
                              onClick={() => setWalletType(w.type)}
                              className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all text-right cursor-pointer ${
                                walletType === w.type
                                  ? `bg-blue-600/20 ${w.color} border-current ring-1 ring-blue-500`
                                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                              }`}
                            >
                              <span className="text-base">{w.icon}</span>
                              <span className="truncate">{w.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Wallet Specific Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            رقم العملية (Transaction ID) <span className="text-rose-400">*</span>
                          </label>
                          <div className="relative">
                            <Hash className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                            <input
                              type="text"
                              required
                              value={transactionNumber}
                              onChange={e => setTransactionNumber(e.target.value)}
                              placeholder="مثال: TX-8899120"
                              className="w-full pr-9 pl-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            رقم الحوالة / السند
                          </label>
                          <input
                            type="text"
                            value={transferNumber}
                            onChange={e => setTransferNumber(e.target.value)}
                            placeholder="مثال: REF-102934"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            اسم المرسل (صاحب الحساب/المحفظة)
                          </label>
                          <input
                            type="text"
                            value={senderName}
                            onChange={e => setSenderName(e.target.value)}
                            placeholder="اسم المحول"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            رقم هاتف المرسل
                          </label>
                          <div className="relative">
                            <Phone className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                            <input
                              type="text"
                              value={senderPhone}
                              onChange={e => setSenderPhone(e.target.value)}
                              placeholder="77XXXXXXX"
                              className="w-full pr-9 pl-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            إثبات التحويل (صورة الإشعار / السند)
                          </label>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 cursor-pointer transition-all">
                              <ImageIcon className="w-4 h-4 text-blue-400" />
                              <span>رفع صورة الإشعار</span>
                              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                            </label>
                            {transferProofUrl && (
                              <span className="text-xs text-emerald-400 font-medium">✓ تم إرفاق الصورة</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Common Fields: Amount, Date, Time, Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        المبلغ المدفوع ({currency}) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={order.remainingAmount}
                        required
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">تاريخ الدفعة</label>
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                        <input
                          type="date"
                          value={date}
                          onChange={e => setDate(e.target.value)}
                          className="w-full pr-9 pl-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">وقت الدفعة</label>
                      <div className="relative">
                        <Clock className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                        <input
                          type="time"
                          value={time}
                          onChange={e => setTime(e.target.value)}
                          className="w-full pr-9 pl-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">ملاحظات الدفعة</label>
                      <input
                        type="text"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="أدخل أي ملاحظات خاصة بهذه الدفعة..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                    <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>الموظف المستلم: </span>
                    <span className="text-slate-200 font-semibold">{currentUser.fullName}</span>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
                    >
                      حفظ وتأكيد الدفعة
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Payment History Table (Requirement 13) */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>سجل الدفعات والمتحصلات السابقة ({order.payments?.length || 0})</span>
              </span>
            </h3>

            {(!order.payments || order.payments.length === 0) ? (
              <div className="p-8 text-center bg-slate-800/30 border border-slate-800 rounded-xl text-slate-400 text-xs">
                لم يتم تسجيل أي دفعات لهذا الطلب حتى الآن.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/60">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-800 text-slate-400 border-b border-slate-700/80">
                    <tr>
                      <th className="py-2.5 px-3">التاريخ والوقت</th>
                      <th className="py-2.5 px-3">طريقة الدفع</th>
                      <th className="py-2.5 px-3">المحفظة / الحساب</th>
                      <th className="py-2.5 px-3">رقم العملية</th>
                      <th className="py-2.5 px-3">المبلغ</th>
                      <th className="py-2.5 px-3">المستلم</th>
                      <th className="py-2.5 px-3">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {order.payments.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-slate-300 font-mono">
                          {p.date} <span className="text-slate-500 text-[11px]">{p.time}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                            p.method === 'cash' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          }`}>
                            {p.method === 'cash' ? '💵 نقدي' : '🏦 بنكي / محفظة'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {p.walletName || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 font-mono">
                          {p.transactionNumber || '-'}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-400">
                          {p.amount.toLocaleString()} {currency}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {p.cashierName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                          {p.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-slate-800/90 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
