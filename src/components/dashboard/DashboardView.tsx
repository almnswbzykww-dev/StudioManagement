import React, { useState, useRef, useEffect } from 'react';
import { ServiceType, Order } from '../../types';
import { storageService } from '../../services/storageService';
import { CINEMA_CAMERA_IMAGE } from '../../assets/cinemaCameraAsset';
import { CINEMA_BANNER_IMAGE, DEFAULT_SECTION_IMAGES } from '../../assets/sectionImagesAsset';
import { 
  Palette, 
  Camera, 
  Megaphone, 
  PenTool, 
  BookOpen, 
  Clapperboard, 
  Image as ImageIcon, 
  Flame, 
  CornerDownLeft,
  Sparkles,
  ShieldCheck,
  Upload,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (pageId: string) => void;
  onOpenOrder: (order: Order) => void;
  onOpenNewOrderWithService?: (serviceType: ServiceType) => void;
  onOpenPaymentModal: (order: Order) => void;
  onOpenInvoiceModal: (order: Order) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewOrderWithService,
  theme = 'dark'
}) => {
  const [cameraImage, setCameraImage] = useState<string>(() => storageService.getCinemaCameraImage());
  const [sectionImages, setSectionImages] = useState<Record<string, string>>(() => {
    return storageService.getSettings().sectionImages || {};
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const cameraFileInputRef = useRef<HTMLInputElement>(null);
  const sectionFileInputRef = useRef<HTMLInputElement>(null);
  const [currentEditingService, setCurrentEditingService] = useState<ServiceType | null>(null);

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setCameraImage(storageService.getCinemaCameraImage());
      setSectionImages(storageService.getSettings().sectionImages || {});
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handle changing the Cinema Camera banner image & save to database
  const handleCameraImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      storageService.updateCinemaCameraBanner(base64);
      setCameraImage(base64);
      showToast('✅ تم حفظ صورة الكاميرا السينمائية في قاعدة البيانات بنجاح!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetCameraImage = () => {
    storageService.resetCinemaCameraBanner();
    setCameraImage(storageService.getCinemaCameraImage());
    showToast('🔄 تم استعادة صورة الكاميرا السينمائية الافتراضية');
  };

  // Handle changing an individual department's image & save to database
  const handleTriggerSectionImageUpload = (serviceType: ServiceType, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentEditingService(serviceType);
    if (sectionFileInputRef.current) {
      sectionFileInputRef.current.click();
    }
  };

  const handleSectionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentEditingService) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      storageService.updateSectionImage(currentEditingService, base64);
      setSectionImages(prev => ({ ...prev, [currentEditingService]: base64 }));
      showToast(`✅ تم حفظ صورة القسم في قاعدة البيانات بنجاح!`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 12 Departments arranged in 3-column layout (4 rows x 3 columns)
  const serviceCards = [
    // الصف الأول (Row 1)
    {
      id: 'wedding_boards',
      serviceType: 'wedding_board' as ServiceType,
      title: 'لوحات العرسان',
      subtitle: 'طباعة لوحات الزفاف والمناسبات الملكية الفاخرة',
      icon: <Palette className="w-8 h-8 text-rose-300" />,
      circleBg: 'bg-rose-950/70 border border-rose-500/40 text-rose-300 shadow-inner',
      borderColor: 'border-rose-500/40 hover:border-rose-400',
      topLineGradient: 'from-rose-500 via-pink-500 to-rose-400',
      glowShadow: 'hover:shadow-rose-950/50',
      buttonBg: 'bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white'
    },
    {
      id: 'wedding_sessions',
      serviceType: 'wedding_session' as ServiceType,
      title: 'جلسات تصوير عرسان',
      subtitle: 'تصوير احترافي مخصص للعرسان استديو ملكي VIP',
      icon: <Sparkles className="w-8 h-8 text-pink-300" />,
      circleBg: 'bg-pink-950/70 border border-pink-500/40 text-pink-300 shadow-inner',
      borderColor: 'border-pink-500/40 hover:border-pink-400',
      topLineGradient: 'from-pink-500 via-rose-500 to-fuchsia-400',
      glowShadow: 'hover:shadow-pink-950/50',
      buttonBg: 'bg-gradient-to-r from-pink-600 via-rose-600 to-fuchsia-600 hover:from-pink-500 hover:to-fuchsia-500 text-white'
    },
    {
      id: 'studio_photos',
      serviceType: 'studio_photos' as ServiceType,
      title: 'الصور والاستديو',
      subtitle: 'طباعة وتصوير الصور والبورتريهات وحفلات التخرج',
      icon: <Camera className="w-8 h-8 text-cyan-300" />,
      circleBg: 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 shadow-inner',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      topLineGradient: 'from-blue-500 via-cyan-500 to-sky-400',
      glowShadow: 'hover:shadow-cyan-950/50',
      buttonBg: 'bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-500 hover:from-blue-500 hover:to-cyan-500 text-white'
    },

    // الصف الثاني (Row 2)
    {
      id: 'photo_albums',
      serviceType: 'photo_albums' as ServiceType,
      title: 'الألبومات الصور الفاخرة',
      subtitle: 'ألبومات عرسان ديجيتال حرارية وجلد إيطالي',
      icon: <BookOpen className="w-8 h-8 text-yellow-300" />,
      circleBg: 'bg-yellow-950/70 border border-yellow-500/40 text-yellow-300 shadow-inner',
      borderColor: 'border-yellow-600/40 hover:border-yellow-400',
      topLineGradient: 'from-yellow-600 via-amber-600 to-yellow-500',
      glowShadow: 'hover:shadow-yellow-950/50',
      buttonBg: 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-500 hover:to-yellow-500 text-white font-bold'
    },
    {
      id: 'advertising',
      serviceType: 'advertising' as ServiceType,
      title: 'الدعاية والإعلان',
      subtitle: 'بانرات، فليكس، بوسترات، رول اب، ستيكرات خارجية',
      icon: <Megaphone className="w-8 h-8 text-amber-300" />,
      circleBg: 'bg-amber-950/70 border border-amber-500/40 text-amber-300 shadow-inner',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      topLineGradient: 'from-amber-500 via-yellow-500 to-orange-400',
      glowShadow: 'hover:shadow-amber-950/50',
      buttonBg: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black'
    },
    {
      id: 'graphic_design',
      serviceType: 'graphic_design' as ServiceType,
      title: 'التصميمات والجرافيك',
      subtitle: 'تصميم الهويات التجارية، الشعارات وكروت المناسبات',
      icon: <PenTool className="w-8 h-8 text-purple-300" />,
      circleBg: 'bg-purple-950/70 border border-purple-500/40 text-purple-300 shadow-inner',
      borderColor: 'border-purple-500/40 hover:border-purple-400',
      topLineGradient: 'from-purple-500 via-violet-500 to-indigo-400',
      glowShadow: 'hover:shadow-purple-950/50',
      buttonBg: 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-violet-500 text-white'
    },

    // الصف الثالث (Row 3)
    {
      id: 'passport_photos',
      serviceType: 'passport_photos' as ServiceType,
      title: 'صور الجوازات والمعاملات',
      subtitle: 'تصوير فوري رسمي للسفارات والمعاملات الحكومية',
      icon: <ShieldCheck className="w-8 h-8 text-blue-300" />,
      circleBg: 'bg-blue-950/70 border border-blue-500/40 text-blue-300 shadow-inner',
      borderColor: 'border-blue-500/40 hover:border-blue-400',
      topLineGradient: 'from-blue-600 via-indigo-500 to-blue-400',
      glowShadow: 'hover:shadow-blue-950/50',
      buttonBg: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white'
    },
    {
      id: 'photo_restoration',
      serviceType: 'photo_restoration' as ServiceType,
      title: 'ترميم وتلوين الصور',
      subtitle: 'معالجة وترميم الصور التالفة والقديمة بجودة فائقة',
      icon: <Sparkles className="w-8 h-8 text-emerald-300" />,
      circleBg: 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 shadow-inner',
      borderColor: 'border-emerald-500/40 hover:border-emerald-400',
      topLineGradient: 'from-emerald-500 via-teal-500 to-green-400',
      glowShadow: 'hover:shadow-emerald-950/50',
      buttonBg: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold'
    },
    {
      id: 'canvas_prints',
      serviceType: 'canvas_prints' as ServiceType,
      title: 'لوحات الكانفس الفنية',
      subtitle: 'طباعة كانفس فاخرة مشدودة على خشب سويدي',
      icon: <Palette className="w-8 h-8 text-violet-300" />,
      circleBg: 'bg-violet-950/70 border border-violet-500/40 text-violet-300 shadow-inner',
      borderColor: 'border-violet-500/40 hover:border-violet-400',
      topLineGradient: 'from-violet-500 via-purple-500 to-fuchsia-400',
      glowShadow: 'hover:shadow-violet-950/50',
      buttonBg: 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-purple-500 text-white'
    },

    // الصف الرابع (Row 4)
    {
      id: 'video_montage',
      serviceType: 'video_montage' as ServiceType,
      title: 'الفيديو والمونتاج',
      subtitle: 'تصوير سينمائي 4K، تصوير درون جوي ومونتاج إعلاني',
      icon: <Clapperboard className="w-8 h-8 text-teal-300" />,
      circleBg: 'bg-teal-950/70 border border-teal-500/40 text-teal-300 shadow-inner',
      borderColor: 'border-teal-500/40 hover:border-teal-400',
      topLineGradient: 'from-teal-500 via-emerald-500 to-teal-400',
      glowShadow: 'hover:shadow-teal-950/50',
      buttonBg: 'bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold'
    },
    {
      id: 'outdoor_photo',
      serviceType: 'outdoor_photo' as ServiceType,
      title: 'التصوير الخارجي',
      subtitle: 'جلسات حدائق ومنتجعات سياحية وتغطية الحفلات',
      icon: <ImageIcon className="w-8 h-8 text-sky-300" />,
      circleBg: 'bg-sky-950/70 border border-sky-500/40 text-sky-300 shadow-inner',
      borderColor: 'border-sky-500/40 hover:border-sky-400',
      topLineGradient: 'from-sky-500 via-blue-500 to-indigo-400',
      glowShadow: 'hover:shadow-sky-950/50',
      buttonBg: 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white'
    },
    {
      id: 'thermal_print',
      serviceType: 'thermal_print' as ServiceType,
      title: 'الطباعة الحرارية والهدايا',
      subtitle: 'تيشيرتات، أكواب سحرية، دروع كريستال وهدايا تذكارية',
      icon: <Flame className="w-8 h-8 text-orange-300" />,
      circleBg: 'bg-orange-950/70 border border-orange-500/40 text-orange-300 shadow-inner',
      borderColor: 'border-orange-500/40 hover:border-orange-400',
      topLineGradient: 'from-orange-500 via-red-500 to-amber-500',
      glowShadow: 'hover:shadow-orange-950/50',
      buttonBg: 'bg-gradient-to-r from-orange-500 via-red-600 to-orange-600 hover:from-orange-400 hover:to-red-500 text-white font-bold'
    }
  ];

  const handleCardClick = (serviceType: ServiceType) => {
    if (onOpenNewOrderWithService) {
      onOpenNewOrderWithService(serviceType);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-300 pb-10 select-none">
      
      {/* Hidden File Inputs for Local Image Upload & Database Persistence */}
      <input 
        type="file" 
        ref={cameraFileInputRef} 
        onChange={handleCameraImageUpload} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={sectionFileInputRef} 
        onChange={handleSectionImageUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Floating Success Feedback Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/95 border-2 border-emerald-500 text-emerald-200 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Large Cinema Camera Banner (صورة كاميرا سينمائية كبيرة نفس اللي في الصورة ومحفوظة في قاعدة البيانات) */}
      <div className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-300 shadow-2xl group ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-[#060c18] via-[#091122] to-[#040812] border-amber-500/40 text-white shadow-[0_0_40px_rgba(245,158,11,0.18)]' 
          : 'bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 border-slate-700 text-white shadow-xl'
      }`}>
        
        {/* Cinema Camera Visual Centerpiece: Large, Panoramic, Ultra-HD Showcase */}
        <div className="relative w-full h-56 sm:h-72 md:h-80 lg:h-96 overflow-hidden bg-slate-950 flex items-center justify-center">
          <img 
            src={cameraImage || CINEMA_BANNER_IMAGE || CINEMA_CAMERA_IMAGE} 
            alt="كاميرا السينما والاستديو الاحترافي" 
            onError={(e) => {
              // Guaranteed local fallback if url fails
              e.currentTarget.src = CINEMA_BANNER_IMAGE || '/images/cinema_camera_banner_1791165179096.jpg';
            }}
            className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
          />

          {/* Cinematic Ambient Dark Vignette & Atmospheric Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80 pointer-events-none" />

          {/* Top Floating Badges */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/40 text-xs font-bold text-amber-300 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>كاميرا السينما والاستديو الاحترافي • أوفلاين 100%</span>
            </span>
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-xs font-bold">
              8K Cine RAW
            </span>
          </div>

          {/* Bottom Floating Cinema Camera Controls & Database Management */}
          <div className="absolute bottom-4 right-4 left-4 flex flex-col sm:flex-row items-center justify-between gap-3 z-10 bg-slate-950/80 backdrop-blur-md p-3 sm:px-5 sm:py-2.5 rounded-2xl border border-amber-500/30">
            <div className="flex items-center gap-2.5 text-right w-full sm:w-auto">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-white tracking-wide">
                  كاميرا السينما والإنتاج الرقمي
                </h3>
                <p className="text-[10px] text-slate-300">
                  الصورة محفوظة دائمًا في قاعدة بيانات الاستديو
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => cameraFileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
                title="رفع صورة جديدة للكاميرا السينمائية وحفظها في قاعدة البيانات"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>تغيير صورة الكاميرا</span>
              </button>

              <button
                type="button"
                onClick={handleResetCameraImage}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
                title="استعادة صورة الكاميرا الأصلية"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">استعادة الأصلية</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 2. Section Header: أنواع الأقسام والخدمات (12 قسماً مرتبة بشكل ثلاثي) */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 bg-amber-400 rounded-full shadow-md shadow-amber-400/50" />
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <span className="text-amber-400">📋</span>
            <span>أقسام وخدمات الاستديو (12 قسماً مرتبة ثلاثياً)</span>
          </h2>
        </div>

        <span className="text-xs font-bold text-amber-400/90 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          انقر على أي قسم لإنشاء طلب فوري
        </span>
      </div>

      {/* 3. The 12 Service Cards Grid: Arranged strictly in a 3-column layout (مرتب بشكل ثلاثي) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 sm:gap-6">
        {serviceCards.map(card => {
          const cardImg = storageService.getSectionImage(card.serviceType) || DEFAULT_SECTION_IMAGES[card.serviceType];

          return (
            <div
              key={card.id}
              className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-300 shadow-xl flex flex-col justify-between text-center overflow-hidden border ${card.borderColor} ${
                theme === 'dark'
                  ? 'bg-gradient-to-b from-[#0e172a]/95 to-[#09101f]/95 backdrop-blur-md'
                  : 'bg-slate-900/95 shadow-xl text-white'
              }`}
            >
              {/* 1. إطار الصورة الثابتة للقسم (غير قابلة للنقر - تظهر دائماً حتى أوفلاين) */}
              <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-4 bg-slate-950 border border-slate-800 shadow-inner select-none pointer-events-none">
                <img 
                  src={cardImg || DEFAULT_SECTION_IMAGES[card.serviceType]} 
                  alt={card.title} 
                  onError={(e) => {
                    const fallback = DEFAULT_SECTION_IMAGES[card.serviceType];
                    if (fallback && e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                  className="w-full h-full object-cover object-center" 
                />
              </div>

              {/* 2. اسم القسم (غير قابل للنقر) */}
              <div className="flex flex-col items-center w-full px-1 mb-4 select-none">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  {card.title}
                </h3>
              </div>

              {/* 3. زر إضافة طلب جديد فقط (الزر الوحيد لفتح نموذج الطلب) */}
              <div className="w-full pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenNewOrderWithService) {
                      onOpenNewOrderWithService(card.serviceType);
                    }
                  }}
                  className={`w-full py-3 px-6 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all duration-200 ${card.buttonBg} hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg`}
                >
                  <span className="text-base leading-none">+</span>
                  <span>إضافة طلب جديد</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
