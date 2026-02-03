/**
 * ClipSettings Component
 * Configuration panel for clip generation parameters
 */

import React from 'react';
import { Smartphone, Monitor, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { VideoFormat } from '@/types';
import { cn } from '@/lib/utils';

interface ClipSettingsProps {
  minDuration: number;
  maxDuration: number;
  format: VideoFormat;
  onMinDurationChange: (value: number) => void;
  onMaxDurationChange: (value: number) => void;
  onFormatChange: (format: VideoFormat) => void;
}

export const ClipSettings: React.FC<ClipSettingsProps> = ({
  minDuration,
  maxDuration,
  format,
  onMinDurationChange,
  onMaxDurationChange,
  onFormatChange,
}) => {
  return (
    <div className="space-y-8">
      {/* Format Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-4">
          Formato de salida
        </label>
        <div className="grid grid-cols-2 gap-4">
          {/* Vertical option */}
          <button
            onClick={() => onFormatChange('vertical')}
            className={cn(
              "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200",
              format === 'vertical'
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 bg-secondary/30"
            )}
          >
            <div className={cn(
              "flex h-20 w-12 items-center justify-center rounded-lg border-2",
              format === 'vertical' ? "border-primary bg-primary/20" : "border-muted-foreground/30"
            )}>
              <Smartphone className={cn(
                "h-6 w-6",
                format === 'vertical' ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div className="text-center">
              <p className={cn(
                "font-medium",
                format === 'vertical' ? "text-primary" : "text-foreground"
              )}>
                Vertical
              </p>
              <p className="text-xs text-muted-foreground">9:16 • Reels, TikTok</p>
            </div>
          </button>

          {/* Horizontal option */}
          <button
            onClick={() => onFormatChange('horizontal')}
            className={cn(
              "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200",
              format === 'horizontal'
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 bg-secondary/30"
            )}
          >
            <div className={cn(
              "flex h-12 w-20 items-center justify-center rounded-lg border-2",
              format === 'horizontal' ? "border-primary bg-primary/20" : "border-muted-foreground/30"
            )}>
              <Monitor className={cn(
                "h-6 w-6",
                format === 'horizontal' ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div className="text-center">
              <p className={cn(
                "font-medium",
                format === 'horizontal' ? "text-primary" : "text-foreground"
              )}>
                Horizontal
              </p>
              <p className="text-xs text-muted-foreground">16:9 • YouTube</p>
            </div>
          </button>
        </div>
      </div>

      {/* Duration Settings */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Clock className="h-4 w-4 text-primary" />
          <span>Duración de clips</span>
        </div>

        {/* Min Duration */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mínimo</span>
            <span className="font-mono text-primary">{minDuration}s</span>
          </div>
          <Slider
            value={[minDuration]}
            onValueChange={(v) => onMinDurationChange(v[0])}
            min={15}
            max={maxDuration - 5}
            step={5}
            className="py-2"
          />
        </div>

        {/* Max Duration */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Máximo</span>
            <span className="font-mono text-primary">{maxDuration}s</span>
          </div>
          <Slider
            value={[maxDuration]}
            onValueChange={(v) => onMaxDurationChange(v[0])}
            min={minDuration + 5}
            max={180}
            step={5}
            className="py-2"
          />
        </div>

        {/* Duration preview */}
        <div className="rounded-lg bg-secondary/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Los clips tendrán entre{' '}
            <span className="font-medium text-foreground">{minDuration}s</span>
            {' '}y{' '}
            <span className="font-medium text-foreground">{maxDuration}s</span>
          </p>
        </div>
      </div>
    </div>
  );
};
