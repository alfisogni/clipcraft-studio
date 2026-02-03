/**
 * ClipCard Component
 * Displays individual clip information with status and actions
 */

import React from 'react';
import { Clock, Play, Copy, Download, Edit2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clip } from '@/types';
import { cn } from '@/lib/utils';

interface ClipCardProps {
  clip: Clip;
  index: number;
  onStatusChange?: (clipId: string, status: Clip['status']) => void;
}

export const ClipCard: React.FC<ClipCardProps> = ({ clip, index, onStatusChange }) => {
  // Format time display (e.g., 1:30)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get status badge variant
  const getStatusVariant = (status: Clip['status']) => {
    switch (status) {
      case 'ready':
        return 'ready';
      case 'processing':
        return 'processing';
      default:
        return 'pending';
    }
  };

  // Get status label
  const getStatusLabel = (status: Clip['status']) => {
    switch (status) {
      case 'ready':
        return 'Listo';
      case 'processing':
        return 'Procesando';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="glass-card rounded-xl p-5 animate-slide-up hover:border-primary/30 transition-all duration-300"
         style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex flex-col gap-4">
        {/* Header with clip number and status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-sm font-bold text-primary">
              {index + 1}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono">{formatTime(clip.duration)}</span>
            </div>
          </div>
          
          <Badge variant={getStatusVariant(clip.status)}>
            {getStatusLabel(clip.status)}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground leading-tight">
          {clip.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {clip.description}
        </p>

        {/* Timestamp info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            Inicio: <span className="font-mono text-foreground">{formatTime(clip.startTime)}</span>
          </span>
          <span>
            Fin: <span className="font-mono text-foreground">{formatTime(clip.endTime)}</span>
          </span>
          <span className={cn(
            "rounded px-2 py-0.5 text-xs font-medium",
            clip.format === 'vertical' 
              ? "bg-primary/20 text-primary" 
              : "bg-secondary text-secondary-foreground"
          )}>
            {clip.format === 'vertical' ? '9:16' : '16:9'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <Button variant="ghost" size="sm" className="flex-1 text-xs">
            <Play className="h-3.5 w-3.5" />
            Preview
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-xs">
            <Copy className="h-3.5 w-3.5" />
            Copiar
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-xs">
            <Edit2 className="h-3.5 w-3.5" />
            Editar
          </Button>
          {clip.status === 'ready' && (
            <Button variant="ghost" size="sm" className="flex-1 text-xs text-success">
              <Download className="h-3.5 w-3.5" />
              Descargar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
