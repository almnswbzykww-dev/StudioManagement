import React, { useState } from 'react';
import { Order, OrderStatus, ServiceType } from '../../types';
import { storageService } from '../../services/storageService';
import { PageShell } from '../common/PageShell';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Printer, 
  CreditCard, 
  Eye, 
  Trash2, 
  User as UserIcon,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface OrdersPageProps {
  onClose: () => void;
  onOpenNewOrder: () => void;
  onEditOrder: (order: Order) => void;
  onOpenPaymentModal: (order: Order) => void;
  onOpenInvoiceModal: (order: Order) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  onClose,
  onOpenNewOrder,
  onEditOrder,
  onOpenPaymentModal,
  onOpenInvoiceModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  const orders = storageService.getOrders();
  const settings = storageService.getSettings();
  const currency = settings.currency;

  const filteredOrders = orders.filter(o => {
    if (!searchTerm.trim()) {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchesService = serviceFilter === 'all' || o.serviceType === serviceFilter;
      return matchesStatus && matchesService;
    }

    const term = searchTerm.trim().toLowerCase();
    const termCleanDigits = term
      .replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
      .replace(/\D/g, '');

    const phoneClean = (o.customerPhone || '').replace(/\D/g, '');
    const orderNumClean = (o.orderNumber || '').toLowerCase();

    const matchesSearch = 
      o.customerName.toLowerCase().includes(term) ||
      orderNumClean.includes(term) ||
      (termCleanDigits && phoneClean.includes(termCleanDigits)) ||
      o.customerPhone.includes(term) ||
      (o.notes && o.notes.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesService = serviceFilter === 'all' || o.serviceType === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  const canEdit = storageService.canEditInvoices();

  const handleEditClick = (order: Order) => {
    if (!canEdit) {
      alert('⚠️ تنبيه الصلاحيات: لا تستطيع تعديل الفاتورة المحفوظة. تعديل الفواتير مخصص لمدير النظام أو لمن يمنحه المدير الصلاحية.');
      return;
    }
    onEditOrder(order);
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    storageService.updateOrderStatus(orderId, newStatus);
  };

  const handleDelete = (orderId: string, orderNumber: string) => {
    if (!canEdit) {
      alert('⚠️ تنبيه الصلاحيات: حذف وإلغاء الطلبات مخصص لمدير النظام.');
      return;
    }
    if (window.confirm(`هل أنت متأكد من حذف الطلب رقم "${orderNumber}"؟`)) {
      storageService.deleteOrder(orderId);
    }
  };

  return (
    <PageShell
      title="سجل الطلبات الشامل"
      subtitle="متابعة كافة طلبات الاستديو، مواعيد التسليم، الحسابات والمدفوعات، وحالات الإنجاز"
      icon={<Package className="w-5 h-5 text-violet-400" />}
      badge={`${orders.length} طلب`}
      onClose={onClose}
      actions={
        <button
          onClick={onOpenNewOrder}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء طلب جديد</span>
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* KPI Mini Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-xs text-slate-400 block mb-1">إجمالي قيمة الطلبات</span>
            <span className="text-lg font-bold text-white">
              {orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mr-1">{currency}</span>
          </div>

          <div className="bg-slate-900/80 border border-emerald-500/30 p-3.5 rounded-2xl">
            <span className="text-xs text-emerald-400 block mb-1">إجمالي المحصل</span>
            <span className="text-lg font-bold text-emerald-300">
              {orders.reduce((sum, o) => sum + o.paidAmount, 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400/80 mr-1">{currency}</span>
          </div>

          <div className="bg-slate-900/80 border border-amber-500/30 p-3.5 rounded-2xl">
            <span className="text-xs text-amber-400 block mb-1">المتبقي (ديون الطلبات)</span>
            <span className="text-lg font-bold text-amber-300">
              {orders.reduce((sum, o) => sum + o.remainingAmount, 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-amber-400/80 mr-1">{currency}</span>
          </div>

          <div className="bg-slate-900/80 border border-blue-500/30 p-3.5 rounded-2xl">
            <span className="text-xs text-blue-400 block mb-1">الطلبات الجاهزة</span>
            <span className="text-lg font-bold text-blue-300">
              {orders.filter(o => o.status === 'ready').length} طلب جاهز
            </span>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ابحث برقم الطلب أو العميل أو الهاتف..."
              className="w-full pr-9 pl-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Service filter */}
            <select
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">كافة الأقسام والخدمات</option>
              <option value="wedding_board">لوحات العرسان</option>
              <option value="studio_photos">الصور وجلسات الاستديو</option>
              <option value="advertising">الدعاية والإعلان</option>
              <option value="graphic_design">التصميمات والشعارات</option>
              <option value="photo_albums">ألبومات الصور</option>
              <option value="video_montage">الفيديو والمونتاج</option>
              <option value="outdoor_photo">التصوير الخارجي</option>
              <option value="thermal_print">الطباعة الحرارية</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">كافة الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="in_design">قيد التصميم</option>
              <option value="in_shooting">قيد التصوير</option>
              <option value="in_printing">قيد الطباعة</option>
              <option value="in_montage">قيد المونتاج</option>
              <option value="ready">جاهز للتسليم</option>
              <option value="delivered">تم التسليم</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            title="لا توجد طلبات مطابقة"
            description="لم يتم العثور على أي طلب يطابق معايير البحث والفلترة المختارة."
            actionText="إنشاء طلب جديد"
            onAction={onOpenNewOrder}
          />
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60 shadow-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">رقم الطلب</th>
                  <th className="py-3 px-4">العميل والهاتف</th>
                  <th className="py-3 px-4">نوع الخدمة والعمل</th>
                  <th className="py-3 px-4">تاريخ الطلب والتسليم</th>
                  <th className="py-3 px-4">الإجمالي</th>
                  <th className="py-3 px-4">المدفوع</th>
                  <th className="py-3 px-4">المتبقي</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-850/50 transition-colors">
                    
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                      {order.orderNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white text-xs">{order.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5" dir="ltr">{order.customerPhone}</p>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-200">{order.serviceTitle}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{order.items?.[0]?.title || '-'}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 font-mono">
                        <span>طلب: {order.orderDate}</span>
                        <span className="block text-emerald-400 font-semibold">تسليم: {order.deliveryDate}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {order.totalAmount.toLocaleString()} {currency}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {order.paidAmount.toLocaleString()} {currency}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={order.remainingAmount > 0 ? 'text-amber-400' : 'text-slate-500'}>
                        {order.remainingAmount.toLocaleString()} {currency}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="text-[11px] px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="in_design">قيد التصميم</option>
                        <option value="in_shooting">قيد التصوير</option>
                        <option value="in_printing">قيد الطباعة</option>
                        <option value="in_montage">قيد المونتاج</option>
                        <option value="ready">جاهز للتسليم</option>
                        <option value="delivered">تم التسليم</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEditClick(order)}
                          className={`p-1.5 rounded-lg cursor-pointer ${
                            canEdit ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-amber-400'
                          }`}
                          title={canEdit ? "تعديل تفاصيل الطلب والفاتورة" : "تعديل الفاتورة مقفل للكاشير (خاص بالمدير)"}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenPaymentModal(order)}
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 rounded-lg cursor-pointer"
                          title="نظام الدفع والتحصيل"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenInvoiceModal(order)}
                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 rounded-lg cursor-pointer"
                          title="معاينة وطباعة الفاتورة"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id, order.orderNumber)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg cursor-pointer"
                          title="حذف الطلب"
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

      </div>
    </PageShell>
  );
};
