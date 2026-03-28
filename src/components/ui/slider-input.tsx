import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PresetOption {
  label: string;
  value: number;
}

interface SliderInputProps {
  label: string;
  icon?: LucideIcon;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  unitPosition?: 'prefix' | 'suffix';
  formatValue?: (value: number) => string;
  presets?: PresetOption[];
  className?: string;
  showInput?: boolean;
  helperText?: string;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  icon: Icon,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  unitPosition = 'suffix',
  formatValue,
  presets,
  className,
  showInput = true,
  helperText,
}) => {
  const displayValue = formatValue ? formatValue(value) : value.toString();

  return (
    <div className={cn('space-y-4', className)}>
      {/* Label Row */}
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm font-bold text-foreground">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          {label}
        </Label>
        <div className="flex items-center gap-1">
          {unitPosition === 'prefix' && unit && (
            <span className="text-lg font-bold text-primary">{unit}</span>
          )}
          <span className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            {displayValue}
          </span>
          {unitPosition === 'suffix' && unit && (
            <span className="text-lg font-bold text-primary ml-1">{unit}</span>
          )}
        </div>
      </div>

      {/* Slider */}
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />

      {/* Min/Max Labels */}
      <div className="flex justify-between text-xs text-muted-foreground font-medium">
        <span>
          {unitPosition === 'prefix' && unit}
          {formatValue ? formatValue(min) : min}
          {unitPosition === 'suffix' && unit}
        </span>
        <span>
          {unitPosition === 'prefix' && unit}
          {formatValue ? formatValue(max) : max}
          {unitPosition === 'suffix' && unit}
        </span>
      </div>

      {/* Optional Input Field */}
      {showInput && (
        <div className="relative">
          {unitPosition === 'prefix' && unit && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
              {unit}
            </span>
          )}
          <Input
            type="number"
            value={value}
            onChange={(e) => {
              const newVal = parseFloat(e.target.value) || 0;
              onChange(Math.min(max, Math.max(min, newVal)));
            }}
            min={min}
            max={max}
            step={step}
            className={cn(
              'h-12 text-lg font-semibold',
              unitPosition === 'prefix' && unit && 'pl-8',
              unitPosition === 'suffix' && unit && 'pr-12'
            )}
          />
          {unitPosition === 'suffix' && unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
              {unit}
            </span>
          )}
        </div>
      )}

      {/* Helper Text */}
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      {/* Preset Buttons */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange(preset.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200',
                value === preset.value
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
