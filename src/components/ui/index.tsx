import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

// ============================================
// CARD
// ============================================

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// ============================================
// BADGE
// ============================================

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const dotColors = {
    default: 'bg-gray-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-blue-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-gray-100 text-gray-700 ${sizes[size]} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      {children}
    </span>
  );
}

// ============================================
// BUTTON
// ============================================

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  fullWidth = false,
  className = ''
}: ButtonProps) {
  const variants = {
    primary: 'bg-gray-900 text-white active:bg-gray-800',
    secondary: 'bg-white text-gray-900 border border-gray-200 active:bg-gray-50',
    ghost: 'text-gray-600 active:bg-gray-100',
    danger: 'bg-rose-500 text-white active:bg-rose-600'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
    >
      {children}
    </button>
  );
}

// ============================================
// PROGRESS BAR
// ============================================

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function Progress({ value, max = 100, size = 'md', showLabel = false, className = '' }: ProgressProps) {
  const percentage = Math.min(100, (value / max) * 100);

  const getColor = () => {
    if (percentage >= 90) return 'bg-emerald-400';
    if (percentage >= 70) return 'bg-amber-400';
    return 'bg-rose-400';
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`${heights[size]} bg-gray-200 rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${getColor()}`}
        />
      </div>
      {showLabel && <span className="text-xs text-gray-500 mt-1">{Math.round(percentage)}%</span>}
    </div>
  );
}

// ============================================
// CHECK STATUS INDICATOR
// ============================================

interface StatusIndicatorProps {
  status: 'pending' | 'passed' | 'failed' | 'warning' | 'na';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StatusIndicator({ status, size = 'md', showLabel = false }: StatusIndicatorProps) {
  const config = {
    pending: { color: 'bg-gray-300', label: 'En attente' },
    passed: { color: 'bg-emerald-400', label: 'Conforme' },
    failed: { color: 'bg-rose-400', label: 'Non conforme' },
    warning: { color: 'bg-amber-400', label: 'À vérifier' },
    na: { color: 'bg-gray-200', label: 'N/A' },
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`rounded-full ${config[status].color} ${sizes[size]}`} />
      {showLabel && <span className="text-xs font-medium text-gray-600">{config[status].label}</span>}
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-gray-300">{icon}</div>}
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ============================================
// MOBILE BOTTOM NAV
// ============================================

interface BottomNavProps {
  items: Array<{
    id: string;
    label: string;
    icon: ReactNode;
    badge?: number;
  }>;
  activeId: string;
  onChange: (id: string) => void;
}

export function BottomNav({ items, activeId, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 min-w-[64px] transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute bottom-0 w-12 h-0.5 bg-gray-900 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ============================================
// HEADER
// ============================================

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
}

export function Header({ title, subtitle, leftAction, rightAction }: HeaderProps) {
  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 safe-area-top">
      <div className="flex items-center justify-between px-4 py-3 lg:px-8 lg:py-4">
        <div className="flex items-center gap-3">
          {leftAction}
          <div>
            <h1 className="text-lg lg:text-xl font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="text-xs lg:text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {rightAction && <div className="flex items-center gap-2">{rightAction}</div>}
      </div>
    </header>
  );
}

// ============================================
// STAT TILE
// ============================================

interface StatTileProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatTile({ label, value, icon, color = 'default' }: StatTileProps) {
  const colors = {
    default: 'text-gray-900',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    danger: 'text-rose-500',
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <p className={`text-2xl lg:text-3xl font-extralight tabular-nums ${colors[color]}`}>
        {value}
      </p>
    </div>
  );
}

// ============================================
// LOADING SPINNER
// ============================================

export function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full"
      />
    </div>
  );
}
