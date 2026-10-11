import React from 'react';
import { OrderStatus } from '../../types';
import { Clock, Palette, Camera, Printer, Film, CheckCircle2, PackageCheck, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config: Record<OrderStatus, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
    pending: {
      label: 'قيد الانتظار',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      icon: <Clock className="w-3.5 h-3.5" />
    },
    in_design: {
      label: 'قيد التصميم',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      icon: <Palette className="w-3.5 h-3.5" />
    },
    in_shooting: {
      label: 'قيد التصوير',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
      icon: <Camera className="w-3.5 h-3.5" />
    },
    in_printing: {
      label: 'قيد الطباعة',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      icon: <Printer className="w-3.5 h-3.5" />
    },
    in_montage: {
      label: 'قيد المونتاج',
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      border: 'border-indigo-500/30',
      icon: <Film className="w-3.5 h-3.5" />
    },
    ready: {
      label: 'جاهز للتسليم',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />
    },
    delivered: {
      label: 'تم التسليم',
      bg: 'bg-teal-500/10',
      text: 'text-teal-300',
      border: 'border-teal-500/30',
      icon: <PackageCheck className="w-3.5 h-3.5" />
    },
    cancelled: {
      label: 'ملغي',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      icon: <XCircle className="w-3.5 h-3.5" />
    }
  };

  const item = config[status] || config.pending;

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border ${item.bg} ${item.text} ${item.border} ${sizeClass} backdrop-blur-xs shadow-xs`}>
      {item.icon}
      <span>{item.label}</span>
    </span>
  );
};
