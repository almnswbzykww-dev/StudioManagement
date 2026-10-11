import React, { useState } from 'react';
import { ServiceType, Order, OrderStatus } from '../../types';
import { storageService } from '../../services/storageService';
import { DEFAULT_SECTION_IMAGES } from '../../assets/sectionImagesAsset';
import { PageShell } from '../common/PageShell';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  CreditCard, 
  Printer, 
  Trash2, 
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  User as UserIcon,
  Tag
} from 'lucide-react';

interface ServiceSectionPageProps {
  serviceType: ServiceType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  specsSummaryKey?: string;
  onClose: () => void;
  onOpenNewOrder: (serviceType: ServiceType, lockServiceType?: boolean) => void;
  onEditOrder: (order: Order) => void;
  onOpenPaymentModal: (order: Order) => void;
  onOpenInvoiceModal: (order: Order) => void;
}

export const ServiceSectionPage: React.FC<ServiceSectionPageProps> = ({
  serviceType,
  title,
  subtitle,
  icon,
  onClose,
  onOpenNewOrder,
  onEditOrder,
  onOpenPaymentModal,
  onOpenInvoiceModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const allOrders = storageService.getOrders();
  const serviceOrders = allOrders.filter(o => o.serviceType === serviceType);
  const settings = storageService.getSettings();
  const currency = settings.currency;
  const sectionImg = storageService.getSectionImage(serviceType) || DEFAULT_SECTION_IMAGES[serviceType];

  // Filtered orders
  const filteredOrders = serviceOrders.filter(o => {
    const matchesSearch = 
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm) ||
      (o.notes && o.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Department Stats
  const totalAmount = serviceOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalPaid = serviceOrders.reduce((sum, o) => sum + o.paidAmount, 0);
  const totalRemaining = serviceOrders.reduce((sum, o) => sum + o.remainingAmount, 0);
  const inProgressCount = serviceOrders.filter(o => !['delivered', 'cancelled', 'ready'].includes(o.status)).length;
  const readyCount = serviceOrders.filter(o => o.status === 'ready').length;

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    storageService.updateOrderStatus(orderId, newStatus);
  };

  const handleDelete = (orderId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) {
      storageService.deleteOrder(orderId);
    }
  };

  return (
    <PageShell
      title={title}
      subtitle={subtitle}
      icon={icon}
      badge={`${serviceOrders.length} طلب`}
      onClose={onClose}
      actions={
        <button
          onClick={() => onOpenNewOrder(serviceType, true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>طلب جديد في هذا القسم</span>
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* إطار الصورة الثابتة للقسم (تظهر دائماً حتى عند انقطاع الإنترنت) */}
        <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 flex items-center justify-between p-4 sm:p-6 group select-none">
          <img 
            src={sectionImg} 
            alt={title} 
            onError={(e) => {
              const fallback = DEFAULT_SECTION_IMAGES[serviceType];
              if (fallback && e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              }
            }}
            className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[1px] group-hover:opacity-40 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl shrink-0 bg-slate-900">
              <img 
                src={sectionImg} 
                alt={title} 
                onError={(e) => {
                  const fallback = DEFAULT_SECTION_IMAGES[serviceType];
                  if (fallback && e.currentTarget.src !== fallback) {
                    e.currentTarget.src = fallback;
                  }
                }}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  صورة معتمدة وثابتة أوفلاين
                </span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white mt-1">{title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* KPI Mini Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-xs text-slate-400 block mb-1">إجمالي المبيعات</span>
            <span className="text-lg font-bold text-white">{totalAmount.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 mr-1">{currency}</span>
          </div>

          <div className="bg-slate-900/80 border border-emerald-500/30 p-3.5 rounded-2xl">
            <span className="text-xs text-emerald-400 block mb-1">المبالغ المحصلة</span>
            <span className="text-lg font-bold text-emerald-300">{totalPaid.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-400/80 mr-1">{currency}</span>
          </div>

          <div className="bg-slate-900/80 border border-amber-500/30 p-3.5 rounded-2xl">
            <span className="text-xs text-amber-400 block mb-1">المتبقي (ديون الطلبات)</span>
            <span className="text-lg font-bold text-amber-300">{totalRemaining.toLocaleString()}</span>
            <span className="text-[10px] text-amber-400/80 mr-1">{currency}</span>
          </div>

          <div className="bg-slate-900/80 border border-blue-500/30 p-3.5 rounded-2xl">
            <span className="text-xs text-blue-400 block mb-1">حالة العمليات</span>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-blue-300">{inProgressCount} قيد التنفيذ</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-300">{readyCount} جاهز</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="بحث بالعميل أو رقم الطلب أو الهاتف..."
              className="w-full pr-9 pl-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">جميع الحالات</option>
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
            title={`لا توجد طلبات في قسم ${title}`}
            description="لم يتم العثور على أي طلبات تطابق معايير البحث والفلترة. يمكنك إضافة طلب جديد الآن."
            actionText="إضافة أول طلب في هذا القسم"
            onAction={() => onOpenNewOrder(serviceType, true)}
          />
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60 shadow-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">رقم الطلب</th>
                  <th className="py-3 px-4">العميل والهاتف</th>
                  <th className="py-3 px-4">مواصفات وتفاصيل العمل</th>
                  <th className="py-3 px-4">التسليم</th>
                  <th className="py-3 px-4">الإجمالي</th>
                  <th className="py-3 px-4">المدفوع</th>
                  <th className="py-3 px-4">المتبقي</th>
                  <th className="py-3 px-4">الحالة والتحديث</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-850/50 transition-colors">
                    
                    {/* Order No */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                      {order.orderNumber}
                      <span className="block text-[10px] text-slate-500 font-sans mt-0.5">{order.orderDate}</span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white text-xs">{order.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5" dir="ltr">{order.customerPhone}</p>
                    </td>

                    {/* Item Details & Specs */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-medium text-slate-200 line-clamp-1">{order.items?.[0]?.title || order.serviceTitle}</p>
                      {order.items?.[0]?.specifications && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(order.items[0].specifications).slice(0, 2).map(([k, v]) => (
                            <span key={k} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Delivery Date */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 font-mono text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>{order.deliveryDate}</span>
                      </div>
                      {order.deliveryTime && (
                        <span className="text-[10px] text-slate-500 block mt-0.5">{order.deliveryTime}</span>
                      )}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {order.totalAmount.toLocaleString()} {currency}
                    </td>

                    {/* Paid */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {order.paidAmount.toLocaleString()} {currency}
                    </td>

                    {/* Remaining */}
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={order.remainingAmount > 0 ? 'text-rose-400' : 'text-slate-500'}>
                        {order.remainingAmount.toLocaleString()} {currency}
                      </span>
                    </td>

                    {/* Status & Quick Change */}
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

                    {/* Actions */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditOrder(order)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="تعديل تفاصيل الطلب"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenPaymentModal(order)}
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                          title="نظام الدفع والتحصيل"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenInvoiceModal(order)}
                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                          title="طباعة الفاتورة"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
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
