/**
 * ClipCard Component
 * Displays individual clip information with status, actions, and download
 */

import React, { useState } from 'react';
import { Clock, Play, Download, Edit2, Star, Check, Trash2, Wand2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clip } from '@/types';
import { cn } from '@/lib/utils';

interface ClipCardProps {
  clip: Clip;
  index: number;
  onEdit?: (clip: Clip) => void;
  onToggleFavorite?: (clipId: string) => void;
  onToggleSelect?: (clipId: string) => void;
  onDelete?: (clipId: string) => void;
  onRegenerate?: (clipId: string) => void;
  onDownload?: (clip: Clip) => void;
  onProcess?: (clip: Clip) => void;
  onPreview?: (clip: Clip) => void;
}

export const ClipCard: React.FC<ClipCardProps> = ({ 
  clip, 
  index, 
  onEdit,
  onToggleFavorite,
  onToggleSelect,
  onDelete,
  onRegenerate,
  onDownload,
  onProcess,
}) => {
  const [downloading, setDownloading] = useState(false);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusVariant = (status: Clip['status']) => {
    switch (status) {
      case 'ready': return 'ready';
      case 'processing': return 'processing';
      default: return 'pending';
    }
  };

  const getStatusLabel = (status: Clip['status']) => {
    switch (status) {
      case 'ready': return 'Listo';
      case 'processing': return 'Procesando';
      default: return 'Pendiente';
    }
  };

  const handleDownload = async () => {
    if (!onDownload) return;
    setDownloading(true);
    try {
      await onDownload(clip);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div 
      className={cn(
        "glass-card rounded-xl p-5 animate-slide-up transition-all duration-300",
        clip.isSelected 
          ? "border-primary ring-2 ring-primary/30" 
          : "hover:border-primary/30"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleSelect?.(clip.id)}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded border-2 transition-all",
                clip.isSelected
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground/30 hover:border-primary/50"
              )}
            >
              {clip.isSelected && <Check className="h-4 w-4" />}
            </button>
            
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-sm font-bold text-primary">
              {index + 1}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono">{formatTime(clip.duration)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite?.(clip.id)}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                clip.isFavorite
                  ? "text-warning bg-warning/20"
                  : "text-muted-foreground hover:text-warning hover:bg-warning/10"
              )}
            >
              <Star className={cn("h-4 w-4", clip.isFavorite && "fill-current")} />
            </button>
            
            <Badge variant={getStatusVariant(clip.status)}>
              {getStatusLabel(clip.status)}
            </Badge>
          </div>
        </div>

        <h3 className="font-semibold text-foreground leading-tight">{clip.title}</h3>

        <p className="text-sm text-muted-foreground line-clamp-2">{clip.description}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Inicio: <span className="font-mono text-foreground">{formatTime(clip.startTime)}</span></span>
          <span>Fin: <span className="font-mono text-foreground">{formatTime(clip.endTime)}</span></span>
          <span className={cn(
            "rounded px-2 py-0.5 text-xs font-medium",
            clip.format === 'vertical' 
              ? "bg-primary/20 text-primary" 
              : "bg-secondary text-secondary-foreground"
          )}>
            {clip.format === 'vertical' ? '9:16' : '16:9'}
          </span>
        </div>

        <div className="flex items-center gap-1 pt-2 border-t border-border/50">
          {clip.status === 'pending' && onProcess && (
            <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => onProcess(clip)}>
              <Play className="h-3.5 w-3.5" />
              Procesar
            </Button>
          )}
          {clip.status === 'processing' && (
            <Button variant="ghost" size="sm" className="flex-1 text-xs" disabled>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Procesando
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => onRegenerate?.(clip.id)}
          >
            <Wand2 className="h-3.5 w-3.5" />
            IA
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => onEdit?.(clip)}
          >
            <Edit2 className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-destructive hover:text-destructive"
            onClick={() => onDelete?.(clip.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          {clip.status === 'ready' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 text-xs text-success"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Descargar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
