import React, { useState } from 'react';
import { StudioSettings, User, UserRole } from '../../types';
import { storageService } from '../../services/storageService';
import { DEFAULT_SECTION_IMAGES } from '../../assets/sectionImagesAsset';
import { PageShell } from '../common/PageShell';
import { 
  Settings as SettingsIcon, 
  Building, 
  FileText, 
  Users, 
  ShieldCheck, 
  Save, 
  Upload, 
  DownloadCloud, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Printer,
  Trash2,
  Lock,
  Plus,
  Check,
  Shield,
  X,
  Sparkles,
  Camera,
  Info
} from 'lucide-react';

interface SettingsPageProps {
  onClose: () => void;
}

// Available predefined granular permissions list
interface PermissionItem {
  id: string;
  name: string;
  category: 'orders' | 'finance' | 'entities' | 'system';
  description: string;
}

const SYSTEM_PERMISSIONS: PermissionItem[] = [
  // Orders
  { id: 'dashboard_view', name: 'استعراض لوحة التحكم والإحصائيات', category: 'orders', description: 'الوصول للواجهة الرئيسية وتصفح المؤشرات' },
  { id: 'orders_view', name: 'استعراض وتصفح سجل الطلبات', category: 'orders', description: 'رؤية قائمة الطلبات وحالاتها' },
  { id: 'orders_create', name: 'تسجيل وإنشاء طلبات جديدة', category: 'orders', description: 'فتح طلب جديد للعملاء' },
  { id: 'orders_edit', name: 'تعديل تفاصيل الطلبات والخدمات', category: 'orders', description: 'تعديل السعر أو المواصفات' },
  { id: 'orders_delete', name: 'حذف وإلغاء الطلبات', category: 'orders', description: 'إلغاء الطلب من النظام' },
  { id: 'orders_status', name: 'تحديث حالة الطلب (قيد التنفيذ / جاهز / مسلم)', category: 'orders', description: 'تغيير مرحلة العمل' },
  { id: 'orders_discount', name: 'منح خصومات على الطلبات', category: 'orders', description: 'تطبيق تخفيض على الفاتورة' },

  // Finance & Accounting
  { id: 'accounting_view', name: 'الدخول للقسم المحاسبي العام', category: 'finance', description: 'استعراض المحاسبة والمالية' },
  { id: 'cashbox_manage', name: 'إدارة حركة الصندوق والسيولة اليومية', category: 'finance', description: 'القبض والصرف المباشر في الدرج' },
  { id: 'payments_receive', name: 'سندات القبض وتحصيل الدفعات', category: 'finance', description: 'تسجيل دفعات نقدية أو بنكية من العملاء' },
  { id: 'payments_disburse', name: 'سندات الصرف والمصروفات والرواتب', category: 'finance', description: 'إخراج مبالغ للصرف والمصاريف' },
  { id: 'expenses_manage', name: 'تسجيل وإدارة بنود المصروفات', category: 'finance', description: 'إضافة فواتير كهرباء وإيجار ومصروفات' },
  { id: 'salaries_advances', name: 'إدارة رواتب الموظفين والسلف والخصومات', category: 'finance', description: 'حسابات مستحقات الموظفين' },
  { id: 'bank_accounts', name: 'استعراض المحافظ الإلكترونية والحسابات البنكية', category: 'finance', description: 'كريمي، ون كاش، جيب، جوالي' },
  { id: 'financial_reports', name: 'استخراج التقارير المالية وكشوف الحسابات', category: 'finance', description: 'الأرباح والإيرادات والديون' },

  // Entities & Inventory
  { id: 'customers_manage', name: 'تسجيل وإدارة بيانات العملاء والمديونيات', category: 'entities', description: 'إضافة عميل ومتابعة رصيده' },
  { id: 'suppliers_purchases', name: 'إدارة الموردين وفواتير الشراء', category: 'entities', description: 'مشتريات المواد الخام' },
  { id: 'inventory_manage', name: 'المخزون والمستودع وضبط الكميات', category: 'entities', description: 'متابعة بضاعة الاستديو' },

  // System & Printing
  { id: 'invoices_print', name: 'استعراض وطباعة الفواتير وسندات الاستديو', category: 'system', description: 'طباعة حرارية أو ورقية' },
  { id: 'audit_logs_view', name: 'مراقبة سجل العمليات والأمان', category: 'system', description: 'فحص نشاط المستخدمين' },
  { id: 'settings_manage', name: 'إعدادات النظام وهوية الاستديو والنسخ الاحتياطي', category: 'system', description: 'تعديل الشعار والبيانات' }
];

export const SettingsPage: React.FC<SettingsPageProps> = ({ onClose }) => {
  const currentUser = storageService.getCurrentUser();
  const isCashier = currentUser.role === 'cashier';

  // Tabs: Cashier only sees their password tab; Admin sees all tabs
  const [activeTab, setActiveTab] = useState<'studio' | 'invoice' | 'users' | 'backup'>(
    isCashier ? 'users' : 'studio'
  );
  
  const [settings, setSettings] = useState<StudioSettings>(storageService.getSettings());
  const [users, setUsers] = useState<User[]>(storageService.getUsers());

  // Password change state (for Cashier or current user)
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Admin New user form state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newUserNumber, setNewUserNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('cashier');
  const [newPhone, setNewPhone] = useState('');
  const [newUserPermissions, setNewUserPermissions] = useState<string[]>([
    'dashboard_view', 'orders_view', 'orders_create', 'customers_manage', 'payments_receive', 'invoices_print'
  ]);

  // System Manager Name state
  const [managerName, setManagerName] = useState(() => {
    return settings.systemManagerName || storageService.getUsers().find(u => u.userNumber === 1)?.fullName || 'المهندس زكريا';
  });

  // Admin Manual Permissions Modal State
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [customPermissionInput, setCustomPermissionInput] = useState('');

  // Notification banners
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Cinema Camera Banner upload
  const handleCameraBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, cinemaCameraBanner: reader.result as string }));
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Section image upload
  const handleSectionImgUpload = (sectionKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSettings(prev => ({
          ...prev,
          sectionImages: {
            ...(prev.sectionImages || {}),
            [sectionKey]: base64
          }
        }));
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isCashier) {
      setErrorMsg('صلاحية تعديل إعدادات وهوية الاستديو مخصصة لمدير النظام فقط.');
      return;
    }
    try {
      storageService.updateSettings(settings);
      setSuccessMsg('تم حفظ كافة إعدادات الاستديو والشعار بنجاح في قاعدة البيانات!');
      setHasChanges(false);
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  // Cashier / User password change handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPass.trim()) {
      setErrorMsg('يرجى إدخال كلمة المرور الحالية.');
      return;
    }

    if (!newPass.trim() || newPass.trim().length < 3) {
      setErrorMsg('يجب أن تتكون كلمة المرور الجديدة من 3 أحرف أو أرقام على الأقل.');
      return;
    }

    if (newPass.trim() !== confirmPass.trim()) {
      setErrorMsg('كلمة المرور الجديدة وتأكيدها غير متطابقين.');
      return;
    }

    const res = storageService.changeUserPassword(currentUser.id, currentPass, newPass);
    if (res.success) {
      setSuccessMsg(res.message);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Admin: Open Manual Permissions Modal
  const handleOpenPermissionsModal = (user: User) => {
    setTargetUser(user);
    // If permissions array exists, use it; else fallback based on role
    let initialPerms: string[] = [];
    if (user.permissions && user.permissions.length > 0) {
      initialPerms = [...user.permissions];
    } else if (user.role === 'admin') {
      initialPerms = SYSTEM_PERMISSIONS.map(p => p.id);
    } else if (user.role === 'cashier') {
      initialPerms = ['dashboard_view', 'orders_view', 'orders_create', 'orders_edit', 'orders_status', 'customers_manage', 'payments_receive', 'invoices_print'];
    } else {
      initialPerms = ['dashboard_view', 'orders_view', 'orders_status'];
    }
    setSelectedPermissions(initialPerms);
    setCustomPermissionInput('');
    setShowPermissionsModal(true);
  };

  // Toggle single permission
  const handleTogglePermission = (permId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  // Add custom manual permission string
  const handleAddCustomPermission = () => {
    const trimmed = customPermissionInput.trim();
    if (!trimmed) return;
    if (!selectedPermissions.includes(trimmed)) {
      setSelectedPermissions(prev => [...prev, trimmed]);
    }
    setCustomPermissionInput('');
  };

  // Save manual permissions to user
  const handleSavePermissions = () => {
    if (!targetUser) return;
    const res = storageService.updateUserPermissions(targetUser.id, selectedPermissions);
    if (res.success) {
      setSuccessMsg(`تم حفظ وتطبيق الصلاحيات (${selectedPermissions.length} صلاحية) للمستخدم ${targetUser.fullName} يدوياً بنجاح!`);
      setShowPermissionsModal(false);
      setUsers(storageService.getUsers());
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleSaveManagerName = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      storageService.updateSystemManagerName(managerName);
      setSettings(storageService.getSettings());
      setUsers(storageService.getUsers());
      setSuccessMsg('✅ تم تحديث وحفظ اسم مدير النظام بنجاح!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ اسم مدير النظام');
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newUsername.trim()) {
      setErrorMsg('يرجى إدخال اسم المستخدم.');
      return;
    }
    if (!newPassword.trim()) {
      setErrorMsg('يرجى إدخال كلمة المرور يدويًا.');
      return;
    }
    if (newPassword !== newConfirmPassword) {
      setErrorMsg('كلمة المرور وتأكيد كلمة المرور غير متطابقين.');
      return;
    }

    const currentUsers = storageService.getUsers();
    let num = Number(newUserNumber);
    if (!num || num <= 0) {
      num = currentUsers.length > 0
        ? Math.max(...currentUsers.map(u => u.userNumber || 0)) + 1
        : 2;
    }

    if (currentUsers.some(u => u.userNumber === num)) {
      setErrorMsg(`رقم المستخدم #${num} مستخدم مسبقاً، يرجى تحديد رقم مستخدم آخر.`);
      return;
    }

    if (currentUsers.some(u => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      setErrorMsg(`اسم المستخدم "${newUsername}" مستخدم مسبقاً، يرجى اختيار اسم مستخدم آخر.`);
      return;
    }

    const roleTitles: Record<UserRole, string> = {
      admin: 'مدير النظام التنفيذي',
      cashier: 'كاشير ومبيعات',
      designer: 'مصمم جرافيك ومونتاج',
      photographer: 'مصور فوتوغرافي',
      accountant: 'محاسب مالي'
    };

    try {
      storageService.saveUser({
        username: newUsername.trim(),
        userNumber: num,
        fullName: newFullName.trim() || newUsername.trim(),
        role: newUserRole,
        roleTitle: roleTitles[newUserRole] || 'مستخدم نظام',
        phone: newPhone || '770000000',
        isActive: true,
        password: newPassword,
        permissions: newUserRole === 'admin' 
          ? SYSTEM_PERMISSIONS.map(p => p.id) 
          : newUserPermissions
      });

      setShowAddUser(false);
      setNewUsername('');
      setNewUserNumber('');
      setNewPassword('');
      setNewConfirmPassword('');
      setNewFullName('');
      setNewPhone('');
      setUsers(storageService.getUsers());
      setSuccessMsg('تم حفظ بيانات المستخدم الجديد بنجاح!');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ المستخدم');
    }
  };

  const handleToggleUser = (userId: string) => {
    storageService.toggleUserActive(userId);
    setUsers(storageService.getUsers());
  };

  // Backup & Restore
  const handleExportBackup = () => {
    const jsonStr = storageService.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StudioManagement_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSuccessMsg('تم تصدير وحفظ ملف النسخة الاحتياطية بنجاح!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('تحذير: استعادة النسخة الاحتياطية ستقوم باستبدال البيانات الحالية ببيانات الملف. هل ترغب بالاستمرار؟')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const res = storageService.restoreFromBackupJson(text);
        if (res.success) {
          setSettings(storageService.getSettings());
          setUsers(storageService.getUsers());
          setSuccessMsg(res.message);
          setTimeout(() => setSuccessMsg(''), 4000);
        } else {
          setErrorMsg(res.message);
        }
      } catch (err: any) {
        setErrorMsg('فشل قراءة ملف النسخة الاحتياطية: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleResetFactory = () => {
    if (window.confirm('تحذير شديد: هل أنت متأكد من إعادة ضبط المصنع؟ سيتم مسح التعديلات والعودة للبيانات الافتراضية.')) {
      storageService.resetToFactory();
      setSettings(storageService.getSettings());
      setUsers(storageService.getUsers());
      setSuccessMsg('تمت إعادة تعيين النظام للحالة الافتراضية.');
    }
  };

  const handleClearAllMockData = () => {
    if (window.confirm('هل أنت متأكد من تنظيف النظام ومسح جميع البيانات والطلبات الوهمية والتجريبية نهائياً؟ ستصبح قاعدة البيانات نظيفة تماماً للعمل الحقيقي.')) {
      storageService.clearAllMockData();
      setSuccessMsg('تم تنظيف النظام بنجاح! جميع الطلبات والعملاء والعمليات الوهمية تم مسحها، والنظام نظيف 100% للعمل الحقيقي.');
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  const handleExecuteResetAllData = () => {
    setIsResetting(true);
    try {
      // 1. Download automated backup
      const backupJson = storageService.getBackupJson();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `نسخة_احتياطية_قبل_تصفير_البيانات_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 2. Perform reset
      const res = storageService.resetAllEnteredData();
      setShowResetConfirmModal(false);
      setSuccessMsg('✅ ' + res.message);
      setTimeout(() => setSuccessMsg(''), 7000);
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء تصفير البيانات: ' + (err?.message || ''));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <PageShell
      title={isCashier ? "إعدادات حساب الكاشير - كلمة المرور الشخصية" : "إعدادات النظام والاستديو"}
      subtitle={
        isCashier 
          ? `تعديل وتأمين كلمة المرور الخاصة بحساب الكاشير (${currentUser.fullName}) بأمان تام`
          : "تخصيص هوية الاستديو، الشعار، الفواتير، صلاحيات المستخدمين يدوياً والنسخ الاحتياطي"
      }
      icon={<SettingsIcon className="w-5 h-5 text-amber-400" />}
      hasUnsavedChanges={hasChanges && !isCashier}
      onSave={handleSaveSettings}
      onClose={onClose}
      actions={
        !isCashier ? (
          <button
            onClick={() => handleSaveSettings()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ التعديلات</span>
          </button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        
        {/* Alerts */}
        {successMsg && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Cashier View: Only Cashier Password Modification (Requested Feature) */}
        {isCashier ? (
          <div className="space-y-6">
            
            {/* Cashier Notice Banner */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-200 text-xs">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">أهلاً بك يا كاشير ({currentUser.fullName}):</p>
                <p className="text-slate-300 leading-relaxed">
                  بصفتك كاشير ومسؤول نقطة البيع، يتيح لك هذا القسم تعديل كلمة المرور الشخصية الخاصة بحسابك فقط في أي وقت. إعدادات وهوية الاستديو والصلاحيات العامة يديرها مدير النظام حصراً.
                </p>
              </div>
            </div>

            {/* Dedicated Cashier Password Change Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-w-xl mx-auto shadow-2xl">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">تعديل كلمة مرور الكاشير</h3>
                  <p className="text-xs text-slate-400 mt-0.5">اسم المستخدم: <span className="font-mono text-amber-400 font-bold">{currentUser.username}</span></p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">كلمة المرور الحالية</label>
                  <input
                    type="password"
                    required
                    placeholder="أدخل كلمة المرور الحالية"
                    value={currentPass}
                    onChange={e => setCurrentPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    required
                    placeholder="أدخل كلمة المرور الجديدة (3 خانات فأكثر)"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">تأكيد كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    required
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-950/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>تحديث كلمة مرور الكاشير وحفظها</span>
                  </button>
                </div>
              </form>
            </div>

          </div>
        ) : (
          /* Admin View: Full Settings with Manual Permissions Management */
          <>
            {/* Tab Toggle Navigation (Admin) */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('studio')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'studio'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>بيانات الاستديو والشعار</span>
              </button>

              <button
                onClick={() => setActiveTab('invoice')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'invoice'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>إعدادات الفواتير والطباعة</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'users'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>المستخدمون والصلاحيات اليدوية ({users.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('backup')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'backup'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <DownloadCloud className="w-4 h-4" />
                <span>النسخ الاحتياطي والاستعادة</span>
              </button>
            </div>

            {/* Tab 1: Studio Info & Logo */}
            {activeTab === 'studio' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-400" />
                  <span>بيانات وهوية الاستديو الرسمية</span>
                </h3>

                {/* Logo Upload Section */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
                  <div className="text-center shrink-0">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" className="w-24 h-24 object-contain rounded-2xl border border-slate-700 p-1 bg-slate-900" />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500">
                        <Building className="w-8 h-8 mb-1" />
                        <span className="text-[10px]">لا يوجد شعار</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-right">
                    <h4 className="text-xs font-bold text-white">شعار الاستديو (Logo)</h4>
                    <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                      يتم حفظ الشعار في قاعدة البيانات محلياً ويظهر تلقائياً في شاشة الدخول، رأس لوحة التحكم، أعلى الفواتير المطبوعة، وكافة التقارير دون الحاجة لإعادة رفعه.
                    </p>
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة شعار جديدة</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Cinema Camera Banner Section (Requested Feature) */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-center gap-6">
                  <div className="text-center shrink-0">
                    <img 
                      src={settings.cinemaCameraBanner || storageService.getCinemaCameraImage()} 
                      alt="Cinema Camera" 
                      className="w-36 h-24 object-cover rounded-2xl border-2 border-amber-500/40 p-0.5 bg-slate-900 shadow-md" 
                    />
                  </div>

                  <div className="space-y-2 text-right flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">صورة الكاميرا السينمائية للبانر العلوي</h4>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                        قاعدة البيانات
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                      تظهر هذه الصورة في البانر الكبير أعلى صفحة الأقسام والطلبات، وتحفظ بشكل دائم في قاعدة بيانات النظام محلياً.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-md">
                        <Upload className="w-3.5 h-3.5" />
                        <span>تغيير صورة الكاميرا وحفظها</span>
                        <input type="file" accept="image/*" onChange={handleCameraBannerUpload} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          storageService.resetCinemaCameraBanner();
                          setSettings(prev => ({ ...prev, cinemaCameraBanner: storageService.getCinemaCameraImage() }));
                          setHasChanges(true);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
                      >
                        استعادة الافتراضية
                      </button>
                    </div>
                  </div>
                </div>

                {/* Studio Info Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">اسم الاستديو الرسمي</label>
                    <input
                      type="text"
                      value={settings.studioName}
                      onChange={e => {
                        setSettings({ ...settings, studioName: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">الشعار اللفظي (Slogan)</label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={e => {
                        setSettings({ ...settings, tagline: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">العنوان والمقر</label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={e => {
                        setSettings({ ...settings, address: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">الهاتف الأساسي</label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={e => {
                        setSettings({ ...settings, phone: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">رقم الواتساب</label>
                    <input
                      type="text"
                      value={settings.whatsapp}
                      onChange={e => {
                        setSettings({ ...settings, whatsapp: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">العملة الافتراضية</label>
                    <input
                      type="text"
                      value={settings.currency}
                      onChange={e => {
                        setSettings({ ...settings, currency: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold text-amber-400"
                    />
                  </div>
                </div>

                {/* 12 Departments Image Management Gallery (Requested Feature) */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <Camera className="w-4 h-4 text-amber-400" />
                        <span>صور الأقسام والخدمات الـ 12 المحفوظة في قاعدة البيانات</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        يمكنك تغيير أو رفع صورة مخصصة لكل قسم من الأقسام الـ 12 وحفظها بشكل دائم في قاعدة البيانات.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {[
                      { key: 'wedding_board', title: 'لوحات العرسان' },
                      { key: 'wedding_session', title: 'جلسات عرسان VIP' },
                      { key: 'studio_photos', title: 'الصور والاستديو' },
                      { key: 'photo_albums', title: 'ألبومات الصور' },
                      { key: 'advertising', title: 'الدعاية والإعلان' },
                      { key: 'graphic_design', title: 'التصميمات' },
                      { key: 'passport_photos', title: 'صور الجوازات' },
                      { key: 'photo_restoration', title: 'ترميم الصور' },
                      { key: 'canvas_prints', title: 'لوحات الكانفس' },
                      { key: 'video_montage', title: 'الفيديو والمونتاج' },
                      { key: 'outdoor_photo', title: 'التصوير الخارجي' },
                      { key: 'thermal_print', title: 'الطباعة الحرارية' }
                    ].map(dept => {
                      const img = (settings.sectionImages && settings.sectionImages[dept.key]) || storageService.getSectionImage(dept.key);
                      return (
                        <div key={dept.key} className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col items-center text-center group hover:border-amber-500/40 transition-colors">
                          <div className="w-full h-20 rounded-xl overflow-hidden mb-2 bg-slate-900 border border-slate-800 relative">
                            <img 
                              src={img || DEFAULT_SECTION_IMAGES[dept.key]} 
                              alt={dept.title} 
                              onError={(e) => {
                                const fallback = DEFAULT_SECTION_IMAGES[dept.key];
                                if (fallback && e.currentTarget.src !== fallback) {
                                  e.currentTarget.src = fallback;
                                }
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                            />
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-opacity">
                              <span>تغيير</span>
                              <input type="file" accept="image/*" onChange={(e) => handleSectionImgUpload(dept.key, e)} className="hidden" />
                            </label>
                          </div>
                          <span className="text-xs font-bold text-white truncate max-w-full">{dept.title}</span>
                          <span className="text-[10px] text-emerald-400 mt-0.5">محفوظة بالقاعدة</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Invoice Settings */}
            {activeTab === 'invoice' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>تخصيص الفواتير وسندات الاستلام</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">عنوان الفاتورة الرئيسي</label>
                    <input
                      type="text"
                      value={settings.invoiceTitle}
                      onChange={e => {
                        setSettings({ ...settings, invoiceTitle: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">العنوان الفرعي للفاتورة</label>
                    <input
                      type="text"
                      value={settings.invoiceSubtitle}
                      onChange={e => {
                        setSettings({ ...settings, invoiceSubtitle: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">ملاحظة ذيل الفاتورة</label>
                    <input
                      type="text"
                      value={settings.invoiceFooterNote}
                      onChange={e => {
                        setSettings({ ...settings, invoiceFooterNote: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">شروط وتعليمات استلام العمل</label>
                    <textarea
                      rows={4}
                      value={settings.invoiceTerms}
                      onChange={e => {
                        setSettings({ ...settings, invoiceTerms: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Users & Manual Permissions (Admin) */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                
                {/* 1. System Manager Name Modification (Requested Feature: أضف للمدير إمكانية تعديل اسم مدير النظام) */}
                <div className="bg-slate-900/80 border border-amber-500/30 rounded-3xl p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span className="text-amber-400">👑</span>
                        <span>تعديل اسم مدير النظام (User #1)</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        الاسم الظاهر لمدير النظام التنفيذي صاحب الصلاحيات الكاملة في الفواتير واللوحة والتقارير.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveManagerName} className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        required
                        value={managerName}
                        onChange={e => setManagerName(e.target.value)}
                        placeholder="أدخل الاسم الجديد لمدير النظام"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-xs sm:text-sm font-bold text-white outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 rounded-xl text-xs font-black shadow-md shadow-amber-950/40 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                    >
                      حفظ اسم مدير النظام
                    </button>
                  </form>
                </div>

                {/* Admin / Personal Password Change Section */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-amber-400" />
                        <span>تغيير كلمة المرور الشخصية للمستخدم الحالي ({currentUser.fullName})</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        يمكن لأي مستخدم (مدير، كاشير، مصمم أو مصور) تحديث كلمة المرور الخاصة بحسابه هنا.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleChangePassword} className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="password"
                      placeholder="كلمة المرور الحالية"
                      value={currentPass}
                      onChange={e => setCurrentPass(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <input
                      type="password"
                      placeholder="كلمة المرور الجديدة"
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <input
                      type="password"
                      placeholder="تأكيد كلمة المرور"
                      value={confirmPass}
                      onChange={e => setConfirmPass(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                    >
                      تأكيد وحفظ كلمة المرور
                    </button>
                  </form>
                </div>

                {/* Admin Users Table with Manual Permissions Button */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span>مستخدمو النظام وإدارة الصلاحيات يدوياً</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        يمكن للمدير إضافة مستخدمين جدد وتخصيص صلاحيات كل مستخدم (كاشير، مصور، مصمم) يدوياً وبدقة.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddUser(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة مستخدم جديد</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/60 shadow-xl">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">رقم المستخدم</th>
                          <th className="py-3 px-4">الاسم الكامل</th>
                          <th className="py-3 px-4">اسم الدخول</th>
                          <th className="py-3 px-4">الدور الوظيفي</th>
                          <th className="py-3 px-4">الصلاحيات النشطة</th>
                          <th className="py-3 px-4">الحالة</th>
                          <th className="py-3 px-4 text-center">إجراءات المدير اليدوية</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {users.map(u => {
                          const permsCount = u.permissions ? u.permissions.length : (u.role === 'admin' ? SYSTEM_PERMISSIONS.length : 6);
                          return (
                            <tr key={u.id} className="hover:bg-slate-850/50">
                              <td className="py-3 px-4 font-mono font-bold text-amber-400">#{u.userNumber}</td>
                              <td className="py-3 px-4 font-bold text-white">{u.fullName}</td>
                              <td className="py-3 px-4 font-mono text-blue-400">{u.username}</td>
                              <td className="py-3 px-4 text-slate-300">{u.roleTitle}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-[11px] font-bold text-blue-300">
                                  <Shield className="w-3 h-3 text-blue-400" />
                                  <span>{permsCount} صلاحية مفعلة</span>
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  u.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                }`}>
                                  {u.isActive ? 'نشط' : 'معطل'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {/* Button: Manager adds/edits permissions manually (Requested Feature) */}
                                  <button
                                    onClick={() => handleOpenPermissionsModal(u)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                                    title="تعديل الصلاحيات يدوياً لهذا المستخدم"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                                    <span>تعديل الصلاحيات يدوياً</span>
                                  </button>

                                  {u.id !== 'u-1' && (
                                    <button
                                      onClick={() => handleToggleUser(u.id)}
                                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[11px] transition-all cursor-pointer"
                                    >
                                      {u.isActive ? 'تعطيل' : 'تفعيل'}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* Tab 4: Backup & Restore */}
            {activeTab === 'backup' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DownloadCloud className="w-4 h-4 text-blue-400" />
                  <span>إدارة النسخ الاحتياطي واستعادة البيانات</span>
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  يوفر النظام آلية نسخ احتياطي كاملة ومستقلة تماماً تحفظ قاعدة بيانات الاستديو كاملة (العملاء، الطلبات، الفواتير، الدفعات، الحسابات، المخزون، الموظفين، سجل العمليات، والشعار والإعدادات) في ملف JSON آمن وقابل للاستعادة في أي وقت أوفلاين.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Export Backup Card */}
                  <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <DownloadCloud className="w-5 h-5" />
                      <span>تصدير نسخة احتياطية (Manual Backup)</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      تنزيل ملف النسخة الاحتياطية كاملاً على جهاز الكمبيوتر الخاص بك لحفظه على قرص خارجي أو فلاش ميموري.
                    </p>
                    <button
                      onClick={handleExportBackup}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer transition-all"
                    >
                      <DownloadCloud className="w-4 h-4" />
                      <span>تنزيل النسخة الاحتياطية الآن (.json)</span>
                    </button>
                  </div>

                  {/* Restore Backup Card */}
                  <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <Upload className="w-5 h-5" />
                      <span>استعادة نسخة احتياطية (Restore)</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      رفع ملف نسخة احتياطية سابقة لاسترجاع كافة الطلبات والعملاء والحسابات إلى النظام.
                    </p>
                    <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 cursor-pointer transition-all">
                      <Upload className="w-4 h-4" />
                      <span>اختيار ملف النسخة واستعادتها</span>
                      <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Complete Project Source Code Package */}
                <div className="p-5 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <span className="text-xl">📦</span>
                      <span>حزمة المشروع الكاملة الجاهزة للتنزيل (StudioManagement-Final.zip)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      تحتوي على كامل ملفات المصدر، المكونات، الصفحات، الخدمات، الإعدادات، وملف README والتبعيات جاهزة للتشغيل الفوري.
                    </p>
                  </div>
                  <a
                    href="/StudioManagement-Final.zip"
                    download="StudioManagement-Final.zip"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>تحميل StudioManagement-Final.zip</span>
                  </a>
                </div>

                {/* حذف جميع البيانات المدخلة سابقاً مع السجلات تلقائياً (للبدء بإدخال بيانات جديدة) */}
                <div className="p-6 bg-gradient-to-r from-rose-950/40 via-red-950/30 to-slate-900 border-2 border-rose-500/50 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xl">
                  <div className="space-y-1 text-right">
                    <h4 className="text-sm font-black text-rose-300 flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        <Trash2 className="w-4 h-4" />
                      </span>
                      <span>حذف وتصفير جميع البيانات السابقة والسجلات تلقائياً (للبدء بإدخال بيانات جديدة)</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      يقوم هذا الخيار بحذف جميع الطلبات السابقة، والعملاء، وسجلات الدفعات، والسندات، والمصروفات، والمشتريات، والديون المالية، وسجل العمليات، لتفريغ النظام بالكامل وجعله نظيفاً وجاهزاً لإدخال بيانات جديدة، مع تنزيل نسخة احتياطية آمنة تلقائياً والحفاظ التام على حساب المدير وهوية الاستديو والشعار والصور.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowResetConfirmModal(true)}
                    className="px-6 py-3.5 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-rose-950/60 transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center gap-2 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>تصفير وحذف البيانات السابقة</span>
                  </button>
                </div>

                {/* Factory Reset Safety Box */}
                <div className="p-5 bg-rose-950/20 border border-rose-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-rose-300">إعادة ضبط المصنع (Factory Reset)</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      إعادة تهيئة النظام وحذف كافة التعديلات والعودة للبيانات الأولية النظيفة.
                    </p>
                  </div>
                  <button
                    onClick={handleResetFactory}
                    className="px-4 py-2 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                  >
                    إعادة ضبط المصنع
                  </button>
                </div>

              </div>
            )}
          </>
        )}

        {/* Modal 1: Add User Modal (Requirement 3: اسم المستخدم، رقم المستخدم، كلمة المرور، تأكيد كلمة المرور، حفظ البيانات، الصلاحيات) */}
        {showAddUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-[#0b1328] border-2 border-amber-500/40 rounded-3xl shadow-2xl max-w-xl w-full p-6 text-slate-100 animate-in zoom-in-95 duration-200 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">إضافة مستخدم جديد للنظام</h3>
                    <p className="text-[11px] text-slate-400">حدد بيانات الدخول والصلاحيات المطلوبة</p>
                  </div>
                </div>
                <button onClick={() => setShowAddUser(false)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. اسم المستخدم */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">اسم المستخدم (Username) *</label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      placeholder="مثال: cashier2"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white outline-none"
                    />
                  </div>

                  {/* 2. رقم المستخدم */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">رقم المستخدم (User #) *</label>
                    <input
                      type="number"
                      min="2"
                      value={newUserNumber}
                      onChange={e => setNewUserNumber(e.target.value)}
                      placeholder={`رقم تلقائي: #${Math.max(...users.map(u => u.userNumber || 0)) + 1}`}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white font-mono outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 3. كلمة المرور */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">كلمة المرور (يدويًا) *</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white outline-none"
                    />
                  </div>

                  {/* 4. تأكيد كلمة المرور */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">تأكيد كلمة المرور *</label>
                    <input
                      type="password"
                      required
                      value={newConfirmPassword}
                      onChange={e => setNewConfirmPassword(e.target.value)}
                      placeholder="أعد إدخال كلمة المرور"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">الاسم الكامل للمستخدم</label>
                    <input
                      type="text"
                      value={newFullName}
                      onChange={e => setNewFullName(e.target.value)}
                      placeholder="مثال: أحمد عبد الله"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">الدور الوظيفي</label>
                    <select
                      value={newUserRole}
                      onChange={e => setNewUserRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white outline-none"
                    >
                      <option value="cashier">كاشير ومبيعات</option>
                      <option value="designer">مصمم جرافيك ومونتاج</option>
                      <option value="photographer">مصور فوتوغرافي</option>
                      <option value="accountant">محاسب مالي</option>
                      <option value="admin">مدير نظام كامل الصلاحيات</option>
                    </select>
                  </div>
                </div>

                {/* 5. الصلاحيات (Permissions Selection) */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-amber-400">الصلاحيات الممنوحة للمستخدم:</label>
                    <div className="flex items-center gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setNewUserPermissions(SYSTEM_PERMISSIONS.map(p => p.id))}
                        className="text-blue-400 hover:underline cursor-pointer"
                      >
                        تحديد الكل
                      </button>
                      <span className="text-slate-600">|</span>
                      <button
                        type="button"
                        onClick={() => setNewUserPermissions([])}
                        className="text-rose-400 hover:underline cursor-pointer"
                      >
                        إلغاء الكل
                      </button>
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                    {SYSTEM_PERMISSIONS.map(perm => {
                      const isChecked = newUserPermissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                            isChecked ? 'bg-amber-500/10 text-amber-200 border border-amber-500/25' : 'text-slate-400 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                if (e.target.checked) {
                                  setNewUserPermissions(prev => [...prev, perm.id]);
                                } else {
                                  setNewUserPermissions(prev => prev.filter(p => p !== perm.id));
                                }
                              }}
                              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                            />
                            <span className="font-semibold text-slate-200">{perm.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{perm.category}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 6. زر حفظ البيانات والإلغاء */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-amber-950/40 cursor-pointer active:scale-95 transition-all"
                  >
                    حفظ البيانات
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Admin Manual Permissions Management Modal (Feature Requested: المدير يضيف الصلاحيات يدوياً) */}
        {showPermissionsModal && targetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-3xl w-full p-6 text-slate-100 animate-in zoom-in-95 duration-200 my-8 max-h-[90vh] flex flex-col">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>تخصيص صلاحيات المستخدم يدوياً</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                        {targetUser.roleTitle}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      المستخدم: <span className="font-bold text-white">{targetUser.fullName}</span> (@{targetUser.username})
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowPermissionsModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions Bar */}
              <div className="py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPermissions(SYSTEM_PERMISSIONS.map(p => p.id))}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 font-bold cursor-pointer"
                  >
                    تحديد جميع الصلاحيات
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPermissions([])}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    إلغاء تحديد الكل
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPermissions([
                      'dashboard_view', 'orders_view', 'orders_create', 'orders_edit', 
                      'orders_status', 'customers_manage', 'payments_receive', 'invoices_print'
                    ])}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 font-bold cursor-pointer"
                  >
                    صلاحيات الكاشير الافتراضية
                  </button>
                </div>

                <div className="text-slate-400 font-bold">
                  المفعل: <span className="text-amber-400">{selectedPermissions.length}</span> من {SYSTEM_PERMISSIONS.length}
                </div>
              </div>

              {/* Manager Adds Custom Permission Manually Input */}
              <div className="my-3 p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-2.5">
                <div className="text-right w-full sm:w-auto shrink-0">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة صلاحية جديدة يدوياً:</span>
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="أدخل مسمى الصلاحية الجديدة (مثال: خصم إضافي، تعديل الأسعار، إلغاء السندات)"
                  value={customPermissionInput}
                  onChange={e => setCustomPermissionInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomPermission(); } }}
                  className="flex-1 w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomPermission}
                  className="w-full sm:w-auto px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all whitespace-nowrap"
                >
                  إضافة الصلاحية
                </button>
              </div>

              {/* Scrollable Permissions Checklist */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-2">
                
                {/* 1. قسم إدارة الطلبات والخدمات */}
                <div>
                  <h4 className="text-xs font-extrabold text-blue-400 mb-2 flex items-center gap-1.5">
                    <span>📋</span>
                    <span>صلاحيات إدارة الطلبات والخدمات</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {SYSTEM_PERMISSIONS.filter(p => p.category === 'orders').map(perm => (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                          selectedPermissions.includes(perm.id)
                            ? 'bg-blue-600/15 border-blue-500/40 text-white'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={() => handleTogglePermission(perm.id)}
                          className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold leading-tight">{perm.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{perm.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 2. قسم المحاسبة والمالية والصندوق */}
                <div>
                  <h4 className="text-xs font-extrabold text-emerald-400 mb-2 flex items-center gap-1.5">
                    <span>💰</span>
                    <span>صلاحيات المحاسبة والمالية والصندوق</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {SYSTEM_PERMISSIONS.filter(p => p.category === 'finance').map(perm => (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                          selectedPermissions.includes(perm.id)
                            ? 'bg-emerald-600/15 border-emerald-500/40 text-white'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={() => handleTogglePermission(perm.id)}
                          className="mt-0.5 rounded border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold leading-tight">{perm.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{perm.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 3. قسم العملاء والموردين والمخزون */}
                <div>
                  <h4 className="text-xs font-extrabold text-amber-400 mb-2 flex items-center gap-1.5">
                    <span>👥</span>
                    <span>صلاحيات العملاء والموردين والمخزون</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {SYSTEM_PERMISSIONS.filter(p => p.category === 'entities').map(perm => (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                          selectedPermissions.includes(perm.id)
                            ? 'bg-amber-600/15 border-amber-500/40 text-white'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={() => handleTogglePermission(perm.id)}
                          className="mt-0.5 rounded border-slate-700 text-amber-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold leading-tight">{perm.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{perm.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 4. قسم الفواتير والطباعة والأمان */}
                <div>
                  <h4 className="text-xs font-extrabold text-purple-400 mb-2 flex items-center gap-1.5">
                    <span>🖨️</span>
                    <span>صلاحيات الفواتير والطباعة وإعدادات النظام</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {SYSTEM_PERMISSIONS.filter(p => p.category === 'system').map(perm => (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                          selectedPermissions.includes(perm.id)
                            ? 'bg-purple-600/15 border-purple-500/40 text-white'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={() => handleTogglePermission(perm.id)}
                          className="mt-0.5 rounded border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold leading-tight">{perm.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{perm.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 5. الصلاحيات المضافة يدوياً من المدير */}
                {selectedPermissions.filter(p => !SYSTEM_PERMISSIONS.some(sp => sp.id === p)).length > 0 && (
                  <div>
                    <h4 className="text-xs font-extrabold text-cyan-400 mb-2 flex items-center gap-1.5">
                      <span>✨</span>
                      <span>صلاحيات إضافية تمت إضافتها يدوياً من قبل المدير</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPermissions.filter(p => !SYSTEM_PERMISSIONS.some(sp => sp.id === p)).map(customPerm => (
                        <div
                          key={customPerm}
                          className="flex items-center gap-2 px-3 py-1.5 bg-cyan-950 border border-cyan-500/40 rounded-xl text-xs text-cyan-300 font-bold"
                        >
                          <span>{customPerm}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedPermissions(prev => prev.filter(p => p !== customPerm))}
                            className="text-cyan-400 hover:text-white cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPermissionsModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={handleSavePermissions}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ وتطبيق الصلاحيات للمستخدم</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Modal 3: Confirmation Modal for Resetting All Entered Data & Records */}
        {showResetConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-[#0f172a] border-2 border-rose-500/60 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-slate-100 animate-in zoom-in-95 duration-200 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-rose-500/30 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-rose-200">تأكيد حذف وتصفير جميع البيانات السابقة</h3>
                    <p className="text-[11px] text-slate-400">الاستعداد لإدخال بيانات وسجلات جديدة نظيفة</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowResetConfirmModal(false)} 
                  disabled={isResetting}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-200">
                <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl space-y-2">
                  <p className="font-bold text-rose-300">
                    ⚠️ هل أنت متأكد من رغبتك في حذف وتصفير جميع البيانات السابقة؟
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    سيتم تنزيل نسخة احتياطية آمنة تلقائياً في جهازك قبل المسح، ثم تصفير الجداول التالية:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pr-1">
                    <li>جميع الطلبات السابقة وحالاتها ومواعيدها</li>
                    <li>جميع بيانات العملاء وأرقام هواتفهم</li>
                    <li>جميع سندات القبض والدفعات المالية</li>
                    <li>جميع سندات الصرف والمصروفات</li>
                    <li>سجلات المشتريات وديون وسلف الموظفين</li>
                  </ul>
                </div>

                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px] space-y-1">
                  <p className="font-bold">🛡️ البيانات التي سيتم الحفاظ عليها بأمان:</p>
                  <p>حسابات المستخدمين وكلمات المرور، إعدادات الاستديو وهوية الفواتير، صور الأقسام والشعار المعتمدة.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(false)}
                  disabled={isResetting}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition-all"
                >
                  إلغاء وتراجع
                </button>

                <button
                  type="button"
                  onClick={handleExecuteResetAllData}
                  disabled={isResetting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-950/60 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isResetting ? (
                    <span>جارٍ الحفظ والتصفير...</span>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>تأكيد التصفير وحفظ نسخة احتياطية</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </PageShell>
  );
};
