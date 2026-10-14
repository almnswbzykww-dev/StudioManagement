import React from 'react';
import { BankWalletType } from '../../types';

export interface WalletInfo {
  type: BankWalletType;
  label: string;
  sublabel: string;
  shortName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  ringColor: string;
  gradient: string;
  accountLabel: string;
  accountExample: string;
}

export const WALLET_CONFIGS: Record<BankWalletType, WalletInfo> = {
  kuraimi: {
    type: 'kuraimi',
    label: 'بنك الكريمي / إم فلوس (Kuraimi)',
    sublabel: 'حساب الكريمي مميز أو تطبيق إم فلوس',
    shortName: 'كريمي جوال',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/50',
    ringColor: 'ring-emerald-500',
    gradient: 'from-emerald-600 to-teal-800',
    accountLabel: 'رقم حساب الكريمي / إم فلوس',
    accountExample: 'مثال: 120345678'
  },
  jeeb: {
    type: 'jeeb',
    label: 'محفظة جيب (Jeeb Wallet)',
    sublabel: 'محفظة كاك بنك الرقمية الذكية',
    shortName: 'جيب',
    color: 'text-purple-400',
    bgColor: 'bg-purple-950/40',
    borderColor: 'border-purple-500/50',
    ringColor: 'ring-purple-500',
    gradient: 'from-purple-600 to-indigo-800',
    accountLabel: 'رقم محفظة جيب (رقم الهاتف)',
    accountExample: 'مثال: 777123456'
  },
  jawwali: {
    type: 'jawwali',
    label: 'محفظة جوالي (Jawwali)',
    sublabel: 'محفظة بنك اليمن والكويت الذكية',
    shortName: 'جوالي',
    color: 'text-sky-400',
    bgColor: 'bg-sky-950/40',
    borderColor: 'border-sky-500/50',
    ringColor: 'ring-sky-500',
    gradient: 'from-sky-600 to-blue-800',
    accountLabel: 'رقم محفظة جوالي',
    accountExample: 'مثال: 770987654'
  },
  one_cash: {
    type: 'one_cash',
    label: 'محفظة ون كاش (OneCash)',
    sublabel: 'محفظة شركة ون كاش للدفع السريع',
    shortName: 'ون كاش',
    color: 'text-amber-400',
    bgColor: 'bg-amber-950/40',
    borderColor: 'border-amber-500/50',
    ringColor: 'ring-amber-500',
    gradient: 'from-amber-600 to-orange-800',
    accountLabel: 'رقم محفظة ون كاش',
    accountExample: 'مثال: 733556677'
  },
  floosak: {
    type: 'floosak',
    label: 'محفظة فلوسك (Floosak)',
    sublabel: 'محفظة بنك اليمن والكويت للدفع الإلكتروني',
    shortName: 'فلوسك',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-950/40',
    borderColor: 'border-cyan-500/50',
    ringColor: 'ring-cyan-500',
    gradient: 'from-cyan-600 to-teal-800',
    accountLabel: 'رقم محفظة فلوسك',
    accountExample: 'مثال: 711223344'
  },
  cash_wallet: {
    type: 'cash_wallet',
    label: 'محفظة كاش (Cash Wallet)',
    sublabel: 'محفظة كاش المعتمدة للتحويلات والدفع',
    shortName: 'كاش',
    color: 'text-lime-400',
    bgColor: 'bg-lime-950/40',
    borderColor: 'border-lime-500/50',
    ringColor: 'ring-lime-500',
    gradient: 'from-lime-600 to-emerald-800',
    accountLabel: 'رقم محفظة كاش',
    accountExample: 'مثال: 780112233'
  },
  pyes: {
    type: 'pyes',
    label: 'محفظة بيس (PYes - بنك الأمل)',
    sublabel: 'محفظة بيس للشمول المالي والتمويل الأصغر',
    shortName: 'بيس',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-950/40',
    borderColor: 'border-indigo-500/50',
    ringColor: 'ring-indigo-500',
    gradient: 'from-indigo-600 to-violet-800',
    accountLabel: 'رقم محفظة بيس',
    accountExample: 'مثال: 775001122'
  },
  mobile_money: {
    type: 'mobile_money',
    label: 'محفظة موبايل موني (Mobile Money)',
    sublabel: 'محفظة كاك الإسلامي للدفع عبر الجوال',
    shortName: 'موبايل موني',
    color: 'text-rose-400',
    bgColor: 'bg-rose-950/40',
    borderColor: 'border-rose-500/50',
    ringColor: 'ring-rose-500',
    gradient: 'from-rose-600 to-red-800',
    accountLabel: 'رقم محفظة موبايل موني',
    accountExample: 'مثال: 772334455'
  },
  tadhamon_pay: {
    type: 'tadhamon_pay',
    label: 'بنك التضامن / تضامن باي (Tadhamon)',
    sublabel: 'تطبيق ومحفظة تضامن باي للدفع السريع',
    shortName: 'تضامن باي',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-950/40',
    borderColor: 'border-yellow-500/50',
    ringColor: 'ring-yellow-500',
    gradient: 'from-yellow-600 to-amber-800',
    accountLabel: 'رقم حساب التضامن / المحفظة',
    accountExample: 'مثال: 201099887'
  },
  qutaibi_banki: {
    type: 'qutaibi_banki',
    label: 'بنك القطيبي / تطبيق بنكي (Banki)',
    sublabel: 'خدمات الدفع والتحويل لبنك القطيبي الإسلامي',
    shortName: 'بنكي القطيبي',
    color: 'text-teal-400',
    bgColor: 'bg-teal-950/40',
    borderColor: 'border-teal-500/50',
    ringColor: 'ring-teal-500',
    gradient: 'from-teal-600 to-emerald-800',
    accountLabel: 'رقم حساب أو محفظة القطيبي',
    accountExample: 'مثال: 554433221'
  },
  shamel_money: {
    type: 'shamel_money',
    label: 'محفظة شامل موني (Shamel Money)',
    sublabel: 'محفظة بنك اليمن والبحرين الشامل',
    shortName: 'شامل موني',
    color: 'text-blue-400',
    bgColor: 'bg-blue-950/40',
    borderColor: 'border-blue-500/50',
    ringColor: 'ring-blue-500',
    gradient: 'from-blue-600 to-cyan-800',
    accountLabel: 'رقم محفظة شامل موني',
    accountExample: 'مثال: 730998877'
  },
  remittance: {
    type: 'remittance',
    label: 'شبكات التحويل المصرفي (حوالة محلية)',
    sublabel: 'النجم، الامتياز، يمن إكسبرس، الهادي، إلخ',
    shortName: 'حوالة صرافة',
    color: 'text-orange-400',
    bgColor: 'bg-orange-950/40',
    borderColor: 'border-orange-500/50',
    ringColor: 'ring-orange-500',
    gradient: 'from-orange-600 to-amber-800',
    accountLabel: 'رقم الحوالة / السند والشبكة',
    accountExample: 'مثال: حوالة النجم #994821'
  }
};

export const ALL_WALLETS = Object.values(WALLET_CONFIGS);

export interface WalletIconProps {
  type: BankWalletType | string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const WalletIcon: React.FC<WalletIconProps> = ({ 
  type, 
  className = '', 
  size = 'md' 
}) => {
  const sizeMap = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-12 h-12'
  };

  const currentSize = sizeMap[size] || 'w-7 h-7';

  switch (type) {
    case 'kuraimi':
      return (
        <svg className={`${currentSize} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="url(#kuraimi-grad)" />
          {/* Shield Emblem */}
          <path d="M24 8L36 13V24C36 31.5 30.9 38.3 24 40C17.1 38.3 12 31.5 12 24V13L24 8Z" fill="#047857" stroke="#34D399" strokeWidth="1.5" />
          {/* Stylized K */}
          <path d="M21 17V31M21 24L29 17M23 22.5L30 31" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="21" cy="17" r="1.5" fill="#FBBF24" />
          <circle cx="29" cy="17" r="1.5" fill="#FBBF24" />
          <circle cx="30" cy="31" r="1.5" fill="#FBBF24" />
          <defs>
            <linearGradient id="kuraimi-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#064E3B" />
              <stop offset="1" stopColor="#022C22" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'jeeb':
      return (
        <svg className={`${currentSize} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="url(#jeeb-grad)" />
          {/* Wallet Base */}
          <rect x="10" y="14" width="28" height="20" rx="4" fill="#6B21A8" stroke="#C084FC" strokeWidth="1.5" />
          <path d="M10 20H38" stroke="#9333EA" strokeWidth="1.5" />
          {/* Wallet Flap & Smart Lock */}
          <path d="M26 19H37C38.1 19 39 19.9 39 21V27C39 28.1 38.1 29 37 29H26C24.9 29 24 28.1 24 27V21C24 19.9 24.9 19 26 19Z" fill="#4C1D95" stroke="#E9D5FF" strokeWidth="1" />
          <circle cx="30" cy="24" r="2.5" fill="#F472B6" />
          <path d="M15 11L25 11" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
          <defs>
            <linearGradient id="jeeb-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#581C87" />
              <stop offset="1" stopColor="#2E1065" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'jawwali':
      return (
        <svg className={`${currentSize} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="url(#jawwali-grad)" />
          {/* Mobile Silhouette */}
          <rect x="15" y="10" width="18" height="28" rx="4" fill="#0369A1" stroke="#38BDF8" strokeWidth="1.5" />
          <rect x="18" y="14" width="12" height="18" rx="2" fill="#0C4A6E" />
          <circle cx="24" cy="35" r="1.5" fill="#38BDF8" />
          {/* Digital Signal Waves */}
          <path d="M20 23C20 20.8 21.8 19 24 19C26.2 19 28 20.8 28 23" stroke="#7DD3FC" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 20C18 16.7 20.7 14 24 14C27.3 14 30 16.7 30 20" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 3" />
          <circle cx="24" cy="23" r="2" fill="#F0F9FF" />
          <defs>
            <linearGradient id="jawwali-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#075985" />
              <stop offset="1" stopColor="#082F49" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'one_cash':
      return (
        <svg className={`${currentSize} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="url(#onecash-grad)" />
          {/* Circular Sunburst Ring */}
          <circle cx="24" cy="24" r="15" stroke="#F59E0B" strokeWidth="2" />
          <circle cx="24" cy="24" r="12" fill="#78350F" />
          {/* High Energy Lightning '1' */}
          <path d="M23 14L17 25H24L22 34L32 22H24L27 14H23Z" fill="#FBBF24" stroke="#FFFBEB" strokeWidth="1" strokeLinejoin="round" />
          <defs>
            <linearGradient id="onecash-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#92400E" />
              <stop offset="1" stopColor="#451A03" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'floosak':
      return (
        <svg className={`${currentSize} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="url(#floosak-grad)" />
          {/* Modern Digital Coins & Shield */}
          <circle cx="21" cy="21" r="9" fill="#0E7490" stroke="#22D3EE" strokeWidth="1.5" />
          <circle cx="27" cy="27" r="9" fill="#155E75" stroke="#67E8F9" strokeWidth="1.5" />
          <path d="M25 24V30M23 27H29" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" />
          <circle cx="21" cy="21" r="3" fill="#A5F3FC" />
          <defs>
            <linearGradient id="floosak-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#115E59" />
              <stop offset="1" stopColor="#042F2E" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'cash_wallet':
      return (
        <svg className={`${currentSize} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="url(#cash-grad)" />
          <rect x="11" y="15" width="26" height="18" rx="4" fill="#3F6212" stroke="#84CC16" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="5" fill="#14532D" stroke="#BEF264" strokeWidth="1.5" />
          <path d="M24 21V27M22 23H26" stroke="#ECFCCB" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="16" cy="24" r="1.5" fill="#84CC16" />
          <circle cx="32" cy="24" r="1.5" fill="#84CC16" />
          <defs>
            <linearGradient id="cash-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#365314" />
              <stop offset="1" stopColor="#142605" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'pyes':
      return (
        <svg className={`${currentSize} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="url(#pyes-grad)" />
          {/* P-Yes dynamic monogram */}
          <path d="M16 14H26C29.3 14 32 16.7 32 20C32 23.3 29.3 26 26 26H16V14Z" fill="#3730A3" stroke="#818CF8" strokeWidth="2" />
          <path d="M16 26V34" stroke="#818CF8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="24" cy="20" r="3" fill="#C7D2FE" />
          <path d="M26 31L32 37" stroke="#A5B4FC" strokeWidth="2.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="pyes-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#312E81" />
              <stop offset="1" stopColor="#1E1B4B" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'mobile_money':
      return (
        <svg className={`${currentSize} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="url(#mm-grad)" />
          <rect x="16" y="11" width="16" height="26" rx="4" fill="#881337" stroke="#FB7185" strokeWidth="1.5" />
          <rect x="19" y="15" width="10" height="14" rx="2" fill="#4C0519" />
          <circle cx="24" cy="33" r="1.5" fill="#FB7185" />
          {/* Flow Arrows */}
          <path d="M21 21L24 18L27 21" stroke="#FECDD3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M24 18V26" stroke="#FECDD3" strokeWidth="2" strokeLinecap="round" />
          <defs>
            <linearGradient id="mm-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#831843" />
              <stop offset="1" stopColor="#4A044E" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'tadhamon_pay':
      return (
        <svg className={`${currentSize} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="url(#tadhamon-grad)" />
          {/* Islamic Star Octagon */}
          <path d="M24 11L28 15H33V20L37 24L33 28V33H28L24 37L20 33H15V28L11 24L15 20V15H20L24 11Z" fill="#1E3A8A" stroke="#FBBF24" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="6" fill="#854D0E" stroke="#FDE68A" strokeWidth="1" />
          <path d="M22 24L23.5 25.5L26.5 22.5" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="tadhamon-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E1B4B" />
              <stop offset="1" stopColor="#0F172A" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'qutaibi_banki':
      return (
        <svg className={`${currentSize} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="url(#qutaibi-grad)" />
          <rect x="13" y="13" width="22" height="22" rx="4" transform="rotate(45 24 24)" fill="#0F766E" stroke="#2DD4BF" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="6" fill="#042F2E" stroke="#5EEAD4" strokeWidth="1.5" />
          <path d="M24 19V29M19 24H29" stroke="#CCFBF1" strokeWidth="1.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="qutaibi-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#134E4A" />
              <stop offset="1" stopColor="#042F2E" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'shamel_money':
      return (
        <svg className={`${currentSize} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="url(#shamel-grad)" />
          {/* Stylized S in diamond */}
          <rect x="13" y="13" width="22" height="22" rx="5" fill="#1E40AF" stroke="#60A5FA" strokeWidth="1.5" />
          <path d="M28 19C28 17.9 26.2 17 24 17C21.8 17 20 17.9 20 19C20 22 28 21.5 28 25C28 27.5 25.5 28.5 24 28.5C21.8 28.5 20 27.5 20 26.5" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="shamel-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E3A8A" />
              <stop offset="1" stopColor="#0C2340" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'remittance':
    default:
      return (
        <svg className={`${currentSize} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="url(#remit-grad)" />
          {/* Transfer Emblem */}
          <rect x="11" y="13" width="26" height="22" rx="4" fill="#9A3412" stroke="#FB923C" strokeWidth="1.5" />
          <path d="M17 21H31M27 17L31 21L27 25" stroke="#FDBA74" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M31 27H17M21 31L17 27L21 23" stroke="#FED7AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="remit-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7C2D12" />
              <stop offset="1" stopColor="#431407" />
            </linearGradient>
          </defs>
        </svg>
      );
  }
};

export const getWalletConfig = (typeOrName?: string): WalletInfo => {
  if (!typeOrName) return WALLET_CONFIGS.kuraimi;

  const key = typeOrName.toLowerCase();
  if (key.includes('كريم') || key.includes('kuraimi') || key.includes('فلوسك') === false && key.includes('فلوس')) {
    return WALLET_CONFIGS.kuraimi;
  }
  if (key.includes('جيب') || key.includes('jeeb')) return WALLET_CONFIGS.jeeb;
  if (key.includes('جوالي') || key.includes('jawwali')) return WALLET_CONFIGS.jawwali;
  if (key.includes('ون كاش') || key.includes('one_cash') || key.includes('onecash')) return WALLET_CONFIGS.one_cash;
  if (key.includes('فلوسك') || key.includes('floosak')) return WALLET_CONFIGS.floosak;
  if (key.includes('كاش') && !key.includes('ون')) return WALLET_CONFIGS.cash_wallet;
  if (key.includes('بيس') || key.includes('pyes') || key.includes('أمل')) return WALLET_CONFIGS.pyes;
  if (key.includes('موبايل') || key.includes('mobile')) return WALLET_CONFIGS.mobile_money;
  if (key.includes('تضامن') || key.includes('tadhamon')) return WALLET_CONFIGS.tadhamon_pay;
  if (key.includes('قطيبي') || key.includes('بنكي') || key.includes('qutaibi')) return WALLET_CONFIGS.qutaibi_banki;
  if (key.includes('شامل') || key.includes('shamel')) return WALLET_CONFIGS.shamel_money;
  if (key.includes('حوال') || key.includes('نجم') || key.includes('امتياز') || key.includes('remit')) return WALLET_CONFIGS.remittance;

  // Direct key lookup
  if (WALLET_CONFIGS[typeOrName as BankWalletType]) {
    return WALLET_CONFIGS[typeOrName as BankWalletType];
  }

  return WALLET_CONFIGS.kuraimi;
};

interface WalletSelectorProps {
  selectedType?: BankWalletType;
  onSelect: (type?: BankWalletType) => void;
  allowClear?: boolean;
  onClear?: () => void;
  compact?: boolean;
}

export const WalletSelector: React.FC<WalletSelectorProps> = ({
  selectedType,
  onSelect,
  allowClear = true,
  onClear
}) => {
  return (
    <div className="w-full">
      {/* Single-Line Compact Horizontal Row - Selectable & Optional */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {/* Optional / General Chip */}
        {allowClear && (
          <button
            type="button"
            onClick={() => {
              if (onClear) onClear();
              else onSelect(undefined);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              !selectedType
                ? 'bg-blue-600/25 border-blue-400 text-blue-200 ring-1 ring-blue-400 shadow-sm'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="اختياري - بدون تحديد محفظة معينة"
          >
            <span className="text-[10px]">🔘</span>
            <span>(اختياري) عام</span>
          </button>
        )}

        {ALL_WALLETS.map(w => {
          const isSelected = selectedType === w.type;
          return (
            <button
              key={w.type}
              type="button"
              onClick={() => {
                if (isSelected) {
                  // Toggle off (optional!)
                  if (onClear) onClear();
                  else onSelect(undefined);
                } else {
                  onSelect(w.type);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? `${w.bgColor} ${w.borderColor} ${w.color} shadow-sm ring-1 ${w.ringColor}`
                  : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-700'
              }`}
              title={`${w.label} - انقر للاختيار أو الإلغاء`}
            >
              <WalletIcon type={w.type} size="xs" />
              <span>{w.shortName}</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
