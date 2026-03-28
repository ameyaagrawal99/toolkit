import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BigResultCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'default' | 'large';
  className?: string;
}

const variantStyles = {
  default: 'bg-card border-border',
  primary: 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0',
  success: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0',
  warning: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0',
  danger: 'bg-gradient-to-br from-red-500 to-rose-600 text-white border-0',
  info: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0',
};

const labelStyles = {
  default: 'text-muted-foreground',
  primary: 'text-primary-foreground/80',
  success: 'text-white/80',
  warning: 'text-white/80',
  danger: 'text-white/80',
  info: 'text-white/80',
};

const valueStyles = {
  default: 'text-foreground',
  primary: 'text-primary-foreground',
  success: 'text-white',
  warning: 'text-white',
  danger: 'text-white',
  info: 'text-white',
};

const subValueStyles = {
  default: 'text-muted-foreground',
  primary: 'text-primary-foreground/70',
  success: 'text-white/70',
  warning: 'text-white/70',
  danger: 'text-white/70',
  info: 'text-white/70',
};

export const BigResultCard: React.FC<BigResultCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  size = 'default',
  className,
}) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <div
      className={cn(
        'relative rounded-2xl p-5 md:p-6 overflow-hidden border shadow-lg transition-all duration-300 hover:shadow-xl',
        variantStyles[variant],
        className
      )}
    >
      {/* Gradient accent bar for default variant */}
      {variant === 'default' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
      )}

      <div className="space-y-2">
        {/* Label with optional icon */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'text-sm font-bold uppercase tracking-wider',
              labelStyles[variant]
            )}
          >
            {label}
          </span>
          {Icon && (
            <Icon
              className={cn(
                'h-5 w-5',
                variant === 'default' ? 'text-primary' : 'text-white/60'
              )}
            />
          )}
        </div>

        {/* Big Value */}
        <p
          className={cn(
            'font-bold tracking-tight leading-tight break-words',
            size === 'large' ? 'text-xl md:text-2xl lg:text-3xl' : 'text-lg md:text-xl',
            valueStyles[variant]
          )}
        >
          {value}
        </p>

        {/* Sub Value (e.g., words format) */}
        {subValue && (
          <p className={cn('text-sm font-medium', subValueStyles[variant])}>
            {subValue}
          </p>
        )}

        {/* Trend indicator */}
        {trend && trendValue && TrendIcon && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-semibold',
              trend === 'up'
                ? variant === 'default'
                  ? 'text-emerald-600'
                  : 'text-white/90'
                : variant === 'default'
                ? 'text-red-600'
                : 'text-white/90'
            )}
          >
            <TrendIcon className="h-4 w-4" />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};
