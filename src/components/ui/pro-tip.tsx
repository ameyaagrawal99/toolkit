import React from 'react';
import { LucideIcon, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProTipProps {
  icon?: LucideIcon;
  title?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'info';
  className?: string;
}

const variantStyles = {
  primary: 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
  success: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
  warning: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
  info: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
};

const iconBgStyles = {
  primary: 'bg-primary-foreground/20',
  success: 'bg-white/20',
  warning: 'bg-white/20',
  info: 'bg-white/20',
};

export const ProTip: React.FC<ProTipProps> = ({
  icon: Icon = Lightbulb,
  title = 'Pro Tip',
  children,
  variant = 'primary',
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl p-5 md:p-6 animate-fade-in',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            iconBgStyles[variant]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="space-y-1 pt-1">
          <h4 className="font-bold text-sm uppercase tracking-wider opacity-90">
            {title}
          </h4>
          <p className="text-sm leading-relaxed opacity-95">{children}</p>
        </div>
      </div>
    </div>
  );
};
