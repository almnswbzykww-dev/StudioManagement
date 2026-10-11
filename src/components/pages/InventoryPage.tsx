import React, { useState } from 'react';
import { Product } from '../../types';
import { storageService } from '../../services/storageService';
import { PageShell } from '../common/PageShell';
import { EmptyState } from '../common/EmptyState';
import { 
  Boxes, 
  Plus, 
  Search, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Edit3, 
  Trash2, 
  X, 
  Package,
  Layers
} from 'lucide-react';

interface InventoryPageProps {
  onClose: () => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('ورق طباعة فوتوغرافي');
  const [unit, setUnit] = useState('باكت (100 ورقة)');
  const [currentQuantity, setCurrentQuantity] = useState<number | string>(10);
  const [minQuantity, setMinQuantity] = useState<number | string>(5);
  const [costPrice, setCostPrice] = useState<number | string>(5000);
  const [sellingPrice, setSellingPrice] = useState<number | string>(8000);
  const [supplierName, setSupplierName] = useState('');
  const [location, setLocation] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Stock Adjustment Modal
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState<number | string>('');
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustReason, setAdjustReason] = useState('توريد كمية جديدة');

  const products = storageService.getProducts();
  const settings = storageService.getSettings();
  const currency = settings.currency;

  const lowStockProducts = products.filter(p => p.currentQuantity <= p.minQuantity);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setName(prod.name);
      setCategory(prod.category);
      setUnit(prod.unit);
      setCurrentQuantity(prod.currentQuantity);
      setMinQuantity(prod.minQuantity);
      setCostPrice(prod.costPrice);
      setSellingPrice(prod.sellingPrice);
      setSupplierName(prod.supplierName || '');
      setLocation(prod.location || '');
    } else {
      setEditingProduct(null);
      setName('');
      setCategory('ورق طباعة فوتوغرافي');
      setUnit('حبة');
      setCurrentQuantity(10);
      setMinQuantity(5);
      setCostPrice(5000);
      setSellingPrice(8000);
      setSupplierName('');
      setLocation('');
    }
    setErrorMsg('');
    setShowAddModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('يرجى إدخال اسم الصنف.');
      return;
    }

    try {
      storageService.saveProduct({
        id: editingProduct?.id,
        name,
        category,
        unit,
        currentQuantity: Number(currentQuantity),
        minQuantity: Number(minQuantity),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        supplierName,
        location
      });
      setShowAddModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ الصنف');
    }
  };

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProduct) return;
    const delta = adjustType === 'in' ? Number(adjustQty) : -Number(adjustQty);
    storageService.updateProductQuantity(adjustProduct.id, delta, adjustReason);
    setAdjustProduct(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الصنف "${name}" من المخزون؟`)) {
      storageService.deleteProduct(id);
    }
  };

  return (
    <PageShell
      title="المخزون ومستلزمات الاستديو"
      subtitle="إدارة ورق التصوير، الأحبار الأصلية، ألواح العرسان، خامات السبلميشن وتنبيهات النواقص"
      icon={<Boxes className="w-5 h-5 text-amber-400" />}
      badge={`${products.length} صنف`}
      onClose={onClose}
      actions={
        <button
          onClick={() => handleOpenAddModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة صنف للمخزون</span>
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* Low Stock Warning Banner */}
        {lowStockProducts.length > 0 && (
          <div className="p-4 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-amber-300">
                تنبيه: يوجد عدد ({lowStockProducts.length}) أصناف وصلت أو قاربت على النفاد (تحت الحد الأدنى)!
              </h3>
              <p className="text-[11px] text-amber-200/80 mt-1">
                الأصناف المنخفضة: {lowStockProducts.map(p => `${p.name} (المتبقي: ${p.currentQuantity})`).join(' ، ')}
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم الصنف أو الكود أو التصنيف..."
              className="w-full pr-9 pl-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="text-xs text-slate-400 font-medium">
            القيمة التقديرية للمخزون: <span className="font-bold text-emerald-400 font-mono">
              {products.reduce((sum, p) => sum + (p.currentQuantity * p.costPrice), 0).toLocaleString()} {currency}
            </span>
          </div>
        </div>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <EmptyState
            title="لا توجد أصناف مطابقة"
            description="لم يتم العثور على أي صنف في المخزون يطابق بحثك."
            actionText="إضافة صنف جديد"
            onAction={() => handleOpenAddModal()}
          />
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60 shadow-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">كود الصنف</th>
                  <th className="py-3 px-4">اسم الصنف والمادة</th>
                  <th className="py-3 px-4">التصنيف</th>
                  <th className="py-3 px-4">الوحدة</th>
                  <th className="py-3 px-4 text-center">الرصيد الحالي</th>
                  <th className="py-3 px-4 text-center">حد التنبيه</th>
                  <th className="py-3 px-4">سعر التكلفة</th>
                  <th className="py-3 px-4">سعر البيع</th>
                  <th className="py-3 px-4">الموقع بالمخزن</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredProducts.map(prod => {
                  const isLow = prod.currentQuantity <= prod.minQuantity;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{prod.code}</td>
                      <td className="py-3 px-4 font-bold text-white">{prod.name}</td>
                      <td className="py-3 px-4 text-slate-300">{prod.category}</td>
                      <td className="py-3 px-4 text-slate-400">{prod.unit}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold ${
                          isLow ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {prod.currentQuantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-400">{prod.minQuantity}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{prod.costPrice.toLocaleString()} {currency}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">{prod.sellingPrice.toLocaleString()} {currency}</td>
                      <td className="py-3 px-4 text-slate-400">{prod.location || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setAdjustProduct(prod);
                              setAdjustQty(1);
                              setAdjustType('in');
                            }}
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg cursor-pointer"
                            title="تعديل الرصيد وحركة المخزون"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenAddModal(prod)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                            title="تعديل بيانات الصنف"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg cursor-pointer"
                            title="حذف الصنف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add / Edit Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-100 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h3 className="text-base font-bold text-white">
                  {editingProduct ? 'تعديل بيانات صنف المخزون' : 'إضافة صنف جديد للمخزون'}
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl mb-4">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    اسم المادة / الصنف <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="مثال: ورق كوداك فوتوغرافي لماع A4"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">التصنيف</label>
                    <input
                      type="text"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">الوحدة</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={e => setUnit(e.target.value)}
                      placeholder="حبة، باكت، رول، لتر"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">الرصيد الحالي</label>
                    <input
                      type="number"
                      value={currentQuantity}
                      onChange={e => setCurrentQuantity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">حد التنبيه (الحد الأدنى)</label>
                    <input
                      type="number"
                      value={minQuantity}
                      onChange={e => setMinQuantity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">سعر التكلفة ({currency})</label>
                    <input
                      type="number"
                      value={costPrice}
                      onChange={e => setCostPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">سعر البيع المقدر ({currency})</label>
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={e => setSellingPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">الموقع بالمستودع</label>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="رف A-1"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">المورد المعتاد</label>
                    <input
                      type="text"
                      value={supplierName}
                      onChange={e => setSupplierName(e.target.value)}
                      placeholder="اسم المورد أو الشركة"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
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
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    حفظ الصنف
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stock Adjustment Modal */}
        {adjustProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-slate-100 animate-in zoom-in-95 duration-200">
              <h3 className="text-sm font-bold text-white mb-2">حركة وتعديل رصيد المخزون</h3>
              <p className="text-xs text-slate-400 mb-4">{adjustProduct.name}</p>

              <form onSubmit={handleAdjustStock} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('in')}
                    className={`p-2 rounded-xl text-xs font-semibold cursor-pointer border ${
                      adjustType === 'in' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    + إضافة (توريد)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('out')}
                    className={`p-2 rounded-xl text-xs font-semibold cursor-pointer border ${
                      adjustType === 'out' ? 'bg-rose-600/20 border-rose-500 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    - صرف (استهلاك)
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">الكمية</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustQty}
                    onChange={e => setAdjustQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">سبب الحركة / البيان</label>
                  <input
                    type="text"
                    required
                    value={adjustReason}
                    onChange={e => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAdjustProduct(null)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    تأكيد الحركة
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
