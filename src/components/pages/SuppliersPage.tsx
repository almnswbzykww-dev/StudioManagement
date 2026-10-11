import React, { useState } from 'react';
import { Supplier, Purchase, Product, PaymentMethod } from '../../types';
import { storageService } from '../../services/storageService';
import { PageShell } from '../common/PageShell';
import { EmptyState } from '../common/EmptyState';
import { 
  Truck, 
  Plus, 
  Search, 
  ShoppingCart, 
  Phone, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Edit3, 
  Trash2, 
  X, 
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface SuppliersPageProps {
  onClose: () => void;
}

export const SuppliersPage: React.FC<SuppliersPageProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'purchases'>('suppliers');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Supplier Form
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('أحبار وورق');
  const [notes, setNotes] = useState('');

  // Purchase Form
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<{ productId: string; productName: string; quantity: number; unitPrice: number; totalPrice: number }[]>([]);
  const [purchasePaid, setPurchasePaid] = useState<number | string>(0);
  const [purchaseMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [purchaseRef, setPurchaseRef] = useState('');
  const [purchaseNotes, setPurchaseNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const suppliers = storageService.getSuppliers();
  const purchases = storageService.getPurchases();
  const products = storageService.getProducts();
  const settings = storageService.getSettings();
  const currency = settings.currency;

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm) ||
    s.supplierNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenSupplierModal = (sup?: Supplier) => {
    if (sup) {
      setEditingSupplier(sup);
      setName(sup.name);
      setCompanyName(sup.companyName);
      setPhone(sup.phone);
      setAddress(sup.address || '');
      setCategory(sup.category);
      setNotes(sup.notes || '');
    } else {
      setEditingSupplier(null);
      setName('');
      setCompanyName('');
      setPhone('');
      setAddress('');
      setCategory('أحبار وورق');
      setNotes('');
    }
    setErrorMsg('');
    setShowAddSupplier(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !companyName.trim()) {
      setErrorMsg('يرجى إدخال اسم المورد واسم الشركة.');
      return;
    }

    try {
      storageService.saveSupplier({
        id: editingSupplier?.id,
        name,
        companyName,
        phone,
        address,
        category,
        notes
      });
      setShowAddSupplier(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ المورد');
    }
  };

  const handleAddPurchaseItemRow = () => {
    if (products.length === 0) return;
    const firstProd = products[0];
    setPurchaseItems([
      ...purchaseItems,
      {
        productId: firstProd.id,
        productName: firstProd.name,
        quantity: 1,
        unitPrice: firstProd.costPrice,
        totalPrice: firstProd.costPrice
      }
    ]);
  };

  const handleUpdateItemRow = (idx: number, field: string, val: any) => {
    const updated = [...purchaseItems];
    if (field === 'productId') {
      const prod = products.find(p => p.id === val);
      if (prod) {
        updated[idx].productId = prod.id;
        updated[idx].productName = prod.name;
        updated[idx].unitPrice = prod.costPrice;
        updated[idx].totalPrice = updated[idx].quantity * prod.costPrice;
      }
    } else if (field === 'quantity') {
      const q = Number(val);
      updated[idx].quantity = q;
      updated[idx].totalPrice = q * updated[idx].unitPrice;
    } else if (field === 'unitPrice') {
      const p = Number(val);
      updated[idx].unitPrice = p;
      updated[idx].totalPrice = updated[idx].quantity * p;
    }
    setPurchaseItems(updated);
  };

  const handleRemoveItemRow = (idx: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== idx));
  };

  const totalPurchaseAmount = purchaseItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      setErrorMsg('يرجى اختيار المورد.');
      return;
    }
    if (purchaseItems.length === 0) {
      setErrorMsg('يرجى إضافة صنف واحد على الأقل لفاتورة الشراء.');
      return;
    }

    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    if (!supplier) return;

    try {
      const paid = Number(purchasePaid);
      storageService.addPurchase({
        supplierId: supplier.id,
        supplierName: `${supplier.name} - ${supplier.companyName}`,
        items: purchaseItems,
        totalAmount: totalPurchaseAmount,
        paidAmount: paid,
        remainingAmount: Math.max(0, totalPurchaseAmount - paid),
        purchaseDate: new Date().toISOString().split('T')[0],
        paymentMethod: purchaseMethod,
        invoiceReference: purchaseRef,
        notes: purchaseNotes
      });

      setShowAddPurchase(false);
      setPurchaseItems([]);
      setPurchasePaid(0);
      setPurchaseRef('');
      setPurchaseNotes('');
      setActiveTab('purchases');
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ فاتورة الشراء');
    }
  };

  return (
    <PageShell
      title="الموردون وفواتير المشتريات"
      subtitle="إدارة الموردين، مشتريات خامات الطباعة، وتحديث أرصدة المخزون تلقائياً"
      icon={<Truck className="w-5 h-5 text-sky-400" />}
      badge={`${suppliers.length} مورد`}
      onClose={onClose}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (products.length > 0 && purchaseItems.length === 0) {
                handleAddPurchaseItemRow();
              }
              if (suppliers.length > 0 && !selectedSupplierId) {
                setSelectedSupplierId(suppliers[0].id);
              }
              setShowAddPurchase(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>تسجيل فاتورة مشتريات</span>
          </button>

          <button
            onClick={() => handleOpenSupplierModal()}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مورد جديد</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* KPI Mini Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-xs text-slate-400 block mb-1">إجمالي المشتريات</span>
            <span className="text-lg font-bold text-white">
              {suppliers.reduce((sum, s) => sum + s.totalPurchases, 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mr-1">{currency}</span>
          </div>

          <div className="bg-slate-900/80 border border-emerald-500/30 p-3.5 rounded-2xl">
            <span className="text-xs text-emerald-400 block mb-1">المسدد للموردين</span>
            <span className="text-lg font-bold text-emerald-300">
              {suppliers.reduce((sum, s) => sum + s.totalPaid, 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400/80 mr-1">{currency}</span>
          </div>

          <div className="bg-slate-900/80 border border-amber-500/30 p-3.5 rounded-2xl">
            <span className="text-xs text-amber-400 block mb-1">مستحقات الموردين (ديون)</span>
            <span className="text-lg font-bold text-amber-300">
              {suppliers.reduce((sum, s) => sum + s.balanceDebt, 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-amber-400/80 mr-1">{currency}</span>
          </div>

          <div className="bg-slate-900/80 border border-blue-500/30 p-3.5 rounded-2xl">
            <span className="text-xs text-blue-400 block mb-1">عدد فواتير الشراء</span>
            <span className="text-lg font-bold text-blue-300 font-mono">
              {purchases.length} فاتورة
            </span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'suppliers'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            دليل الموردين المعتمدين ({suppliers.length})
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'purchases'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            سجل فواتير المشتريات والتوريد ({purchases.length})
          </button>
        </div>

        {/* Tab 1: Suppliers List */}
        {activeTab === 'suppliers' && (
          <div className="space-y-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="ابحث باسم المورد أو الشركة..."
                className="w-full pr-9 pl-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60 shadow-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">رقم المورد</th>
                    <th className="py-3 px-4">اسم المورد</th>
                    <th className="py-3 px-4">اسم المؤسسة / الشركة</th>
                    <th className="py-3 px-4">رقم الهاتف</th>
                    <th className="py-3 px-4">التخصص والخامات</th>
                    <th className="py-3 px-4">إجمالي المشتريات</th>
                    <th className="py-3 px-4">المسدد له</th>
                    <th className="py-3 px-4">المتبقي له (دين)</th>
                    <th className="py-3 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredSuppliers.map(sup => (
                    <tr key={sup.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4 font-mono font-bold text-sky-400">{sup.supplierNumber}</td>
                      <td className="py-3 px-4 font-bold text-white">{sup.name}</td>
                      <td className="py-3 px-4 text-slate-200">{sup.companyName}</td>
                      <td className="py-3 px-4 font-mono text-slate-300" dir="ltr">{sup.phone}</td>
                      <td className="py-3 px-4 text-slate-400">{sup.category}</td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {sup.totalPurchases.toLocaleString()} {currency}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {sup.totalPaid.toLocaleString()} {currency}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={sup.balanceDebt > 0 ? 'text-amber-400' : 'text-slate-500'}>
                          {sup.balanceDebt.toLocaleString()} {currency}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenSupplierModal(sup)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                            title="تعديل بيانات المورد"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Purchases List */}
        {activeTab === 'purchases' && (
          <div className="space-y-4">
            {purchases.length === 0 ? (
              <EmptyState
                title="لا توجد فواتير مشتريات"
                description="لم يتم تسجيل أي عملية شراء خامات حتى الآن."
                actionText="تسجيل فاتورة شراء"
                onAction={() => {
                  handleAddPurchaseItemRow();
                  setShowAddPurchase(true);
                }}
              />
            ) : (
              <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60 shadow-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">رقم الفاتورة</th>
                      <th className="py-3 px-4">المورد</th>
                      <th className="py-3 px-4">تاريخ الشراء</th>
                      <th className="py-3 px-4">الأصناف الموردة</th>
                      <th className="py-3 px-4">الإجمالي</th>
                      <th className="py-3 px-4">المسدد الآن</th>
                      <th className="py-3 px-4">المتبقي</th>
                      <th className="py-3 px-4">المسؤول</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {purchases.map(pur => (
                      <tr key={pur.id} className="hover:bg-slate-850/50">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">{pur.purchaseNumber}</td>
                        <td className="py-3 px-4 font-bold text-white">{pur.supplierName}</td>
                        <td className="py-3 px-4 font-mono text-slate-300">{pur.purchaseDate}</td>
                        <td className="py-3 px-4 text-slate-300">
                          {pur.items.map(i => `${i.productName} (${i.quantity})`).join(' ، ')}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          {pur.totalAmount.toLocaleString()} {currency}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          {pur.paidAmount.toLocaleString()} {currency}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          {pur.remainingAmount.toLocaleString()} {currency}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{pur.createdByName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Supplier Modal */}
        {showAddSupplier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-100 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h3 className="text-base font-bold text-white">
                  {editingSupplier ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
                </h3>
                <button onClick={() => setShowAddSupplier(false)} className="p-1.5 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl mb-4">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSaveSupplier} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    اسم المورد أو المسؤول <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="مثال: م. مروان القديمي"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    اسم المؤسسة / الشركة <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="مؤسسة الأفق لمستلزمات الطباعة"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">رقم الهاتف</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="77XXXXXXX"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">التخصص</label>
                    <input
                      type="text"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      placeholder="أحبار، ورق، خشب، أكواب"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">العنوان</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="صنعاء - شارع القيادة"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddSupplier(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    حفظ المورد
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Purchase Invoice Modal */}
        {showAddPurchase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-2xl w-full p-6 text-slate-100 my-6 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">تسجيل وتوريد فاتورة مشتريات خامات</h3>
                </div>
                <button onClick={() => setShowAddPurchase(false)} className="p-1.5 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl mb-4">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSavePurchase} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      المورد <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={selectedSupplierId}
                      onChange={e => setSelectedSupplierId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - {s.companyName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">رقم الفاتورة الورقية (المرجع)</label>
                    <input
                      type="text"
                      value={purchaseRef}
                      onChange={e => setPurchaseRef(e.target.value)}
                      placeholder="INV-10924"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                {/* Items row */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300">أصناف المواد المشتراة</span>
                    <button
                      type="button"
                      onClick={handleAddPurchaseItemRow}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة صنف</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                    {purchaseItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <select
                          value={item.productId}
                          onChange={e => handleUpdateItemRow(idx, 'productId', e.target.value)}
                          className="flex-1 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleUpdateItemRow(idx, 'quantity', e.target.value)}
                          placeholder="الكمية"
                          className="w-20 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white text-center font-bold"
                        />

                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={e => handleUpdateItemRow(idx, 'unitPrice', e.target.value)}
                          placeholder="سعر التكلفة"
                          className="w-28 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white text-left font-mono"
                        />

                        <span className="w-28 text-left font-mono font-bold text-xs text-emerald-400">
                          {item.totalPrice.toLocaleString()} {currency}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financials */}
                <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">إجمالي الفاتورة:</span>
                    <span className="text-base font-bold font-mono text-white">
                      {totalPurchaseAmount.toLocaleString()} {currency}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-0.5">المبلغ المسدد الآن:</label>
                    <input
                      type="number"
                      min="0"
                      max={totalPurchaseAmount}
                      value={purchasePaid}
                      onChange={e => setPurchasePaid(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-emerald-400 font-mono"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">المتبقي للمورد:</span>
                    <span className="text-base font-bold font-mono text-amber-400">
                      {Math.max(0, totalPurchaseAmount - Number(purchasePaid)).toLocaleString()} {currency}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddPurchase(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    حفظ الفاتورة وتحديث المخزون
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </PageShell>
  );
};
