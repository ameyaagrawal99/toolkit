import React from 'react';
import { cn } from '@/lib/utils';

interface PresetOption {
  label: string;
  value: number | string;
}

interface PresetButtonsProps {
  options: PresetOption[];
  value: number | string;
  onChange: (value: number | string) => void;
  className?: string;
  size?: 'sm' | 'default';
}

export const PresetButtons: React.FC<PresetButtonsProps> = ({
  options,
  value,
  onChange,
  className,
  size = 'default',
}) => {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'font-semibold rounded-lg transition-all duration-200 border-2',
            size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
            value === option.value
              ? 'bg-primary text-primary-foreground border-primary shadow-md'
              : 'bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-primary hover:bg-primary/5'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
