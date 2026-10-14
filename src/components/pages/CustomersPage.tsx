import React, { useState } from 'react';
import { Customer, Order } from '../../types';
import { storageService } from '../../services/storageService';
import { PageShell } from '../common/PageShell';
import { EmptyState } from '../common/EmptyState';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  MapPin, 
  FileText, 
  CreditCard, 
  ExternalLink, 
  MessageCircle, 
  Edit3, 
  Trash2, 
  X, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Printer
} from 'lucide-react';
import { CustomerStatementModal } from '../common/CustomerStatementModal';

interface CustomersPageProps {
  onClose: () => void;
  onOpenOrder: (order: Order) => void;
  onOpenNewOrderForCustomer: (customer: Customer) => void;
  onOpenPaymentModal: (order: Order) => void;
  onOpenInvoiceModal: (order: Order) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  onClose,
  onOpenOrder,
  onOpenNewOrderForCustomer,
  onOpenPaymentModal,
  onOpenInvoiceModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [statementCustomer, setStatementCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const customers = storageService.getCustomers();
  const allOrders = storageService.getOrders();
  const settings = storageService.getSettings();
  const currency = settings.currency;

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.customerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAddModal = (customerToEdit?: Customer) => {
    if (customerToEdit) {
      setEditingCustomer(customerToEdit);
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setSecondaryPhone(customerToEdit.secondaryPhone || '');
      setAddress(customerToEdit.address || '');
      setNotes(customerToEdit.notes || '');
    } else {
      setEditingCustomer(null);
      setName('');
      setPhone('');
      setSecondaryPhone('');
      setAddress('');
      setNotes('');
    }
    setErrorMsg('');
    setShowAddModal(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('يرجى إدخال اسم العميل');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('يرجى إدخال رقم الهاتف');
      return;
    }

    try {
      storageService.saveCustomer({
        id: editingCustomer?.id,
        name,
        phone,
        secondaryPhone,
        address,
        notes
      });
      setShowAddModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ العميل');
    }
  };

  const handleDeleteCustomer = (customerId: string, customerName: string) => {
    if (window.confirm(`هل أنت متأكد من حذف العميل "${customerName}"؟`)) {
      storageService.deleteCustomer(customerId);
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(null);
      }
    }
  };

  const customerOrders = selectedCustomer 
    ? allOrders.filter(o => o.customerId === selectedCustomer.id) 
    : [];

  return (
    <PageShell
      title="دليل وإدارة العملاء"
      subtitle="إدارة بيانات العملاء، سجل الطلبات، المعاملات المالية، والمديونيات"
      icon={<Users className="w-5 h-5 text-blue-400" />}
      badge={`${customers.length} عميل`}
      onClose={onClose}
      actions={
        <button
          onClick={() => handleOpenAddModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة عميل جديد</span>
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم العميل أو رقم الهاتف أو رقم الحساب..."
              className="w-full pr-9 pl-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="text-xs text-slate-400 font-medium hidden sm:block">
            إجمالي ديون العملاء: <span className="font-bold text-amber-400 font-mono">
              {customers.reduce((sum, c) => sum + c.totalRemaining, 0).toLocaleString()} {currency}
            </span>
          </div>
        </div>

        {/* Customer Table */}
        {filteredCustomers.length === 0 ? (
          <EmptyState
            title="لا يوجد عملاء مطابقون"
            description="لم يتم العثور على أي عميل يطابق عبارة البحث الحالية."
            actionText="إضافة عميل جديد"
            onAction={() => handleOpenAddModal()}
          />
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60 shadow-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">رقم العميل</th>
                  <th className="py-3 px-4">الاسم واللقب</th>
                  <th className="py-3 px-4">رقم الهاتف</th>
                  <th className="py-3 px-4">العنوان</th>
                  <th className="py-3 px-4 text-center">الطلبات</th>
                  <th className="py-3 px-4">إجمالي المبيعات</th>
                  <th className="py-3 px-4">المدفوع</th>
                  <th className="py-3 px-4">المتبقي (المديونية)</th>
                  <th className="py-3 px-4">آخر طلب</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">
                      {customer.customerNumber}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="font-bold text-white hover:text-blue-300 text-right cursor-pointer"
                      >
                        {customer.name}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300" dir="ltr">
                      {customer.phone}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                      {customer.address || '-'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-white">
                      {customer.totalOrdersCount}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {customer.totalSpent.toLocaleString()} {currency}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {customer.totalPaid.toLocaleString()} {currency}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={customer.totalRemaining > 0 ? 'text-amber-400' : 'text-slate-500'}>
                        {customer.totalRemaining.toLocaleString()} {currency}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {customer.lastOrderDate || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setStatementCustomer(customer)}
                          className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg cursor-pointer"
                          title="طباعة كشف حساب العميل"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg cursor-pointer"
                          title="عرض كشف وتفاصيل العميل"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenAddModal(customer)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                          title="تعديل بيانات العميل"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg"
                          title="محادثة واتساب"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg cursor-pointer"
                          title="حذف العميل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Customer Details Drawer / Modal (Requirement 21) */}
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-3xl w-full text-slate-100 my-6 overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">{selectedCustomer.name}</h2>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                        {selectedCustomer.customerNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      هاتف: <span dir="ltr" className="text-slate-300">{selectedCustomer.phone}</span>
                      {selectedCustomer.address && ` | العنوان: ${selectedCustomer.address}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const cust = selectedCustomer;
                      setSelectedCustomer(null);
                      setStatementCustomer(cust);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-sm"
                    title="طباعة كشف حساب معتمد ومفصل"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة كشف الحساب</span>
                  </button>

                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
                
                {/* Financial Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                    <span className="text-xs text-slate-400 block mb-1">عدد الطلبات</span>
                    <span className="text-base font-bold text-white">{customerOrders.length} طلب</span>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                    <span className="text-xs text-slate-400 block mb-1">إجمالي التعاملات</span>
                    <span className="text-base font-bold text-blue-400">{selectedCustomer.totalSpent.toLocaleString()} {currency}</span>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                    <span className="text-xs text-emerald-400 block mb-1">إجمالي المسدد</span>
                    <span className="text-base font-bold text-emerald-300">{selectedCustomer.totalPaid.toLocaleString()} {currency}</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${selectedCustomer.totalRemaining > 0 ? 'bg-amber-950/30 border-amber-500/40 text-amber-300' : 'bg-slate-800/60 border-slate-700/60 text-slate-400'}`}>
                    <span className="text-xs block mb-1">المتبقي (ديون)</span>
                    <span className="text-base font-bold">{selectedCustomer.totalRemaining.toLocaleString()} {currency}</span>
                  </div>
                </div>

                {/* Orders History List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>سجل طلبات وفواتير العميل</span>
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedCustomer(null);
                        onOpenNewOrderForCustomer(selectedCustomer);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      + إنشاء طلب جديد لهذا العميل
                    </button>
                  </div>

                  {customerOrders.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-800/30 rounded-xl border border-slate-800">
                      لا توجد أي طلبات مسجلة لهذا العميل حتى الآن.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-800 rounded-xl">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="py-2.5 px-3">رقم الطلب</th>
                            <th className="py-2.5 px-3">الخدمة</th>
                            <th className="py-2.5 px-3">التاريخ</th>
                            <th className="py-2.5 px-3">الإجمالي</th>
                            <th className="py-2.5 px-3">المدفوع</th>
                            <th className="py-2.5 px-3">المتبقي</th>
                            <th className="py-2.5 px-3">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {customerOrders.map(o => (
                            <tr key={o.id} className="hover:bg-slate-800/40">
                              <td className="py-2 px-3 font-mono font-bold text-blue-400">{o.orderNumber}</td>
                              <td className="py-2 px-3 text-slate-300">{o.serviceTitle}</td>
                              <td className="py-2 px-3 font-mono text-slate-400">{o.orderDate}</td>
                              <td className="py-2 px-3 font-bold text-white">{o.totalAmount.toLocaleString()}</td>
                              <td className="py-2 px-3 font-bold text-emerald-400">{o.paidAmount.toLocaleString()}</td>
                              <td className="py-2 px-3 font-bold text-amber-400">{o.remainingAmount.toLocaleString()}</td>
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setSelectedCustomer(null);
                                      onOpenPaymentModal(o);
                                    }}
                                    className="p-1 text-emerald-400 hover:bg-slate-800 rounded"
                                    title="دفعات"
                                  >
                                    <CreditCard className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedCustomer(null);
                                      onOpenInvoiceModal(o);
                                    }}
                                    className="p-1 text-blue-400 hover:bg-slate-800 rounded"
                                    title="فاتورة"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
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

              </div>

              <div className="flex items-center justify-between px-6 py-3.5 bg-slate-800 border-t border-slate-700">
                <button
                  onClick={() => {
                    const cust = selectedCustomer;
                    setSelectedCustomer(null);
                    setStatementCustomer(cust);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة كشف الحساب / PDF</span>
                </button>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  إغلاق
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Add / Edit Customer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-100 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h3 className="text-base font-bold text-white">
                  {editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
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

              <form onSubmit={handleSaveCustomer} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    اسم العميل الكامل <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="الاسم الثلاثي أو اسم المؤسسة"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      رقم الهاتف الأساسي <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="77XXXXXXX"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">هاتف إضافي (اختياري)</label>
                    <input
                      type="text"
                      value={secondaryPhone}
                      onChange={e => setSecondaryPhone(e.target.value)}
                      placeholder="71XXXXXXX"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">العنوان / المنطقة</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="صنعاء - حدة - شارع بيروت"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ملاحظات العميل</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="عميل VIP، تفضيلات خاصة..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 cursor-pointer"
                  >
                    حفظ العميل
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Customer Account Statement Modal */}
        {statementCustomer && (
          <CustomerStatementModal
            isOpen={!!statementCustomer}
            onClose={() => setStatementCustomer(null)}
            customer={statementCustomer}
          />
        )}

      </div>
    </PageShell>
  );
};
