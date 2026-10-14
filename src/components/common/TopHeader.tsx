import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { User, StudioSettings } from '../../types';
import { 
  Camera, 
  Clock, 
  Calendar, 
  ChevronDown, 
  ShieldCheck,
  Bell,
  Sun,
  Moon,
  Minus,
  Square,
  Maximize2,
  X,
  Check,
  LogOut,
  AlertTriangle
} from 'lucide-react';

interface TopHeaderProps {
  onNavigate: (pageId: string) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onLogout?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onNavigate,
  theme = 'dark',
  onToggleTheme,
  onLogout
}) => {
  const [currentUser, setCurrentUser] = useState<User>(storageService.getCurrentUser());
  const [settings, setSettings] = useState<StudioSettings>(storageService.getSettings());
  const [usersList, setUsersList] = useState<User[]>(storageService.getUsers());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Date & Time in English with Arabic Day name
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDayArabic, setCurrentDayArabic] = useState<string>('');
  const [currentDateEnglish, setCurrentDateEnglish] = useState<string>('');
  const [currentYear, setCurrentYear] = useState<string>('');

  // Window Controls State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Arabic day name
      const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const dayArabic = arabicDays[now.getDay()];

      // English numerals date and year
      const pad = (n: number) => String(n).padStart(2, '0');
      const year = String(now.getFullYear());
      const month = pad(now.getMonth() + 1);
      const day = pad(now.getDate());
      const dateStr = `${year}-${month}-${day}`;

      // English 12-hour time with AM/PM
      let hours = now.getHours();
      const minutes = pad(now.getMinutes());
      const seconds = pad(now.getSeconds());
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const timeStr = `${pad(hours)}:${minutes}:${seconds} ${ampm}`;

      setCurrentTime(timeStr);
      setCurrentDayArabic(dayArabic);
      setCurrentDateEnglish(dateStr);
      setCurrentYear(year);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setCurrentUser(storageService.getCurrentUser());
      setSettings(storageService.getSettings());
      setUsersList(storageService.getUsers());
    });
    return unsubscribe;
  }, []);


  // Window Controls Handlers
  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleRestoreFromMinimize = () => {
    setIsMinimized(false);
  };

  const handleToggleMaximize = () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen(prev => !prev);
    }
  };

  const handleClose = () => {
    setShowCloseModal(true);
  };

  const handleConfirmClose = () => {
    setShowCloseModal(false);
    if (onLogout) {
      onLogout();
    } else {
      storageService.logout();
      window.location.reload();
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-md select-none transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-[#090f1e]/95 border-slate-800 text-slate-100'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center justify-between px-3 sm:px-6 py-2">
          
          {/* Right (RTL): Studio Branding & Name */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate('dashboard')} 
              className="flex items-center gap-2.5 text-right hover:opacity-95 transition-opacity cursor-pointer group"
            >
              {settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt="Logo" 
                  className="w-9 h-9 object-contain rounded-xl border border-slate-700 bg-slate-950 p-0.5" 
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 p-1.5 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5 text-amber-400" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black tracking-wide ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {settings.studioName || 'نظام إدارة الاستديو'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 font-bold font-mono">
                    PRO
                  </span>
                </div>
                <p className={`text-[10px] truncate max-w-[160px] sm:max-w-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {settings.tagline || 'نظام إدارة استديو التصوير والطباعة الذكي'}
                </p>
              </div>
            </button>
          </div>

          {/* Center: Live Date & Time Bar (Arabic Day + English Date, Year & Time) */}
          <div className={`hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-2xl border ${
            theme === 'dark' ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-100 border-slate-200 shadow-inner'
          }`}>
            {/* Arabic Day Badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <span>اليوم:</span>
              <span className="text-white font-black">{currentDayArabic || 'الأربعاء'}</span>
            </div>

            <div className={`h-3.5 w-px ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-300'}`} />

            {/* English Date & Year (YYYY-MM-DD) */}
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300" dir="ltr">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-white tracking-wide">{currentDateEnglish}</span>
              <span className="text-amber-400/80 text-[11px] font-bold">({currentYear})</span>
            </div>

            <div className={`h-3.5 w-px ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-300'}`} />

            {/* Live English Clock */}
            <div className="flex items-center gap-1.5 text-xs font-mono font-black tracking-wider text-amber-400" dir="ltr">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{currentTime}</span>
            </div>
          </div>

          {/* Left: Backup, Theme Mode, User Profile, and Working Window Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            

            {/* Theme Toggle (Dark / Light) */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-all cursor-pointer shadow-sm"
                title={theme === 'dark' ? 'تبديل إلى المظهر الفاتح' : 'تبديل إلى المظهر الداكن'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => onNavigate('orders')}
                className="p-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer relative"
                title="التنبيهات والإشعارات"
              >
                <Bell className="w-4 h-4 text-slate-300" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-slate-950 animate-pulse">
                  3
                </span>
              </button>
            </div>

            {/* User Profile Card */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl text-right transition-all cursor-pointer shadow-xs border ${
                  theme === 'dark' 
                    ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
                  👤
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold block leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {currentUser.fullName}
                  </span>
                  <span className="text-[10px] text-amber-500 block leading-tight font-medium">
                    {currentUser.role === 'admin' ? 'مدير النظام' : currentUser.roleTitle}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
              </button>

              {/* User Account Menu (No account switching allowed - Single User Session) */}
              {isUserMenuOpen && (
                <div className={`absolute left-0 mt-2 w-64 rounded-2xl shadow-2xl p-2.5 z-50 border animate-in fade-in zoom-in-95 duration-150 ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className={`p-3 border-b mb-2 rounded-xl bg-slate-950/60 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                    <p className="text-[10px] text-slate-400">الحساب المسجل حالياً:</p>
                    <p className={`text-sm font-black mt-0.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {currentUser.fullName}
                    </p>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800/60 text-[11px]">
                      <span className="text-amber-400 font-bold font-mono">#{currentUser.userNumber}</span>
                      <span className="text-slate-300 font-medium">@{currentUser.username}</span>
                      <span className="text-emerald-400 font-medium">{currentUser.roleTitle}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('settings');
                      }}
                      className="w-full flex items-center gap-2 p-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span>إعدادات الحساب وكلمة المرور</span>
                    </button>

                    {onLogout && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 p-2.5 text-xs text-rose-400 hover:text-white hover:bg-rose-600 rounded-xl transition-all cursor-pointer font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج من الحساب</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Active Desktop Windows Control Buttons: Minimize, Maximize, and Close */}
            <div className="flex items-center gap-1 mr-1 pl-2 border-r border-slate-800 text-slate-400" dir="ltr">
              {/* 1. Minimize (-) */}
              <button 
                type="button"
                onClick={handleMinimize}
                className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="تصغير النافذة (-)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              {/* 2. Maximize / Restore (□) */}
              <button 
                type="button"
                onClick={handleToggleMaximize}
                className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer"
                title={isFullscreen ? 'استعادة حجم النافذة (❐)' : 'تكبير الشاشة بالكامل (□)'}
              >
                {isFullscreen ? <Maximize2 className="w-3.5 h-3.5 text-amber-400" /> : <Square className="w-3.5 h-3.5" />}
              </button>

              {/* 3. Close (X) */}
              <button 
                type="button"
                onClick={handleClose}
                className="p-1.5 hover:bg-rose-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="إغلاق النظام وتسجيل الخروج (X)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Minimized Dock Bar (Appears when user clicks Minimize) */}
      {isMinimized && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
          <button
            onClick={handleRestoreFromMinimize}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/95 border border-amber-500/60 shadow-2xl text-amber-300 text-xs sm:text-sm font-bold hover:scale-105 transition-all cursor-pointer backdrop-blur-md"
            title="انقر لاستعادة النافذة"
          >
            <Camera className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{settings.studioName || 'استديو الفن 3'} (انقر هنا لاستعادة النافذة)</span>
            <Square className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>
      )}

      {/* Close Confirmation Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b1326] border border-amber-500/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
              <AlertTriangle className="w-7 h-7 text-rose-400" />
            </div>

            <h3 className="text-lg font-black text-white">إغلاق النظام وتأكيد الخروج</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في إغلاق برنامج الاستديو والعودة إلى شاشة تسجيل الدخول؟
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                إلغاء الأمر
              </button>
              <button
                type="button"
                onClick={handleConfirmClose}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-950/50 transition-colors cursor-pointer flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>نعم، إغلاق وخروج</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
