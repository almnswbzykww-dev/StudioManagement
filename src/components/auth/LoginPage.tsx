import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../../services/storageService';
import { CINEMA_BACKGROUND_IMAGE } from '../../assets/cinemaBackgroundAsset';
import { 
  Minus, 
  Square, 
  Maximize2, 
  X, 
  Eye, 
  EyeOff, 
  User as UserIcon, 
  Lock, 
  LogIn, 
  Calendar, 
  Clock, 
  Camera, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  Hash,
  Sparkles
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

interface HudNotification {
  type: 'error' | 'success' | 'warning';
  title: string;
  message: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // Get all active system users for autocomplete and suggestions
  const systemUsers = storageService.getUsers();

  // Input states (accept text or numbers freely without restrictions)
  const [userNumber, setUserNumber] = useState('1');
  const [username, setUsername] = useState(() => {
    const u1 = systemUsers.find(u => u.userNumber === 1);
    return u1 ? u1.username : 'admin';
  });
  const [password, setPassword] = useState(''); // Entered manually, never shown automatically
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // In-Viewfinder Camera HUD Notification State
  const [hudNotification, setHudNotification] = useState<HudNotification | null>(null);

  // Window Controls State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  // Helper to format real-time live clock with English numerals and Arabic day (100% steady)
  const getLiveDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateFormatted = `${year}-${month}-${day}`;

    const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayName = arabicDays[now.getDay()];

    const rawHours = now.getHours();
    const ampm = rawHours >= 12 ? 'م' : 'ص';
    const hours12 = rawHours % 12 || 12;
    const hoursPadded = String(hours12).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const digitalClock = `${hoursPadded}:${minutes}:${seconds}`;

    return {
      dateStr: dateFormatted,
      digitalClock,
      ampm,
      timeStr: `${digitalClock} ${ampm}`,
      yearStr: String(year),
      dayName
    };
  };

  // Real-Time Live Clock & Date initialized synchronously
  const [dateTimeInfo, setDateTimeInfo] = useState(getLiveDateTime);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTimeInfo(getLiveDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Show HUD Notification inside camera frame with auto-dismiss
  const showCameraHudNotification = (type: 'error' | 'success' | 'warning', title: string, message: string) => {
    setHudNotification({ type, title, message });
    setTimeout(() => {
      setHudNotification(null);
    }, 3200);
  };

  // Find user by either userNumber, username, id, or phone (flexible for text or numbers)
  const findMatchedUser = (val: string) => {
    const normalized = storageService.constructor['normalizeDigits' as keyof typeof storageService.constructor]
      ? (storageService.constructor as any).normalizeDigits(val)
      : val;
    const trimmed = normalized.trim().toLowerCase();
    if (!trimmed) return null;
    return systemUsers.find(
      u => String(u.userNumber) === trimmed || 
           (u.userNumber === 1 && (trimmed === '1001' || trimmed === '1')) ||
           (u.userNumber === 2 && (trimmed === '1002' || trimmed === '2')) ||
           String(u.userNumber).padStart(2, '0') === trimmed ||
           u.id.toLowerCase() === trimmed ||
           u.id.replace('u-', '') === trimmed ||
           u.username.toLowerCase() === trimmed ||
           u.fullName.toLowerCase().includes(trimmed)
    );
  };

  // Currently detected matched user object (for live visual feedback)
  const currentMatchedUser = findMatchedUser(userNumber) || findMatchedUser(username);

  // When User Number changes: automatically convert Arabic numbers to English digits and update the Username!
  const handleUserNumberChange = (val: string) => {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    let cleanVal = val;
    arabicDigits.forEach((d, idx) => {
      cleanVal = cleanVal.replaceAll(d, String(idx));
    });

    setUserNumber(cleanVal);
    const trimmed = cleanVal.trim();
    if (!trimmed) {
      setUsername('');
      return;
    }
    const matched = systemUsers.find(
      u => String(u.userNumber) === trimmed || 
           (u.userNumber === 1 && (trimmed === '1001' || trimmed === '1')) ||
           (u.userNumber === 2 && (trimmed === '1002' || trimmed === '2')) ||
           String(u.userNumber).padStart(2, '0') === trimmed
    );
    if (matched) {
      setUsername(matched.username);
    } else {
      setUsername('');
    }
  };

  // When Username changes: also update userNumber if a match is found
  const handleUsernameChange = (val: string) => {
    setUsername(val);

    const matched = findMatchedUser(val);
    if (matched && String(matched.userNumber) !== userNumber) {
      setUserNumber(String(matched.userNumber));
    }
  };

  // Window Controls Handlers
  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleRestoreFromMinimize = () => {
    setIsMinimized(false);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleClose = () => {
    setShowCloseDialog(true);
  };

  const handleConfirmClose = () => {
    setShowCloseDialog(false);
    showCameraHudNotification('warning', 'تم إغلاق الجلسة', 'تم إيقاف تشغيل واجهة الاستديو.');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // Form Submit Execution: accepts either userNumber or username smoothly
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine target username (from username field, or derived from userNumber)
    let targetIdentifier = username.trim();
    if (!targetIdentifier && userNumber.trim()) {
      targetIdentifier = userNumber.trim();
    }

    if (!targetIdentifier) {
      showCameraHudNotification('warning', 'تنبيه الكاميرا', 'يرجى إدخال اسم المستخدم أو رقم المستخدم');
      return;
    }

    if (!password.trim()) {
      showCameraHudNotification('warning', 'تنبيه الكاميرا', 'يرجى كتابة كلمة المرور للمتابعة');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Authenticate via storageService (handles username, userNumber, or ID)
      const res = storageService.login(targetIdentifier, password);
      setIsLoading(false);

      if (res.success) {
        showCameraHudNotification('success', 'تم اعتماد الدخول', 'مرحباً بك! جاري فتح نظام إدارة الاستديو...');
        setTimeout(() => {
          onLoginSuccess();
        }, 800);
      } else {
        showCameraHudNotification('error', 'خطأ في المصادقة', res.message || 'بيانات الدخول غير صحيحة، يرجى إعادة المحاولة');
      }
    }, 300);
  };

  // Cinema Background from database / Base64 (100% Offline and persistently stored in DB)
  const cinemaBg = storageService.getCinemaBackgroundImage() || CINEMA_BACKGROUND_IMAGE;

  return (
    <div 
      className="min-h-screen w-screen relative overflow-hidden select-none flex flex-col justify-between font-sans"
      dir="rtl"
      style={{
        backgroundImage: `url(${cinemaBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* 1. Professional Cinema Studio Lighting & Crystal Clear Camera Atmosphere */}
      {/* Semi-transparent filmic studio lighting vignette that lets the cinema camera gear and background shine through */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-slate-950/20 to-black/65 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(4,8,18,0.55)_100%)] pointer-events-none z-0" />
      {/* Ambient warm golden glow highlighting the center viewfinder */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] bg-amber-500/15 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* 2. Top Window Controls Bar (Pure Clean Titlebar) */}
      <header className="relative z-30 w-full h-11 flex items-center justify-between px-4 bg-slate-950/50 backdrop-blur-md border-b border-slate-800/40">
        
        {/* Right side: Studio Title & Camera Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-xs">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-200 tracking-wide">
            استديو الفن 3 - نظام إدارة الاستديو والإنتاج
          </span>
          <span className="hidden sm:inline-block text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
            أوفلاين دائم 100%
          </span>
        </div>

        {/* Left side: Window Controls (Minimize, Maximize/Restore, Close Only) */}
        <div className="flex items-center gap-1" dir="ltr">
          
          {/* 1. Minimize Button (-) */}
          <button
            type="button"
            onClick={handleMinimize}
            className="w-10 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
            title="تصغير النافذة (-)"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* 2. Maximize / Restore Button (□) */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="w-10 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
            title={isFullscreen ? 'استعادة الحجم (❐)' : 'تكبير الشاشة بالكامل (□)'}
          >
            {isFullscreen ? <Maximize2 className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
          </button>

          {/* 3. Close Button (X) */}
          <button
            type="button"
            onClick={handleClose}
            className="w-10 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-rose-600 rounded-md transition-colors cursor-pointer"
            title="إغلاق البرنامج (X)"
          >
            <X className="w-4 h-4" />
          </button>

        </div>
      </header>

      {/* If Minimized: Show Minimized Taskbar Dock */}
      {isMinimized && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
          <button
            onClick={handleRestoreFromMinimize}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/95 border border-amber-500/50 shadow-2xl text-amber-300 text-xs sm:text-sm font-bold hover:scale-105 transition-all cursor-pointer backdrop-blur-md"
          >
            <Camera className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>استديو الفن 3 (انقر لاستعادة النافذة)</span>
            <Square className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      )}

      {/* 3. Center Screen: Enlarged & Grand Viewfinder Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-5 md:p-6 my-auto">
        
        {/* The Camera Viewfinder Container (Enlarged and Spacious as Requested) */}
        <div 
          className="relative w-full max-w-[580px] sm:max-w-[620px] md:max-w-[660px] rounded-[40px] p-6 sm:p-9 md:p-11 transition-all duration-300 shadow-[0_0_90px_rgba(245,158,11,0.32),0_30px_70px_rgba(0,0,0,0.92)] border-[2.5px] border-amber-400/60 backdrop-blur-2xl"
          style={{
            backgroundColor: 'rgba(8, 15, 30, 0.93)'
          }}
        >
          {/* Top Centered Glowing Neon Line (Viewfinder Center Tick) */}
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-[3.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full shadow-[0_0_18px_#f59e0b]" />
          
          {/* Bottom Centered Glowing Neon Line */}
          <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-48 h-[2.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full" />

          {/* 4 Golden Viewfinder L-Bracket Corners */}
          <div className="absolute top-4 right-4 w-11 sm:w-12 h-11 sm:h-12 border-t-[3px] border-r-[3px] border-amber-400 rounded-tr-2xl pointer-events-none shadow-[0_0_14px_rgba(245,158,11,0.65)]" />
          <div className="absolute top-4 left-4 w-11 sm:w-12 h-11 sm:h-12 border-t-[3px] border-l-[3px] border-amber-400 rounded-tl-2xl pointer-events-none shadow-[0_0_14px_rgba(245,158,11,0.65)]" />
          <div className="absolute bottom-4 right-4 w-11 sm:w-12 h-11 sm:h-12 border-b-[3px] border-r-[3px] border-amber-400 rounded-br-2xl pointer-events-none shadow-[0_0_14px_rgba(245,158,11,0.65)]" />
          <div className="absolute bottom-4 left-4 w-11 sm:w-12 h-11 sm:h-12 border-b-[3px] border-l-[3px] border-amber-400 rounded-bl-2xl pointer-events-none shadow-[0_0_14px_rgba(245,158,11,0.65)]" />

          {/* Viewfinder Content */}
          <div className="flex flex-col items-center text-center">
            
            {/* 1. ENLARGED GOLDEN CAMERA & CROWN EMBLEM FRAME (Above "استديو الفن 3" - كبره شوي ومميز كما طلب المستخدم) */}
            <div className="relative mb-3 flex flex-col items-center">
              
              {/* Ambient Golden Halo Glow behind Logo Frame */}
              <div className="absolute -top-6 w-52 h-52 bg-amber-500/25 rounded-full blur-2xl pointer-events-none" />

              {/* Distinctive Enlarged Golden Frame Box surrounding the Camera Emblem */}
              <div className="relative w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-[32px] p-3 border-[2.5px] border-amber-400/85 bg-gradient-to-b from-amber-500/20 via-[#07132a]/85 to-[#040816]/95 shadow-[0_0_35px_rgba(245,158,11,0.45),inset_0_0_20px_rgba(245,158,11,0.2)] flex flex-col items-center justify-center transition-transform duration-500 hover:scale-105 z-10">
                
                {/* 4 Inner Golden Bracket Corner Accents on the Emblem Frame */}
                <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400/90 rounded-tr-md" />
                <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400/90 rounded-tl-md" />
                <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400/90 rounded-br-md" />
                <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400/90 rounded-bl-md" />

                {/* Enlarged Royal Golden Crown on top of camera */}
                <div className="mb-1 filter drop-shadow-[0_4px_14px_rgba(245,158,11,0.8)] animate-pulse z-20">
                  <svg width="70" height="32" viewBox="0 0 42 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M3 18L7 6L14 12L21 2L28 12L35 6L39 18H3Z" 
                      fill="url(#crownGoldGrandGradient)" 
                      stroke="#D97706" 
                      strokeWidth="1.3"
                    />
                    <circle cx="21" cy="2" r="2.5" fill="#FEF08A" />
                    <circle cx="7" cy="6" r="2" fill="#FEF08A" />
                    <circle cx="35" cy="6" r="2" fill="#FEF08A" />
                    <circle cx="14" cy="12" r="1.5" fill="#FDE68A" />
                    <circle cx="28" cy="12" r="1.5" fill="#FDE68A" />
                    <defs>
                      <linearGradient id="crownGoldGrandGradient" x1="21" y1="2" x2="21" y2="18" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FEF08A" />
                        <stop offset="0.4" stopColor="#F59E0B" />
                        <stop offset="0.8" stopColor="#D97706" />
                        <stop offset="1" stopColor="#92400E" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Significantly Enlarged Luxury Golden Camera Lens Body */}
                <div className="relative w-28 h-28 sm:w-30 sm:h-30 md:w-34 md:h-34 rounded-full flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.5)] z-10">
                  
                  {/* Outermost Golden Stepped Rim */}
                  <div className="absolute inset-0 rounded-full border-[2.5px] border-amber-400 bg-gradient-to-b from-amber-400/35 via-amber-600/15 to-amber-950/45 shadow-inner" />
                  
                  {/* Secondary Bezel with Optical Markings */}
                  <div className="absolute inset-2 rounded-full border border-amber-500/60" />
                  <div className="absolute inset-3.5 rounded-full border-[2.5px] border-amber-400/90 bg-gradient-to-br from-[#0c1a38] via-[#091122] to-[#040813] flex items-center justify-center shadow-2xl">
                    
                    {/* Concentric Aperture Rings */}
                    <div className="absolute inset-1.5 rounded-full border border-amber-500/30" />
                    
                    {/* Deep Camera Optical Glass Element with Cyan & Blue Reflex */}
                    <div className="w-13 h-13 sm:w-15 sm:h-15 md:w-17 md:h-17 rounded-full bg-gradient-to-tr from-blue-900 via-indigo-950 to-slate-900 border-2 border-blue-400/40 flex items-center justify-center relative overflow-hidden shadow-inner">
                      {/* Glossy Curved Glass Reflection */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-300/40 rounded-full blur-[2px]" />
                      <div className="absolute bottom-1 left-2 w-5 h-5 bg-amber-400/25 rounded-full blur-[1px]" />
                      
                      {/* Inner Lens Core */}
                      <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-slate-950 border border-amber-400/80 shadow-md" />
                    </div>
                  </div>

                  {/* Left/Right Camera Flash & Mount Accents */}
                  <div className="absolute -top-1.5 right-3 w-4 h-2.5 bg-amber-400 rounded-sm shadow-sm" />
                  <div className="absolute -top-1.5 left-3 w-4.5 h-3 bg-amber-500 rounded-sm shadow-sm" />
                </div>

              </div>
            </div>

            {/* 2. Studio Title: استديو الفن 3 with Golden Horizontal Accent Lines */}
            <div className="w-full flex items-center justify-center gap-3.5 mb-1">
              <div className="h-[2px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-amber-400 rounded-full" />
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide drop-shadow-[0_2px_16px_rgba(245,158,11,0.55)]">
                استديو الفن 3
              </h1>
              <div className="h-[2px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-amber-400 rounded-full" />
            </div>

            {/* 3. Subtitle: لتصوير والفيديو والإعلانات */}
            <p className="text-xs sm:text-sm text-amber-400 font-semibold mb-3 tracking-wide">
              لتصوير والفيديو والإعلانات
            </p>

            {/* 4. Live Date + Time + Year Row - 100% Solid & Jitter-Free */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs text-slate-300 font-medium mb-4 select-none">
              {/* Day Badge */}
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-400 font-bold shrink-0">
                {dateTimeInfo.dayName}
              </span>

              {/* Date Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 shrink-0" dir="ltr">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-mono font-bold tracking-wide tabular-nums">{dateTimeInfo.dateStr}</span>
              </div>

              {/* Live Digital Clock Badge - Fixed width, no jitter */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-amber-500/35 text-amber-300 shadow-inner shrink-0" dir="ltr">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono font-black tracking-widest tabular-nums text-xs sm:text-sm w-[72px] text-center inline-block">
                  {dateTimeInfo.digitalClock}
                </span>
                <span className="text-[10px] font-bold text-amber-400 px-1 py-0.5 rounded bg-amber-500/20">
                  {dateTimeInfo.ampm}
                </span>
              </div>
            </div>

            {/* 5. The 3 Login Input Fields (Accept Text & Numbers Naturally without Glitches) */}
            <form onSubmit={handleSubmit} className="w-full space-y-3.5">
              
              {/* Field 1: User Number (رقم المستخدم) */}
              <div className="relative group text-right">
                <div className="flex items-center justify-between px-1 mb-1 text-[11px] font-bold text-slate-300">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Hash className="w-3.5 h-3.5" />
                    <span>رقم المستخدم:</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    أدخل رقم حسابك للدخول
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={userNumber}
                    onChange={e => handleUserNumberChange(e.target.value)}
                    placeholder="أدخل رقم المستخدم (مثال: 1 أو 2...)"
                    className="w-full h-12 sm:h-13 pr-4 pl-12 bg-[#0b162c]/75 hover:bg-[#0d1b36]/90 focus:bg-[#0d1b36] border border-slate-700/80 focus:border-amber-400 rounded-2xl text-sm sm:text-base text-white placeholder-slate-400 text-right transition-all outline-none focus:ring-2 focus:ring-amber-400/40 shadow-inner font-mono font-bold"
                  />
                  
                  {/* User Icon on the Left */}
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center text-slate-400 group-focus-within:text-amber-400 transition-colors pointer-events-none">
                    <UserIcon className="w-4.5 h-4.5" />
                  </div>
                </div>
              </div>

              {/* Field 2: Username (اسم المستخدم - Automatically updated on selecting/typing userNumber) */}
              <div className="relative group text-right">
                <div className="flex items-center justify-between px-1 mb-1 text-[11px] font-bold text-slate-300">
                  <span className="flex items-center gap-1 text-slate-300">
                    <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>اسم المستخدم (يظهر تلقائياً عند إدخال الرقم):</span>
                  </span>
                  {currentMatchedUser && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{currentMatchedUser.fullName}</span>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => handleUsernameChange(e.target.value)}
                    placeholder="اسم المستخدم"
                    className="w-full h-12 sm:h-13 pr-4 pl-12 bg-[#0b162c]/75 hover:bg-[#0d1b36]/90 focus:bg-[#0d1b36] border border-slate-700/80 focus:border-amber-400 rounded-2xl text-sm sm:text-base text-white placeholder-slate-400 text-right transition-all outline-none focus:ring-2 focus:ring-amber-400/40 shadow-inner"
                  />
                  {/* Lock/User Icon on the Left */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-400 transition-colors pointer-events-none">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                </div>
              </div>

              {/* Field 3: Password (كلمة المرور) with Eye Visibility Toggle */}
              <div className="relative group text-right">
                <div className="px-1 mb-1 text-[11px] font-bold text-slate-300">
                  <span>كلمة المرور:</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="كلمة المرور"
                    className="w-full h-12 sm:h-13 pr-4 pl-12 bg-[#0b162c]/75 hover:bg-[#0d1b36]/90 focus:bg-[#0d1b36] border border-slate-700/80 focus:border-amber-400 rounded-2xl text-sm sm:text-base text-white placeholder-slate-400 text-right transition-all outline-none focus:ring-2 focus:ring-amber-400/40 shadow-inner"
                  />
                  {/* Eye Icon Button for toggling password visibility on the Left */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5 text-amber-400" />}
                  </button>
                </div>
              </div>

              {/* 6. Big Golden Luxury Login Button (تسجيل الدخول ⮑) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-13 sm:h-14 rounded-2xl bg-gradient-to-r from-[#e5a035] via-[#d48b28] to-[#ba721b] hover:from-[#f3b246] hover:to-[#c87e20] text-slate-950 font-black text-base sm:text-lg shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>جاري التحقق والاعتماد...</span>
                    </div>
                  ) : (
                    <>
                      <span>تسجيل الدخول</span>
                      <LogIn className="w-5 h-5 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* 7. Bottom Tagline: بإبداعنا .. نصنع أجمل اللحظات */}
            <div className="w-full flex items-center justify-center gap-2 mt-5 text-xs text-slate-400 font-medium">
              <span className="text-amber-500/60">──</span>
              <span>بإبداعنا .. نصنع أجمل اللحظات</span>
              <span className="text-amber-500/60">──</span>
            </div>

          </div>

          {/* 8. IN-VIEWFINDER CAMERA HUD NOTIFICATION SYSTEM */}
          {hudNotification && (
            <div className="absolute inset-6 z-40 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-250 pointer-events-none">
              <div 
                className={`max-w-sm w-full p-6 rounded-3xl border-2 shadow-2xl backdrop-blur-2xl flex flex-col items-center text-center pointer-events-auto ${
                  hudNotification.type === 'success'
                    ? 'bg-emerald-950/95 border-emerald-500 text-white shadow-emerald-900/60'
                    : hudNotification.type === 'error'
                    ? 'bg-rose-950/95 border-rose-500 text-white shadow-rose-900/60'
                    : 'bg-amber-950/95 border-amber-500 text-white shadow-amber-900/60'
                }`}
              >
                {/* Camera HUD Indicator Symbol */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-inner bg-slate-950/70 border border-white/20">
                  {hudNotification.type === 'success' ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  ) : hudNotification.type === 'error' ? (
                    <AlertCircle className="w-7 h-7 text-rose-400" />
                  ) : (
                    <Camera className="w-7 h-7 text-amber-400" />
                  )}
                </div>

                <div className="text-xs font-mono font-bold tracking-wider text-amber-300 uppercase mb-1">
                  [{hudNotification.title}]
                </div>

                <p className="text-sm font-bold leading-relaxed text-slate-100">
                  {hudNotification.message}
                </p>

                <div className="mt-3.5 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>تنبيه نظام الاستديو</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* 4. Ultra-Clean Footer (Clean Studio info, completely removed any C# mark or subtext) */}
      <footer className="relative z-20 py-2.5 px-6 text-center text-xs text-slate-400 bg-slate-950/45 backdrop-blur-sm border-t border-slate-800/40 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
          <span>نظام استديو الفن 3</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-bold">
          <span>برمجة وتطوير:</span>
          <span className="text-amber-300 font-black">المهندس زكريا فيصل العزعزي</span>
        </div>
      </footer>

      {/* Close Window Confirmation Dialog */}
      {showCloseDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <X className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">إغلاق نظام إدارة الاستديو؟</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في إغلاق نافذة البرنامج وإنهاء جلسة العمل الحالية؟
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCloseDialog(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmClose}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-rose-900/40"
              >
                إغلاق البرنامج
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
