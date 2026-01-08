'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface NumericInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showButtons?: boolean;
  size?: 'sm' | 'md' | 'lg';
  suffix?: string;
  className?: string;
}

export function NumericInput({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  showButtons = true,
  size = 'md',
  suffix,
  className
}: NumericInputProps) {
  const handleDecrement = () => {
    const newValue = value - step;
    if (min !== undefined && newValue < min) return;
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = value + step;
    if (max !== undefined && newValue > max) return;
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(val);
    }
  };

  const heightClass = size === 'sm' ? 'h-8' : size === 'lg' ? 'h-14' : 'h-10';
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
  const fontSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showButtons && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          className={`${heightClass} ${heightClass.replace('h-', 'w-')} shrink-0 rounded-full`}
          type="button"
        >
          <Minus className={iconSize} />
        </Button>
      )}
      
      <div className="relative flex-1">
        <Input
          type="number" // Using text with inputMode is better for mobile but type="number" has native controls
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={handleInputChange}
          className={`${heightClass} ${fontSize} text-center font-bold`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>

      {showButtons && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          className={`${heightClass} ${heightClass.replace('h-', 'w-')} shrink-0 rounded-full`}
          type="button"
        >
          <Plus className={iconSize} />
        </Button>
      )}
    </div>
  );
}