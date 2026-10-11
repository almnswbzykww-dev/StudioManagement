import React, { useState, useEffect } from 'react';
import { storageService } from './services/storageService';
import { Order, Customer, ServiceType } from './types';
import { TopHeader } from './components/common/TopHeader';
import { Sidebar } from './components/common/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ServiceSectionPage } from './components/pages/ServiceSectionPage';
import { CustomersPage } from './components/pages/CustomersPage';
import { OrdersPage } from './components/pages/OrdersPage';
import { AccountingPage } from './components/pages/AccountingPage';
import { InventoryPage } from './components/pages/InventoryPage';
import { SuppliersPage } from './components/pages/SuppliersPage';
import { EmployeesPage } from './components/pages/EmployeesPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { AuditLogPage } from './components/pages/AuditLogPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { OrderEditorModal } from './components/orders/OrderEditorModal';
import { PaymentModal } from './components/common/PaymentModal';
import { InvoiceModal } from './components/common/InvoiceModal';
import { LoginPage } from './components/auth/LoginPage';

import { 
  HeartHandshake, 
  Camera, 
  Megaphone, 
  Palette, 
  BookOpen, 
  Film, 
  Image as ImageIcon, 
  Flame,
  Printer,
  Sparkles,
  ShieldCheck 
} from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Global modals
  const [orderModal, setOrderModal] = useState<{
    isOpen: boolean;
    order?: Order | null;
    initialServiceType?: ServiceType;
    lockServiceType?: boolean;
  }>({
    isOpen: false,
    order: null,
    initialServiceType: 'wedding_board',
    lockServiceType: false
  });

  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    order?: Order | null;
  }>({
    isOpen: false,
    order: null
  });

  const [invoiceModal, setInvoiceModal] = useState<{
    isOpen: boolean;
    order?: Order | null;
  }>({
    isOpen: false,
    order: null
  });

  // State counters for badges
  const [orders, setOrders] = useState<Order[]>(storageService.getOrders());
  const [customers, setCustomers] = useState<Customer[]>(storageService.getCustomers());
  const [products, setProducts] = useState(storageService.getProducts());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => storageService.isAuthenticated());

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setOrders(storageService.getOrders());
      setCustomers(storageService.getCustomers());
      setProducts(storageService.getProducts());
      setIsAuthenticated(storageService.isAuthenticated());
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    storageService.logout();
    setIsAuthenticated(false);
  };

  // Quick Action Handlers
  const handleOpenNewOrder = (serviceType: ServiceType = 'wedding_board', lockServiceType: boolean = false) => {
    setOrderModal({
      isOpen: true,
      order: null,
      initialServiceType: serviceType,
      lockServiceType
    });
  };

  const handleEditOrder = (order: Order) => {
    setOrderModal({
      isOpen: true,
      order,
      initialServiceType: order.serviceType,
      lockServiceType: true
    });
  };

  const handleOpenPayment = (order: Order) => {
    setPaymentModal({
      isOpen: true,
      order
    });
  };

  const handleOpenInvoice = (order: Order) => {
    setInvoiceModal({
      isOpen: true,
      order
    });
  };

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('studio_theme_mode') as 'dark' | 'light') || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('studio_theme_mode', nextTheme);
  };

  const lowStockCount = products.filter(p => p.currentQuantity <= p.minQuantity).length;

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={`min-h-screen flex flex-col relative selection:bg-amber-500 selection:text-slate-950 ${
      theme === 'dark' 
        ? 'bg-[#060a14] text-slate-100' 
        : 'bg-slate-100 text-slate-800'
    }`}>
      
      {/* Studio Atmosphere Background Overlays */}
      {theme === 'dark' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Deep studio navy gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#070b14] via-[#0b1326] to-[#050811] opacity-95" />
          
          {/* Soft studio softbox & spotlight bokeh */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-10 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
          
          {/* Subtle camera aperture pattern svg */}
          <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>
      )}

      {/* Top Application Header */}
      <TopHeader
        onNavigate={setActivePage}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      {/* Main Layout Area: Sidebar + Content */}
      <div className="flex-1 flex relative z-10">
        
        {/* Collapsible Sidebar */}
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          ordersCount={orders.length}
          customersCount={customers.length}
          lowStockCount={lowStockCount}
          theme={theme}
        />

        {/* Dynamic Page Router Content */}
        <main className="flex-1 flex flex-col min-w-0 min-h-[calc(100vh-57px)] overflow-x-hidden">
          
          {/* 1. Dashboard View */}
          {activePage === 'dashboard' && (
            <div className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
              <DashboardView
                onNavigate={setActivePage}
                onOpenOrder={handleEditOrder}
                onOpenNewOrderWithService={(srv) => handleOpenNewOrder(srv, true)}
                onOpenPaymentModal={handleOpenPayment}
                onOpenInvoiceModal={handleOpenInvoice}
                theme={theme}
                onToggleTheme={toggleTheme}
              />
            </div>
          )}

          {/* 2. Specialized Services Sections (Requirement 5 & 19) */}
          {activePage === 'wedding_boards' && (
            <ServiceSectionPage
              serviceType="wedding_board"
              title="قسم لوحات العرسان الفاخرة"
              subtitle="تصميم وطباعة اللوحات الملكية الكبيرة، إطارات الأخشاب والأكريليك وإضاءة الـ LED"
              icon={<HeartHandshake className="w-5 h-5 text-rose-400" />}
              onClose={() => setActivePage('dashboard')}
              onOpenNewOrder={handleOpenNewOrder}
              onEditOrder={handleEditOrder}
              onOpenPaymentModal={handleOpenPayment}
              onOpenInvoiceModal={handleOpenInvoice}
            />
          )}

          {activePage === 'studio_photos' && (
            <ServiceSectionPage
              serviceType="studio_photos"
              title="قسم الصور وجلسات الاستديو"
              subtitle="جلسات التصوير الداخلي، بورتريهات شخصية، حفلات تخرج، أطفال وصور رسمية"
              icon={<Camera className="w-5 h-5 text-cyan-400" />}
              onClose={() => setActivePage('dashboard')}
              onOpenNewOrder={handleOpenNewOrder}
              onEditOrder={handleEditOrder}
              onOpenPaymentModal={handleOpenPayment}
              onOpenInvoiceModal={handleOpenInvoice}
            />
          )}

          {activePage === 'advertising' && (
            <ServiceSectionPage
              serviceType="advertising"
              title="قسم الدعاية والإعلان والبنرات"
              subtitle="طباعة لوحات فليكس، فينيل، ستيكرات خارجية، رول اب، وحروف بارزة مضيئة"
              icon={<Megaphone className="w-5 h-5 text-amber-400" />}
              onClose={() => setActivePage('dashboard')}
              onOpenNewOrder={handleOpenNewOrder}
              onEditOrder={handleEditOrder}
              onOpenPaymentModal={handleOpenPayment}
              onOpenInvoiceModal={handleOpenInvoice}
            />
          )}

          {activePage === 'graphic_design' && (
            <ServiceSectionPage
              serviceType="graphic_design"
              title="قسم التصميمات والجرافيك"
              subtitle="تصميم الشعارات، الهويات التجارية، كروت شخصية فاخرة، وبطاقات دعوات رقمية"
              icon={<Palette className="w-5 h-5 text-purple-400" />}
              onClose={() => setActivePage('dashboard')}
              onOpenNewOrder={handleOpenNewOrder}
              onEditOrder={handleEditOrder}
              onOpenPaymentModal={handleOpenPayment}
              onOpenInvoiceModal={handleOpenInvoice}
            />
          )}

          {activePage === 'photo_albums' && (
            <ServiceSectionPage
              serviceType="photo_albums"
              title="قسم ألبومات الصور الفاخرة"
              subtitle="ألبومات عرسان ديجيتال حرارية، جلد إيطالي، زجاج أكريليك وصناديق حفظ فاخرة"
              icon={<BookOpen className="w-5 h-5 text-emerald-400" />}
              onClose={() => setActivePage('dashboard')}
              onOpenNewOrder={handleOpenNewOrder}
              onEditOrder={handleEditOrder}
              onOpenPaymentModal={handleOpenPayment}
              onOpenInvoiceModal={handleOpenInvoice}
            />
          )}

          {activePage === 'video_montage' && (
            <ServiceSectionPage
              serviceType="video_montage"
              title="قسم الفيديو والمونتاج"
              subtitle="تصوير سينمائي 4K، تصوير درون جوي، مونتاج إعلاني ومناسبات وتيزرات احترافية"
              icon={<Film className="w-5 h-5 text-indigo-400" />}
              onClose={() => setActivePage('dashboard')}
              onOpenNewOrder={handleOpenNewOrder}
              onEditOrder={handleEditOrder}
              onOpenPaymentModal={handleOpenPayment}
              onOpenInvoiceModal={handleOpenInvoice}
            />
          )}

          {activePage === 'outdoor_photo' && (
            <ServiceSectionPage
              serviceType="outdoor_photo"
              title="قسم التصوير الخارجي والمناسبات"
              subtitle="جلسات تصوير في حدائق ومنتجعات سياحية وتغطية الأفراح والمؤتمرات"
              icon={<ImageIcon className="w-5 h-5 text-teal-400" />}
              onClose={() => setActivePage('dashboard')}
              onOpenNewOrder={handleOpenNewOrder}
              onEditOrder={handleEditOrder}
              onOpenPaymentModal={handleOpenPayment}
              onOpenInvoiceModal={handleOpenInvoice}
            />
          )}

          {activePage === 'thermal_print' && (
            <ServiceSectionPage
              serviceType="thermal_print"
              title="قسم الطباعة الحرارية والهدايا"
              subtitle="طباعة سبلميشن للتيشيرتات، الأكواب السحرية، دروع الكريستال والخشب والهدايا التذكارية"
              icon={<Flame className="w-5 h-5 text-orange-400" />}
              onClose={() => setActivePage('dashboard')}
              onOpenNewOrder={handleOpenNewOrder}
              onEditOrder={handleEditOrder}
              onOpenPaymentModal={handleOpenPayment}
              onOpenInvoiceModal={handleOpenInvoice}
            />
          )}

          {activePage === 'general_service' && (
            <ServiceSectionPage
              serviceType="general_service"
              title="قسم خدمات الطباعة العامة"
              subtitle="تصوير مستندات وملازم، طباعة مخططات وخرائط هندسية أوتوكاد، تجليد، وتغليف حراري"
              icon={<Printer className="w-5 h-5 text-slate-300" />}
              onClose={() => setActivePage('dashboard')}
              onOpenNewOrder={handleOpenNewOrder}
              onEditOrder={handleEditOrder}
              onOpenPaymentModal={handleOpenPayment}
              onOpenInvoiceModal={handleOpenInvoice}
            />
          )}

          {activePage === 'wedding_sessions' && (
            <ServiceSectionPage
              serviceType="wedding_session"
              title="قسم جلسات تصوير العرسان VIP"
              subtitle="تصوير مخصص للعرسان داخل الاستديو بأحدث الكاميرات وإضاءات السينما الملكية"
              icon={<Sparkles className="w-5 h-5 text-pink-400" />}
              onClose={() => setActivePage('dashboard')}
              onOpenNewOrder={handleOpenNewOrder}
              onEditOrder={handleEditOrder}
              onOpenPaymentModal={handleOpenPayment}
              onOpenInvoiceModal={handleOpenInvoice}
            />
          )}

          {activePage === 'passport_photos' && (
            <ServiceSectionPage
              serviceType="passport_photos"
              title="قسم صور المعاملات والجوازات"
              subtitle="تصوير فوري رسمي للجوازات والسفارات والفيز والمعاملات الحكومية"
              icon={<ShieldCheck className="w-5 h-5 text-blue-400" />}
              onClose={() => setActivePage('dashboard')}
              onOpenNewOrder={handleOpenNewOrder}
              onEditOrder={handleEditOrder}
              onOpenPaymentModal={handleOpenPayment}
              onOpenInvoiceModal={handleOpenInvoice}
            />
          )}

          {activePage === 'photo_restoration' && (
            <ServiceSectionPage
              serviceType="photo_restoration"
              title="قسم ترميم وتلوين الصور القديمة"
              subtitle="معالجة وترميم وتلوين الصور التالفة والتاريخية بجودة فائقة بدون فقدان التفاصيل"
              icon={<Sparkles className="w-5 h-5 text-emerald-400" />}
              onClose={() => setActivePage('dashboard')}
              onOpenNewOrder={handleOpenNewOrder}
              onEditOrder={handleEditOrder}
              onOpenPaymentModal={handleOpenPayment}
              onOpenInvoiceModal={handleOpenInvoice}
            />
          )}

          {activePage === 'canvas_prints' && (
            <ServiceSectionPage
              serviceType="canvas_prints"
              title="قسم لوحات الكانفس الفنية"
              subtitle="طباعة قماش كانفس ألماني فاخر مشدود على براويز وأخشاب سويدي فاخرة"
              icon={<Palette className="w-5 h-5 text-violet-400" />}
              onClose={() => setActivePage('dashboard')}
              onOpenNewOrder={handleOpenNewOrder}
              onEditOrder={handleEditOrder}
              onOpenPaymentModal={handleOpenPayment}
              onOpenInvoiceModal={handleOpenInvoice}
            />
          )}

          {/* 3. Customers Page */}
          {activePage === 'customers' && (
            <CustomersPage
              onClose={() => setActivePage('dashboard')}
              onOpenOrder={handleEditOrder}
              onOpenNewOrderForCustomer={(customer) => {
                setOrderModal({
                  isOpen: true,
                  order: {
                    id: '',
                    orderNumber: '',
                    customerId: customer.id,
                    customerName: customer.name,
                    customerPhone: customer.phone,
                    customerAddress: customer.address,
                    serviceType: 'wedding_board',
                    serviceTitle: 'لوحات العرسان الفاخرة',
                    items: [],
                    subtotal: 95000,
                    discount: 0,
                    tax: 0,
                    totalAmount: 95000,
                    paidAmount: 0,
                    remainingAmount: 95000,
                    status: 'pending',
                    orderDate: new Date().toISOString().split('T')[0],
                    deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                    createdById: '',
                    createdByName: '',
                    payments: [],
                    createdAt: '',
                    updatedAt: ''
                  },
                  lockServiceType: false
                });
              }}
              onOpenPaymentModal={handleOpenPayment}
              onOpenInvoiceModal={handleOpenInvoice}
            />
          )}

          {/* 4. Orders Page */}
          {activePage === 'orders' && (
            <OrdersPage
              onClose={() => setActivePage('dashboard')}
              onOpenNewOrder={() => handleOpenNewOrder('wedding_board', false)}
              onEditOrder={handleEditOrder}
              onOpenPaymentModal={handleOpenPayment}
              onOpenInvoiceModal={handleOpenInvoice}
            />
          )}

          {/* 5. Accounting Page */}
          {activePage === 'accounting' && (
            <AccountingPage onClose={() => setActivePage('dashboard')} />
          )}

          {/* 6. Inventory Page */}
          {activePage === 'inventory' && (
            <InventoryPage onClose={() => setActivePage('dashboard')} />
          )}

          {/* 7. Suppliers Page */}
          {activePage === 'suppliers' && (
            <SuppliersPage onClose={() => setActivePage('dashboard')} />
          )}

          {/* 8. Employees Page */}
          {activePage === 'employees' && (
            <EmployeesPage onClose={() => setActivePage('dashboard')} />
          )}

          {/* 9. Reports Page */}
          {activePage === 'reports' && (
            <ReportsPage onClose={() => setActivePage('dashboard')} />
          )}

          {/* 10. Audit Log Page */}
          {activePage === 'audit_log' && (
            <AuditLogPage onClose={() => setActivePage('dashboard')} />
          )}

          {/* 11. Settings Page */}
          {activePage === 'settings' && (
            <SettingsPage onClose={() => setActivePage('dashboard')} />
          )}

          {/* Bottom Footer only on inner pages - dashboard matches image.png without footer */}
          {activePage !== 'dashboard' && (
            <footer className={`mt-auto py-3.5 px-6 border-t text-xs flex flex-wrap items-center justify-between gap-3 ${
              theme === 'dark' 
                ? 'bg-[#070c18]/90 border-slate-800 text-slate-400' 
                : 'bg-white/95 border-slate-200 text-slate-600 shadow-sm'
            }`}>
              <div className="flex items-center gap-2 mx-auto sm:mx-0">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-black text-amber-500">نظام إدارة الاستديو الذكي</span>
                <span className="text-[11px] opacity-75">| إدارة التصوير والطباعة والمحاسبة 2026</span>
              </div>
              <div className="mx-auto sm:mx-0 flex items-center gap-2 font-bold text-amber-400">
                <span>برمجة وتطوير:</span>
                <span className="text-amber-300 font-black text-sm">المهندس زكريا فيصل العزعزي</span>
              </div>
            </footer>
          )}

        </main>
      </div>

      {/* Global Order Editor Modal */}
      {orderModal.isOpen && (
        <OrderEditorModal
          isOpen={orderModal.isOpen}
          order={orderModal.order}
          initialServiceType={orderModal.initialServiceType}
          lockServiceType={orderModal.lockServiceType}
          onClose={() => setOrderModal({ isOpen: false, order: null, lockServiceType: false })}
          onSaved={(savedOrder, shouldPrint) => {
            setOrders(storageService.getOrders());
            setCustomers(storageService.getCustomers());
            if (shouldPrint && savedOrder) {
              setInvoiceModal({ isOpen: true, order: savedOrder });
            }
          }}
        />
      )}

      {/* Global Unified Payment Modal (Requirement 12 & 13) */}
      {paymentModal.isOpen && paymentModal.order && (
        <PaymentModal
          isOpen={paymentModal.isOpen}
          order={paymentModal.order}
          onClose={() => setPaymentModal({ isOpen: false, order: null })}
          onPaymentSuccess={() => {
            setOrders(storageService.getOrders());
            setCustomers(storageService.getCustomers());
          }}
        />
      )}

      {/* Global Invoice Preview & Print Modal (Requirement 14 & 15) */}
      {invoiceModal.isOpen && invoiceModal.order && (
        <InvoiceModal
          isOpen={invoiceModal.isOpen}
          order={invoiceModal.order}
          onClose={() => setInvoiceModal({ isOpen: false, order: null })}
        />
      )}

    </div>
  );
}
