import {
  User,
  StudioSettings,
  Customer,
  Order,
  Product,
  Supplier,
  Employee,
  Expense,
  AuditLog,
  SalaryAdvance,
  SalaryPayment,
  Purchase
} from '../types';
import { CINEMA_CAMERA_IMAGE } from '../assets/cinemaCameraAsset';
import { CINEMA_BACKGROUND_IMAGE } from '../assets/cinemaBackgroundAsset';
import { DEFAULT_SECTION_IMAGES, CINEMA_BANNER_IMAGE } from '../assets/sectionImagesAsset';

export const initialUsers: User[] = [
  {
    id: 'u-1',
    userNumber: 1,
    username: 'admin',
    fullName: 'نظام الاستديو الذكي',
    role: 'admin',
    roleTitle: 'مدير النظام',
    phone: '777000111',
    isActive: true,
    password: 'admin',
    createdAt: '2026-01-01 08:00:00',
    lastLogin: '2026-10-04 18:00:00',
    permissions: ['all']
  },
  {
    id: 'u-2',
    userNumber: 2,
    username: 'cashier',
    fullName: 'أحمد عبد الله المحمدي',
    role: 'cashier',
    roleTitle: 'كاشير ومسؤول مبيعات',
    phone: '777111222',
    isActive: true,
    password: '123',
    createdAt: '2026-01-15 09:00:00',
    lastLogin: '2026-10-04 17:30:00',
    permissions: ['customers', 'orders', 'payments', 'invoices', 'daily_reports']
  },
  {
    id: 'u-3',
    userNumber: 3,
    username: 'designer',
    fullName: 'محمد نبيل الصبري',
    role: 'designer',
    roleTitle: 'كبير المصممين والمونتاج',
    phone: '777222333',
    isActive: true,
    password: '123',
    createdAt: '2026-02-01 10:00:00',
    lastLogin: '2026-10-04 15:45:00',
    permissions: ['orders_view', 'orders_status', 'designs', 'wedding_boards', 'albums']
  },
  {
    id: 'u-4',
    userNumber: 4,
    username: 'photographer',
    fullName: 'حسام ياسين المعمري',
    role: 'photographer',
    roleTitle: 'كبير المصورين الاستديو والخارجي',
    phone: '777333444',
    isActive: true,
    password: '123',
    createdAt: '2026-02-10 11:00:00',
    lastLogin: '2026-10-04 16:10:00',
    permissions: ['orders_view', 'orders_status', 'studio_photos', 'outdoor_photo']
  },
  {
    id: 'u-5',
    userNumber: 5,
    username: 'accountant',
    fullName: 'سمير طه القدسي',
    role: 'accountant',
    roleTitle: 'المحاسب المالي العام',
    phone: '777444555',
    isActive: true,
    password: '123',
    createdAt: '2026-02-15 09:30:00',
    lastLogin: '2026-10-04 14:00:00',
    permissions: ['accounting', 'treasury', 'expenses', 'salaries', 'reports', 'suppliers']
  }
];

export const initialStudioSettings: StudioSettings = {
  studioName: 'استديو الأضواء الملكية للتصوير الرقمي والطباعة',
  systemManagerName: 'المهندس زكريا فيصل العزعزي',
  tagline: 'فنون التصوير الفوتوغرافي الراقي والطباعة الحرارية والدعائية الفاخرة',
  address: 'صنعاء - حدة - جولة الرويشان - جوار بنك اليمن الدولي',
  phone: '01-445566',
  secondaryPhone: '777000111',
  whatsapp: '777000111',
  email: 'info@royal-studio.ye',
  crNumber: 'CR-1049284',
  taxRate: 0,
  currency: 'ر.ي',
  logoUrl: '',
  cinemaCameraBanner: CINEMA_BANNER_IMAGE || CINEMA_CAMERA_IMAGE,
  cinemaBackground: CINEMA_BACKGROUND_IMAGE,
  sectionImages: DEFAULT_SECTION_IMAGES,
  invoiceTitle: 'فاتورة ضريبية / سند تسليم خدمات',
  invoiceSubtitle: 'استديو الأضواء الملكية - للخدمات الفنية والطباعة',
  invoiceFooterNote: 'نشكركم لثقتكم الغالية باختيار استديو الأضواء الملكية. نسعد دائماً بخدمتكم وتخليد أجمل لحظاتكم.',
  invoiceTerms: '1. تسليم الأعمال خلال الموعد المحدد بالفاتورة.\n2. التعديلات المتاحة على التصميم مرتين كحد أقصى قبل الاعتماد النهائي للطباعة.\n3. يحتفظ الاستديو بالملفات الرقمية الخام لمدة 60 يوماً فقط من تاريخ التسليم.',
  printSize: 'a4',
  autoBackupInterval: 'daily',
  lastBackupDate: '2026-10-04'
};

export const initialCustomers: Customer[] = [
  {
    id: 'c-1',
    customerNumber: 'C-0001',
    name: 'عمار ياسين الشميري',
    phone: '771234567',
    secondaryPhone: '733234567',
    address: 'صنعاء - حي الأصبحي',
    notes: 'عميل مميز - حفل زفاف بتاريخ 15 أكتوبر',
    totalOrdersCount: 2,
    totalSpent: 165000,
    totalPaid: 120000,
    totalRemaining: 45000,
    createdAt: '2026-09-10 14:20:00',
    lastOrderDate: '2026-10-02'
  },
  {
    id: 'c-2',
    customerNumber: 'C-0002',
    name: 'مازن خالد القباطي',
    phone: '772345678',
    address: 'صنعاء - حدة - شارع بيروت',
    notes: 'تصوير شخصي + لوحة عرسان',
    totalOrdersCount: 1,
    totalSpent: 85000,
    totalPaid: 85000,
    totalRemaining: 0,
    createdAt: '2026-09-15 11:15:00',
    lastOrderDate: '2026-09-28'
  },
  {
    id: 'c-3',
    customerNumber: 'C-0003',
    name: 'إبراهيم عبدالملك السقاف',
    phone: '773456789',
    secondaryPhone: '711456789',
    address: 'صنعاء - شارع الزبيري',
    notes: 'مؤسسة تجارية - طلب طباعة بنرات وأكياس حرارية',
    totalOrdersCount: 2,
    totalSpent: 210000,
    totalPaid: 150000,
    totalRemaining: 60000,
    createdAt: '2026-09-18 16:30:00',
    lastOrderDate: '2026-10-03'
  },
  {
    id: 'c-4',
    customerNumber: 'C-0004',
    name: 'د. سامي فؤاد الأنسي',
    phone: '774567890',
    address: 'صنعاء - جامعة العلوم والتكنولوجيا',
    notes: 'جلسة تصوير تخرج عائلية',
    totalOrdersCount: 1,
    totalSpent: 45000,
    totalPaid: 45000,
    totalRemaining: 0,
    createdAt: '2026-09-22 17:40:00',
    lastOrderDate: '2026-09-25'
  },
  {
    id: 'c-5',
    customerNumber: 'C-0005',
    name: 'طارق عبدالحميد الحمادي',
    phone: '775678901',
    address: 'صنعاء - بيت بوس',
    notes: 'ألبوم عرسان حراري فاخر مقاس 30×40',
    totalOrdersCount: 1,
    totalSpent: 130000,
    totalPaid: 80000,
    totalRemaining: 50000,
    createdAt: '2026-10-01 12:10:00',
    lastOrderDate: '2026-10-01'
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-2026-0001',
    customerId: 'c-1',
    customerName: 'عمار ياسين الشميري',
    customerPhone: '771234567',
    customerAddress: 'صنعاء - حي الأصبحي',
    serviceType: 'wedding_board',
    serviceTitle: 'لوحات العرسان الفاخرة',
    items: [
      {
        id: 'itm-1',
        serviceType: 'wedding_board',
        title: 'لوحة عرسان ملكية فاخرة مقاس 80×120 سم مع إضاءة مخفية LED وإطار خشبي أبيض مجوف',
        description: 'صورة العريس والعروس بدقة فائقة مع إضاءة داخلية دافئة وإطار خشبي محفور',
        quantity: 1,
        unitPrice: 110000,
        totalPrice: 110000,
        specifications: {
          groomName: 'عمار الشميري',
          brideName: 'العروس الكريمة',
          boardSize: '80×120 سم',
          material: 'أكريليك + خشب ملكي',
          frameType: 'إطار خشبي مجوف فاخر مع إضاءة LED خلفية',
          lightingColor: 'أبيض دافئ (Warm White)',
          weddingDate: '2026-10-15'
        }
      }
    ],
    subtotal: 110000,
    discount: 5000,
    tax: 0,
    totalAmount: 105000,
    paidAmount: 70000,
    remainingAmount: 35000,
    status: 'in_printing',
    orderDate: '2026-09-10',
    deliveryDate: '2026-10-12',
    deliveryTime: '06:00 م',
    notes: 'الرجاء التأكد من جودة ألوان فستان الزفاف وضبط تدرجات الإضاءة الخلفية للوحة',
    assignedStaffId: 'u-3',
    assignedStaffName: 'محمد نبيل الصبري',
    createdById: 'u-2',
    createdByName: 'أحمد عبد الله المحمدي',
    payments: [
      {
        id: 'pay-1',
        orderId: 'ord-1',
        orderNumber: 'ORD-2026-0001',
        customerName: 'عمار ياسين الشميري',
        amount: 40000,
        date: '2026-09-10',
        time: '14:25:00',
        method: 'cash',
        notes: 'دفعة أولى عند توقيع الطلب',
        cashierId: 'u-2',
        cashierName: 'أحمد عبد الله المحمدي',
        createdAt: '2026-09-10 14:25:00'
      },
      {
        id: 'pay-2',
        orderId: 'ord-1',
        orderNumber: 'ORD-2026-0001',
        customerName: 'عمار ياسين الشميري',
        amount: 30000,
        date: '2026-09-25',
        time: '16:40:00',
        method: 'bank_wallet',
        walletType: 'kuraimi',
        walletName: 'كريمي / إم فلوس',
        transactionNumber: 'TX-9988231',
        transferNumber: 'TR-55441',
        senderName: 'عمار ياسين الشميري',
        senderPhone: '771234567',
        notes: 'دفعة ثانية بعد اعتماد البروفة الأولية للتصميم',
        cashierId: 'u-2',
        cashierName: 'أحمد عبد الله المحمدي',
        createdAt: '2026-09-25 16:40:00'
      }
    ],
    createdAt: '2026-09-10 14:20:00',
    updatedAt: '2026-09-25 16:40:00'
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-2026-0002',
    customerId: 'c-2',
    customerName: 'مازن خالد القباطي',
    customerPhone: '772345678',
    customerAddress: 'صنعاء - حدة - شارع بيروت',
    serviceType: 'studio_photos',
    serviceTitle: 'الصور وجلسات الاستديو',
    items: [
      {
        id: 'itm-2',
        serviceType: 'studio_photos',
        title: 'جلسة تصوير شخصية VIP داخل الاستديو (12 صورة معالجة ريتاتش مع طباعة ألبوم صغير)',
        quantity: 1,
        unitPrice: 85000,
        totalPrice: 85000,
        specifications: {
          sessionType: 'بورتريه شخصي ورسمي VIP',
          photoCount: 12,
          retouchLevel: 'ريتاتش سينمائي كامل فائق النعومة',
          printSizes: 'مقاس 20×30 سم عدد 4 صور، مقاس 13×18 سم عدد 8 صور',
          digitalDelivery: 'فلاش ميموري USB هدية + رابط سحابي'
        }
      }
    ],
    subtotal: 85000,
    discount: 0,
    tax: 0,
    totalAmount: 85000,
    paidAmount: 85000,
    remainingAmount: 0,
    status: 'delivered',
    orderDate: '2026-09-15',
    deliveryDate: '2026-09-22',
    deliveryTime: '05:00 م',
    notes: 'تم التسليم بنجاح مع الفلاش والمطبوعات الفاخرة للعميل',
    assignedStaffId: 'u-4',
    assignedStaffName: 'حسام ياسين المعمري',
    createdById: 'u-2',
    createdByName: 'أحمد عبد الله المحمدي',
    payments: [
      {
        id: 'pay-3',
        orderId: 'ord-2',
        orderNumber: 'ORD-2026-0002',
        customerName: 'مازن خالد القباطي',
        amount: 85000,
        date: '2026-09-15',
        time: '11:20:00',
        method: 'bank_wallet',
        walletType: 'jeeb',
        walletName: 'محفظة جيب',
        transactionNumber: 'JB-778812',
        transferNumber: 'REF-33441',
        senderName: 'مازن خالد القباطي',
        senderPhone: '772345678',
        notes: 'دفع كامل المبلغ مقدماً عبر تطبيق جيب',
        cashierId: 'u-2',
        cashierName: 'أحمد عبد الله المحمدي',
        createdAt: '2026-09-15 11:20:00'
      }
    ],
    createdAt: '2026-09-15 11:15:00',
    updatedAt: '2026-09-22 17:30:00'
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-2026-0003',
    customerId: 'c-3',
    customerName: 'إبراهيم عبدالملك السقاف',
    customerPhone: '773456789',
    customerAddress: 'صنعاء - شارع الزبيري',
    serviceType: 'advertising',
    serviceTitle: 'الدعاية والإعلان والبنرات',
    items: [
      {
        id: 'itm-3',
        serviceType: 'advertising',
        title: 'طباعة بنرات خارجية فليكس 440 جرام مع إطار حديد وتركيب بمقاس 3×2 متر',
        quantity: 2,
        unitPrice: 65000,
        totalPrice: 130000,
        specifications: {
          bannerMaterial: 'فليكس كوري مقاوم للعوامل الجوية 440 جرام',
          widthMeter: 3,
          heightMeter: 2,
          totalAreaM2: 12,
          needsInstallation: 'نعم مع حدادة شاسيه وتثبيت في الموقع',
          lightingIncluded: 'كشافات LED عدد 2'
        }
      }
    ],
    subtotal: 130000,
    discount: 10000,
    tax: 0,
    totalAmount: 120000,
    paidAmount: 80000,
    remainingAmount: 40000,
    status: 'in_design',
    orderDate: '2026-09-18',
    deliveryDate: '2026-10-08',
    deliveryTime: '04:00 م',
    notes: 'الموقع شارع بغداد، التواصل مع المهندس إبراهيم قبل التركيب بساعتين',
    assignedStaffId: 'u-3',
    assignedStaffName: 'محمد نبيل الصبري',
    createdById: 'u-1',
    createdByName: 'نظام الاستديو الذكي',
    payments: [
      {
        id: 'pay-4',
        orderId: 'ord-3',
        orderNumber: 'ORD-2026-0003',
        customerName: 'إبراهيم عبدالملك السقاف',
        amount: 80000,
        date: '2026-09-18',
        time: '16:45:00',
        method: 'cash',
        notes: 'عربون البدء بأعمال التصميم والحدادة',
        cashierId: 'u-1',
        cashierName: 'نظام الاستديو الذكي',
        createdAt: '2026-09-18 16:45:00'
      }
    ],
    createdAt: '2026-09-18 16:30:00',
    updatedAt: '2026-09-18 16:45:00'
  },
  {
    id: 'ord-4',
    orderNumber: 'ORD-2026-0004',
    customerId: 'c-5',
    customerName: 'طارق عبدالحميد الحمادي',
    customerPhone: '775678901',
    customerAddress: 'صنعاء - بيت بوس',
    serviceType: 'photo_albums',
    serviceTitle: 'ألبومات الصور الفاخرة',
    items: [
      {
        id: 'itm-4',
        serviceType: 'photo_albums',
        title: 'ألبوم زفاف ديجيتال حراري جلد إيطالي مقاس 30×40 سم (20 صفحة ميتاليك) مع حقيبة جلدية فاخرة وصندوق خشب منقوش',
        quantity: 1,
        unitPrice: 130000,
        totalPrice: 130000,
        specifications: {
          albumType: 'ألبوم ملكي حراري ديجيتال زجاجي + جلد',
          albumSize: '30×40 سم',
          sheetsCount: 20,
          paperType: 'ورق كوداك ميتاليك لمّاع عالي التحمل ضد الرطوبة',
          boxType: 'صندوق خشبي فاخر محفور بالليزر مع واجهة أكريليك',
          coverDetails: 'جلد طبيعي عنابي مطعم بالنحاس المذهب'
        }
      }
    ],
    subtotal: 130000,
    discount: 0,
    tax: 0,
    totalAmount: 130000,
    paidAmount: 80000,
    remainingAmount: 50000,
    status: 'ready',
    orderDate: '2026-10-01',
    deliveryDate: '2026-10-05',
    deliveryTime: '07:00 م',
    notes: 'الألبوم جاهز بالكامل للتسليم داخل الصندوق الفاخر مع الكرتون الواقي',
    assignedStaffId: 'u-3',
    assignedStaffName: 'محمد نبيل الصبري',
    createdById: 'u-2',
    createdByName: 'أحمد عبد الله المحمدي',
    payments: [
      {
        id: 'pay-5',
        orderId: 'ord-4',
        orderNumber: 'ORD-2026-0004',
        customerName: 'طارق عبدالحميد الحمادي',
        amount: 80000,
        date: '2026-10-01',
        time: '12:20:00',
        method: 'bank_wallet',
        walletType: 'jawwali',
        walletName: 'محفظة جوالي',
        transactionNumber: 'JW-554499',
        transferNumber: 'TR-1199',
        senderName: 'طارق عبدالحميد الحمادي',
        senderPhone: '775678901',
        notes: 'دفعة أولى عند تثبيت الطلب والبدء بصف الصفحات',
        cashierId: 'u-2',
        cashierName: 'أحمد عبد الله المحمدي',
        createdAt: '2026-10-01 12:20:00'
      }
    ],
    createdAt: '2026-10-01 12:10:00',
    updatedAt: '2026-10-04 11:00:00'
  },
  {
    id: 'ord-5',
    orderNumber: 'ORD-2026-0005',
    customerId: 'c-3',
    customerName: 'إبراهيم عبدالملك السقاف',
    customerPhone: '773456789',
    customerAddress: 'صنعاء - شارع الزبيري',
    serviceType: 'thermal_print',
    serviceTitle: 'الطباعة الحرارية والهدايا',
    items: [
      {
        id: 'itm-5',
        serviceType: 'thermal_print',
        title: 'طباعة حرارية سبلميشن لأكواب سيراميك سحرية أسود مع دروع تكريم خشبية كرستال لشعار المؤسسة',
        quantity: 30,
        unitPrice: 3000,
        totalPrice: 90000,
        specifications: {
          productItem: 'أكواب سحرية تتغير بالحرارة + دروع تكريم فاخرة',
          printColor: 'طباعة حرارية فل كلر ديجيتال 4K',
          packaging: 'تغليف فردي لكل قطعة داخل علبة كرتون هدية'
        }
      }
    ],
    subtotal: 90000,
    discount: 0,
    tax: 0,
    totalAmount: 90000,
    paidAmount: 70000,
    remainingAmount: 20000,
    status: 'in_printing',
    orderDate: '2026-10-03',
    deliveryDate: '2026-10-07',
    deliveryTime: '02:00 م',
    notes: 'الاستلام من مقر الاستديو للتوزيع في الحفل السنوي للشركة',
    assignedStaffId: 'u-3',
    assignedStaffName: 'محمد نبيل الصبري',
    createdById: 'u-2',
    createdByName: 'أحمد عبد الله المحمدي',
    payments: [
      {
        id: 'pay-6',
        orderId: 'ord-5',
        orderNumber: 'ORD-2026-0005',
        customerName: 'إبراهيم عبدالملك السقاف',
        amount: 70000,
        date: '2026-10-03',
        time: '10:00:00',
        method: 'bank_wallet',
        walletType: 'one_cash',
        walletName: 'محفظة ون كاش',
        transactionNumber: 'OC-112233',
        transferNumber: 'TR-7788',
        senderName: 'مؤسسة السقاف التجارية',
        senderPhone: '773456789',
        notes: 'تحويل ون كاش دفعة أولى لتأمين مستلزمات الأكواب والدروع',
        cashierId: 'u-2',
        cashierName: 'أحمد عبد الله المحمدي',
        createdAt: '2026-10-03 10:00:00'
      }
    ],
    createdAt: '2026-10-03 09:50:00',
    updatedAt: '2026-10-03 10:00:00'
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    code: 'PRD-001',
    name: 'ورق تصوير كوداك فوتوغرافي لماع A4 (260 جرام)',
    category: 'ورق طباعة فوتوغرافي',
    unit: 'باكت (100 ورقة)',
    currentQuantity: 45,
    minQuantity: 10,
    costPrice: 6500,
    sellingPrice: 12000,
    supplierName: 'شركة العالمية للورق والأحبار',
    location: 'رف A-1 مستودع الورق',
    updatedAt: '2026-10-01'
  },
  {
    id: 'prod-2',
    code: 'PRD-002',
    name: 'رول ورق فوتوغرافي ساتان عرض 24 بوصة (طول 30 متر)',
    category: 'ورق طباعة فوتوغرافي',
    unit: 'رول',
    currentQuantity: 6,
    minQuantity: 3,
    costPrice: 38000,
    sellingPrice: 60000,
    supplierName: 'مؤسسة الأفق لمستلزمات الطباعة',
    location: 'قسم طابعات البلوتر الكبيرة',
    updatedAt: '2026-10-02'
  },
  {
    id: 'prod-3',
    code: 'PRD-003',
    name: 'طقم أحبار طابعات كانون وإبسون الاحترافية (6 ألوان أصلية)',
    category: 'أحبار تصوير وطباعة',
    unit: 'طقم',
    currentQuantity: 8,
    minQuantity: 4,
    costPrice: 42000,
    sellingPrice: 70000,
    supplierName: 'شركة العالمية للورق والأحبار',
    location: 'خزينة الأحبار المغلقة',
    updatedAt: '2026-10-03'
  },
  {
    id: 'prod-4',
    code: 'PRD-004',
    name: 'ألواح أكريليك زجاجي شفاف سماكة 3 ملم مقاس 80×120 سم',
    category: 'ألواح وإطارات لوحات العرسان',
    unit: 'لوح',
    currentQuantity: 14,
    minQuantity: 5,
    costPrice: 18000,
    sellingPrice: 35000,
    supplierName: 'مؤسسة الرواد للبلاستيك والأكريليك',
    location: 'مخزن الأخشاب والأكريليك',
    updatedAt: '2026-10-01'
  },
  {
    id: 'prod-5',
    code: 'PRD-005',
    name: 'أكواب سيراميك سحرية حرارية سبلميشن (لون أسود يتغير للحرارة)',
    category: 'هدايا وطباعة حرارية',
    unit: 'كرتون (36 كوب)',
    currentQuantity: 9,
    minQuantity: 3,
    costPrice: 22000,
    sellingPrice: 40000,
    supplierName: 'مؤسسة الأفق لمستلزمات الطباعة',
    location: 'قسم المكابس الحرارية B-3',
    updatedAt: '2026-10-04'
  },
  {
    id: 'prod-6',
    code: 'PRD-006',
    name: 'أشرطة إضاءة LED شريطية مخفية (أبيض دافئ 12V)',
    category: 'ملحقات إضاءة اللوحات',
    unit: 'لفة (5 أمتار)',
    currentQuantity: 18,
    minQuantity: 6,
    costPrice: 3500,
    sellingPrice: 7500,
    supplierName: 'مؤسسة التقنية للإلكترونيات',
    location: 'درج الملحقات الكهربائية C-1',
    updatedAt: '2026-10-02'
  },
  {
    id: 'prod-7',
    code: 'PRD-007',
    name: 'دروع تكريم خشبية فاخرة مع حواف مذهبة وقاعدة كريستال',
    category: 'هدايا وطباعة حرارية',
    unit: 'حبة',
    currentQuantity: 24,
    minQuantity: 8,
    costPrice: 4500,
    sellingPrice: 9000,
    supplierName: 'مؤسسة الأفق لمستلزمات الطباعة',
    location: 'قسم الهدايا والدروع',
    updatedAt: '2026-10-03'
  },
  {
    id: 'prod-8',
    code: 'PRD-008',
    name: 'تيشيرتات بوليستر قطن أبيض سبلميشن مقاسات مختلفة',
    category: 'هدايا وطباعة حرارية',
    unit: 'درزن (12 حبة)',
    currentQuantity: 4,
    minQuantity: 5, // Low stock trigger!
    costPrice: 14000,
    sellingPrice: 28000,
    supplierName: 'معمل النخبة للملابس والطباعة',
    location: 'مستودع المنسوجات',
    updatedAt: '2026-10-04'
  }
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    supplierNumber: 'SUP-001',
    name: 'الحاج فؤاد الشرجبي',
    companyName: 'شركة العالمية للورق والأحبار والمعدات',
    phone: '777555666',
    address: 'صنعاء - شارع تعز',
    category: 'أحبار تصوير وورق فوتوغرافي ألماني وياباني',
    totalPurchases: 650000,
    totalPaid: 550000,
    balanceDebt: 100000,
    notes: 'مورد معتمد للأحبار الأصلية لآلات كانون وإبسون',
    createdAt: '2026-01-20'
  },
  {
    id: 'sup-2',
    supplierNumber: 'SUP-002',
    name: 'م. مروان القديمي',
    companyName: 'مؤسسة الأفق لمستلزمات الطباعة الحرارية والمكابس',
    phone: '777666777',
    address: 'صنعاء - شارع القيادة',
    category: 'أكواب سبلميشن، دروع، أوراق حرارية، تيشيرتات',
    totalPurchases: 420000,
    totalPaid: 420000,
    balanceDebt: 0,
    notes: 'الدفع نقدي أو تحويل كريمي فوري بأسعار جملة الجملة',
    createdAt: '2026-02-05'
  },
  {
    id: 'sup-3',
    supplierNumber: 'SUP-003',
    name: 'المهندس جميل العبسي',
    companyName: 'مؤسسة الرواد للبلاستيك والأكريليك والأخشاب',
    phone: '777777888',
    address: 'صنعاء - الحصبة - جوار وزارة الصناعة',
    category: 'ألواح أكريليك، خشب MDF، إطارات براويز ليزر',
    totalPurchases: 380000,
    totalPaid: 300000,
    balanceDebt: 80000,
    notes: 'مورد ألواح لوحات العرسان ومقاسات الألبومات الملكية',
    createdAt: '2026-03-01'
  }
];

export const initialEmployees: Employee[] = [
  {
    id: 'emp-1',
    empNumber: 'EMP-001',
    name: 'نظام الاستديو الذكي',
    role: 'مدير تنفيذي ومشرف عام',
    phone: '777000111',
    hireDate: '2025-01-01',
    baseSalary: 250000,
    isActive: true,
    notes: 'المدير التنفيذي وصاحب الصلاحيات الكاملة للنظام'
  },
  {
    id: 'emp-2',
    empNumber: 'EMP-002',
    name: 'أحمد عبد الله المحمدي',
    role: 'كاشير ومسؤول استقبال ومبيعات',
    phone: '777111222',
    hireDate: '2025-06-01',
    baseSalary: 120000,
    isActive: true,
    notes: 'مسؤول الصندوق، إدخال العملاء واستلام الدفعات'
  },
  {
    id: 'emp-3',
    empNumber: 'EMP-003',
    name: 'محمد نبيل الصبري',
    role: 'مصمم جرافيك وفني مونتاج',
    phone: '777222333',
    hireDate: '2025-04-15',
    baseSalary: 160000,
    isActive: true,
    notes: 'مسؤول تصميم لوحات العرسان وتعديل صور الألبومات والبنرات'
  },
  {
    id: 'emp-4',
    empNumber: 'EMP-004',
    name: 'حسام ياسين المعمري',
    role: 'مصور فوتوغرافي محترف',
    phone: '777333444',
    hireDate: '2025-05-01',
    baseSalary: 150000,
    isActive: true,
    notes: 'جلسات التصوير داخل الاستديو وتصوير الأفراح والمناسبات الخارجية'
  },
  {
    id: 'emp-5',
    empNumber: 'EMP-005',
    name: 'سمير طه القدسي',
    role: 'محاسب مالي',
    phone: '777444555',
    hireDate: '2025-08-01',
    baseSalary: 140000,
    isActive: true,
    notes: 'مسؤول الحسابات والمصروفات والرواتب ومراجعة حركة الصندوق'
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    voucherNumber: 'EXP-2026-0001',
    category: 'إيجار الاستديو',
    amount: 150000,
    date: '2026-10-01',
    time: '10:00:00',
    recipient: 'مالك العقار - الحاج مهيوب',
    description: 'سداد إيجار مقر الاستديو لشهر أكتوبر 2026',
    paymentMethod: 'cash',
    recordedById: 'u-1',
    recordedByName: 'نظام الاستديو الذكي',
    createdAt: '2026-10-01 10:00:00'
  },
  {
    id: 'exp-2',
    voucherNumber: 'EXP-2026-0002',
    category: 'كهرباء ومياه وطاقة شمسية',
    amount: 35000,
    date: '2026-10-02',
    time: '11:30:00',
    recipient: 'محطة كهرباء المنطقة التجارية',
    description: 'فاتورة الكهرباء والاشتراك الشهري للطاقة بالاستديو',
    paymentMethod: 'bank_wallet',
    walletType: 'kuraimi',
    recordedById: 'u-5',
    recordedByName: 'سمير طه القدسي',
    createdAt: '2026-10-02 11:30:00'
  },
  {
    id: 'exp-3',
    voucherNumber: 'EXP-2026-0003',
    category: 'ضيافة ونظافة',
    amount: 12000,
    date: '2026-10-03',
    time: '15:10:00',
    recipient: 'سوبرماركت المدينة',
    description: 'شراء قهوة وشاي ومياه ضيافة للعملاء ومستلزمات نظافة',
    paymentMethod: 'cash',
    recordedById: 'u-2',
    recordedByName: 'أحمد عبد الله المحمدي',
    createdAt: '2026-10-03 15:10:00'
  },
  {
    id: 'exp-4',
    voucherNumber: 'EXP-2026-0004',
    category: 'صيانة دورية للمعدات',
    amount: 25000,
    date: '2026-10-04',
    time: '13:00:00',
    recipient: 'مركز الصيانة المتقدم للطابعات',
    description: 'صيانة دورية لطابعة البلوتر الكبيرة واستبدال هيد التنظيف',
    paymentMethod: 'cash',
    recordedById: 'u-1',
    recordedByName: 'نظام الاستديو الذكي',
    createdAt: '2026-10-04 13:00:00'
  }
];

export const initialSalaryAdvances: SalaryAdvance[] = [
  {
    id: 'adv-1',
    advanceNumber: 'ADV-2026-0001',
    employeeId: 'emp-3',
    employeeName: 'محمد نبيل الصبري',
    amount: 30000,
    date: '2026-10-02',
    monthTarget: '2026-10',
    isDeducted: false,
    notes: 'سلفة على راتب شهر أكتوبر لظرف عائلي طارئ',
    approvedById: 'u-1',
    approvedByName: 'نظام الاستديو الذكي',
    createdAt: '2026-10-02 12:00:00'
  },
  {
    id: 'adv-2',
    advanceNumber: 'ADV-2026-0002',
    employeeId: 'emp-4',
    employeeName: 'حسام ياسين المعمري',
    amount: 20000,
    date: '2026-10-03',
    monthTarget: '2026-10',
    isDeducted: false,
    notes: 'سلفة مواصلات وتجهيز معدات تصوير خارجي',
    approvedById: 'u-1',
    approvedByName: 'نظام الاستديو الذكي',
    createdAt: '2026-10-03 16:30:00'
  }
];

export const initialSalaryPayments: SalaryPayment[] = [
  {
    id: 'sal-1',
    paymentNumber: 'SAL-2026-09-01',
    employeeId: 'emp-2',
    employeeName: 'أحمد عبد الله المحمدي',
    monthYear: '2026-09',
    baseSalary: 120000,
    allowances: 15000,
    deductions: 0,
    advancesDeducted: 20000,
    netSalary: 115000,
    paymentDate: '2026-09-30',
    paymentMethod: 'cash',
    notes: 'راتب شهر سبتمبر 2026 بعد خصم سلفة سابقة 20,000 ريال',
    paidById: 'u-1',
    paidByName: 'نظام الاستديو الذكي',
    createdAt: '2026-09-30 18:00:00'
  }
];

export const initialPurchases: Purchase[] = [
  {
    id: 'pur-1',
    purchaseNumber: 'PUR-2026-0001',
    supplierId: 'sup-1',
    supplierName: 'الحاج فؤاد الشرجبي - شركة العالمية للورق والأحبار',
    items: [
      {
        productId: 'prod-1',
        productName: 'ورق تصوير كوداك فوتوغرافي لماع A4 (260 جرام)',
        quantity: 20,
        unitPrice: 6500,
        totalPrice: 130000
      },
      {
        productId: 'prod-3',
        productName: 'طقم أحبار طابعات كانون وإبسون الاحترافية (6 ألوان)',
        quantity: 2,
        unitPrice: 42000,
        totalPrice: 84000
      }
    ],
    totalAmount: 214000,
    paidAmount: 164000,
    remainingAmount: 50000,
    purchaseDate: '2026-09-28',
    paymentMethod: 'bank_wallet',
    invoiceReference: 'INV-ALAMIA-889',
    notes: 'توريد ورق وأحبار للموسم الشتوي ومناسبات الأعراس',
    createdById: 'u-1',
    createdByName: 'نظام الاستديو الذكي',
    createdAt: '2026-09-28 11:00:00'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    action: 'تسجيل دخول للنظام',
    module: 'المستخدمون والأمان',
    details: 'قام المستخدم admin بتسجيل الدخول بنجاح للنظام',
    userId: 'u-1',
    userName: 'نظام الاستديو الذكي',
    timestamp: '2026-10-04 18:00:00'
  },
  {
    id: 'log-2',
    action: 'تسجيل دفعة نقدية',
    module: 'الطلبات والمدفوعات',
    details: 'تسجيل دفعة بقيمة 70,000 ر.ي للطلب رقم ORD-2026-0005 عبر محفظة ون كاش',
    userId: 'u-2',
    userName: 'أحمد عبد الله المحمدي',
    timestamp: '2026-10-03 10:00:00'
  },
  {
    id: 'log-3',
    action: 'تعديل حالة طلب',
    module: 'لوحات العرسان',
    details: 'تغيير حالة الطلب ORD-2026-0001 إلى "قيد الطباعة"',
    userId: 'u-3',
    userName: 'محمد نبيل الصبري',
    timestamp: '2026-10-02 14:15:00'
  },
  {
    id: 'log-4',
    action: 'تسجيل سند صرف',
    module: 'المحاسبة والمصروفات',
    details: 'صرف مبلغ 25,000 ر.ي لصالح مركز الصيانة المتقدم للطابعات',
    userId: 'u-1',
    userName: 'نظام الاستديو الذكي',
    timestamp: '2026-10-04 13:00:00'
  }
];
