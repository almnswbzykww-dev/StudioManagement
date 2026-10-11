import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  Briefcase, 
  Boxes, 
  CircleDollarSign, 
  Settings as SettingsIcon,
  ChevronDown, 
  Camera, 
  Users, 
  Package, 
  Megaphone, 
  Palette, 
  HeartHandshake, 
  BookOpen, 
  Film, 
  Image as ImageIcon, 
  Flame, 
  Printer, 
  Truck, 
  ShoppingBag, 
  BarChart3, 
  ShieldAlert,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (pageId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  ordersCount?: number;
  customersCount?: number;
  lowStockCount?: number;
  theme?: 'dark' | 'light';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isOpen,
  onToggle,
  ordersCount = 0,
  customersCount = 0,
  lowStockCount = 0,
  theme = 'dark'
}) => {
  // Accordion state matching image.png
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    work: true,
    resources: false,
    finance: false,
    system: false
  });

  const toggleSection = (sec: string) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  return (
    <aside
      className={`fixed lg:sticky top-[57px] right-0 z-30 h-[calc(100vh-57px)] transition-all duration-300 flex flex-col select-none ${
        theme === 'dark'
          ? 'bg-[#080e1b] border-l border-slate-800 text-slate-200'
          : 'bg-white border-l border-slate-200 text-slate-800 shadow-md'
      } ${
        isOpen ? 'w-64 shadow-2xl' : 'w-20'
      }`}
    >
      {/* 1. Studio Logo & Brand (Matching image.png) */}
      <div className={`p-3.5 border-b flex items-center justify-between ${
        theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 p-2 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Camera className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xs font-black text-white tracking-wide">نظام إدارة الاستديو</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">متكامل - سهل - احترافي</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 p-2 flex items-center justify-center">
              <Camera className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        )}

        <button
          onClick={onToggle}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
          title={isOpen ? 'طي القائمة' : 'توسيع القائمة'}
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Scrollable Navigation List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1.5 custom-scrollbar text-xs">
        
        {/* Dashboard Link */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activePage === 'dashboard'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-md shadow-amber-950/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-850/80'
          } ${!isOpen ? 'justify-center' : 'justify-between'}`}
          title={!isOpen ? 'لوحة التحكم' : undefined}
        >
          <div className="flex items-center gap-3">
            <Home className="w-4 h-4 text-amber-400 shrink-0" />
            {isOpen && <span>لوحة التحكم</span>}
          </div>
          {isOpen && <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${activePage === 'dashboard' ? 'rotate-180 text-amber-400' : ''}`} />}
        </button>

        {/* Accordion Group 1: العمل والطلبات */}
        <div className="pt-1">
          <button
            onClick={() => toggleSection('work')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer ${
              !isOpen ? 'justify-center' : 'justify-between'
            }`}
            title={!isOpen ? 'العمل والطلبات' : undefined}
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
              {isOpen && <span>العمل والطلبات</span>}
            </div>
            {isOpen && (
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.work ? 'rotate-180' : ''}`} />
            )}
          </button>

          {(openSections.work || !isOpen) && (
            <div className={`${isOpen ? 'pr-3 mr-2 border-r border-slate-800/80 space-y-1 mt-1' : 'space-y-1 mt-1'}`}>
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'customers'}
                label="العملاء"
                icon={<Users className="w-4 h-4 text-blue-400" />}
                onClick={() => onNavigate('customers')}
                badge={customersCount}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'orders'}
                label="الطلبات"
                icon={<Package className="w-4 h-4 text-violet-400" />}
                onClick={() => onNavigate('orders')}
                badge={ordersCount}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'studio_photos'}
                label="الصور"
                icon={<Camera className="w-4 h-4 text-cyan-400" />}
                onClick={() => onNavigate('studio_photos')}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'advertising'}
                label="الدعاية والإعلان"
                icon={<Megaphone className="w-4 h-4 text-amber-400" />}
                onClick={() => onNavigate('advertising')}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'graphic_design'}
                label="التصميمات"
                icon={<Palette className="w-4 h-4 text-purple-400" />}
                onClick={() => onNavigate('graphic_design')}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'wedding_boards'}
                label="لوحات العرسان"
                icon={<HeartHandshake className="w-4 h-4 text-rose-400" />}
                onClick={() => onNavigate('wedding_boards')}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'wedding_sessions'}
                label="جلسات عرسان VIP"
                icon={<Sparkles className="w-4 h-4 text-pink-400" />}
                onClick={() => onNavigate('wedding_sessions')}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'photo_albums'}
                label="ألبومات الصور"
                icon={<BookOpen className="w-4 h-4 text-yellow-400" />}
                onClick={() => onNavigate('photo_albums')}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'passport_photos'}
                label="صور الجوازات"
                icon={<ShieldCheck className="w-4 h-4 text-blue-400" />}
                onClick={() => onNavigate('passport_photos')}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'photo_restoration'}
                label="ترميم الصور"
                icon={<Sparkles className="w-4 h-4 text-emerald-400" />}
                onClick={() => onNavigate('photo_restoration')}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'canvas_prints'}
                label="لوحات كانفس"
                icon={<Palette className="w-4 h-4 text-violet-400" />}
                onClick={() => onNavigate('canvas_prints')}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'video_montage'}
                label="الفيديو والمونتاج"
                icon={<Film className="w-4 h-4 text-teal-400" />}
                onClick={() => onNavigate('video_montage')}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'outdoor_photo'}
                label="التصوير الخارجي"
                icon={<ImageIcon className="w-4 h-4 text-sky-400" />}
                onClick={() => onNavigate('outdoor_photo')}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'thermal_print'}
                label="الطباعة الحرارية"
                icon={<Flame className="w-4 h-4 text-orange-400" />}
                onClick={() => onNavigate('thermal_print')}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'general_service'}
                label="طباعة عامة"
                icon={<Printer className="w-4 h-4 text-slate-400" />}
                onClick={() => onNavigate('general_service')}
              />
            </div>
          )}
        </div>

        {/* Accordion Group 2: الموارد */}
        <div className="pt-1">
          <button
            onClick={() => toggleSection('resources')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer ${
              !isOpen ? 'justify-center' : 'justify-between'
            }`}
            title={!isOpen ? 'الموارد' : undefined}
          >
            <div className="flex items-center gap-3">
              <Boxes className="w-4 h-4 text-amber-400 shrink-0" />
              {isOpen && <span>الموارد</span>}
            </div>
            {isOpen && (
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.resources ? 'rotate-180' : ''}`} />
            )}
          </button>

          {(openSections.resources || !isOpen) && (
            <div className={`${isOpen ? 'pr-3 mr-2 border-r border-slate-800/80 space-y-1 mt-1' : 'space-y-1 mt-1'}`}>
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'inventory'}
                label="المخزون"
                icon={<Boxes className="w-4 h-4 text-emerald-400" />}
                onClick={() => onNavigate('inventory')}
                badge={lowStockCount > 0 ? `${lowStockCount} ناقص` : undefined}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'suppliers'}
                label="الموردون"
                icon={<Truck className="w-4 h-4 text-sky-400" />}
                onClick={() => onNavigate('suppliers')}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'employees'}
                label="الموظفون والرواتب"
                icon={<ShoppingBag className="w-4 h-4 text-indigo-400" />}
                onClick={() => onNavigate('employees')}
              />
            </div>
          )}
        </div>

        {/* Accordion Group 3: المالية */}
        <div className="pt-1">
          <button
            onClick={() => toggleSection('finance')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer ${
              !isOpen ? 'justify-center' : 'justify-between'
            }`}
            title={!isOpen ? 'المالية' : undefined}
          >
            <div className="flex items-center gap-3">
              <CircleDollarSign className="w-4 h-4 text-amber-400 shrink-0" />
              {isOpen && <span>المالية</span>}
            </div>
            {isOpen && (
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.finance ? 'rotate-180' : ''}`} />
            )}
          </button>

          {(openSections.finance || !isOpen) && (
            <div className={`${isOpen ? 'pr-3 mr-2 border-r border-slate-800/80 space-y-1 mt-1' : 'space-y-1 mt-1'}`}>
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'accounting'}
                label="المحاسبة والخزينة"
                icon={<CircleDollarSign className="w-4 h-4 text-emerald-400" />}
                onClick={() => onNavigate('accounting')}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'reports'}
                label="التقارير الشاملة"
                icon={<BarChart3 className="w-4 h-4 text-cyan-400" />}
                onClick={() => onNavigate('reports')}
              />
            </div>
          )}
        </div>

        {/* Accordion Group 4: النظام */}
        <div className="pt-1">
          <button
            onClick={() => toggleSection('system')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer ${
              !isOpen ? 'justify-center' : 'justify-between'
            }`}
            title={!isOpen ? 'النظام' : undefined}
          >
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-4 h-4 text-amber-400 shrink-0" />
              {isOpen && <span>النظام</span>}
            </div>
            {isOpen && (
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.system ? 'rotate-180' : ''}`} />
            )}
          </button>

          {(openSections.system || !isOpen) && (
            <div className={`${isOpen ? 'pr-3 mr-2 border-r border-slate-800/80 space-y-1 mt-1' : 'space-y-1 mt-1'}`}>
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'settings'}
                label="الإعدادات العامة"
                icon={<SettingsIcon className="w-4 h-4 text-slate-400" />}
                onClick={() => onNavigate('settings')}
              />
              <SubNavItem
                isOpen={isOpen}
                active={activePage === 'audit_log'}
                label="سجل العمليات والأمان"
                icon={<ShieldAlert className="w-4 h-4 text-rose-400" />}
                onClick={() => onNavigate('audit_log')}
              />
            </div>
          )}
        </div>

      </div>

      {/* 3. Bottom Developer Credits (Exactly requested by user & matching image.png) */}
      {isOpen ? (
        <div className={`mt-auto p-4 border-t text-center ${
          theme === 'dark' ? 'border-slate-800/80 bg-slate-950/60' : 'border-slate-200 bg-amber-50/60'
        }`}>
          <div className={`text-[11px] font-semibold ${theme === 'dark' ? 'text-amber-400/90' : 'text-amber-800'}`}>
            برمجة وتطوير
          </div>
          <div className={`text-xs font-black mt-0.5 tracking-wide ${theme === 'dark' ? 'text-amber-300' : 'text-amber-900'}`}>
            المهندس زكريا فيصل العزعزي
          </div>
        </div>
      ) : (
        <div className={`mt-auto py-3 border-t flex justify-center text-xs font-bold ${
          theme === 'dark' ? 'border-slate-800/80 text-amber-400' : 'border-slate-200 text-amber-600'
        }`} title="برمجة وتطوير المهندس زكريا فيصل العزعزي">
          <Sparkles className="w-4 h-4" />
        </div>
      )}
    </aside>
  );
};

interface SubNavItemProps {
  isOpen: boolean;
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: number | string;
}

const SubNavItem: React.FC<SubNavItemProps> = ({
  isOpen,
  active,
  label,
  icon,
  onClick,
  badge
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
        active 
          ? 'bg-blue-600/20 text-blue-300 font-bold border border-blue-500/30' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
      } ${!isOpen ? 'justify-center' : 'justify-between'}`}
      title={!isOpen ? label : undefined}
    >
      <div className="flex items-center gap-2.5">
        <span className="shrink-0">{icon}</span>
        {isOpen && <span className="truncate">{label}</span>}
      </div>
      {isOpen && badge !== undefined && (
        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-800 text-slate-300">
          {badge}
        </span>
      )}
    </button>
  );
};
