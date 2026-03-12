/**
 * VideoPreviewDialog Component
 * Inline video player with clip segment preview before downloading
 */

import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Play, Pause, RotateCcw, Clock, Loader2 } from 'lucide-react';
import { Clip } from '@/types';
import { Progress } from '@/components/ui/progress';

interface VideoPreviewDialogProps {
  clip: Clip | null;
  videoUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (clip: Clip) => Promise<void>;
  loading?: boolean;
}

export const VideoPreviewDialog: React.FC<VideoPreviewDialogProps> = ({
  clip,
  videoUrl,
  isOpen,
  onClose,
  onDownload,
  loading = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const clipDuration = clip ? clip.endTime - clip.startTime : 0;

  useEffect(() => {
    if (!isOpen || !videoRef.current || !clip || !videoUrl) return;

    const video = videoRef.current;
    video.currentTime = clip.startTime;
    setCurrentTime(0);
    setIsPlaying(false);

    const handleTimeUpdate = () => {
      if (!clip) return;
      const elapsed = video.currentTime - clip.startTime;
      setCurrentTime(Math.max(0, elapsed));

      // Stop at clip end time
      if (video.currentTime >= clip.endTime) {
        video.pause();
        setIsPlaying(false);
      }
    };

    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isOpen, clip, videoUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || !clip) return;

    if (video.currentTime >= clip.endTime) {
      video.currentTime = clip.startTime;
    }

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    const video = videoRef.current;
    if (!video || !clip) return;
    video.currentTime = clip.startTime;
    setCurrentTime(0);
    video.play();
    setIsPlaying(true);
  };

  const handleDownload = async () => {
    if (!onDownload || !clip) return;
    setDownloading(true);
    try {
      await onDownload(clip);
    } finally {
      setDownloading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = clipDuration > 0 ? (currentTime / clipDuration) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-lg font-bold text-foreground truncate">
            {clip?.title || 'Vista previa'}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Video Player */}
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-sm text-muted-foreground">Cargando video...</span>
              </div>
            ) : videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  preload="metadata"
                  onClick={togglePlay}
                />
                {/* Play overlay when paused */}
                {!isPlaying && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/40"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 shadow-lg">
                      <Play className="h-7 w-7 text-primary-foreground ml-1" />
                    </div>
                  </button>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No hay video disponible para este proyecto</p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <Progress value={progressPercent} className="h-1.5" />
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(clipDuration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={togglePlay} disabled={!videoUrl || loading}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pausar' : 'Reproducir'}
              </Button>
              <Button variant="ghost" size="sm" onClick={restart} disabled={!videoUrl || loading}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-mono">
                  {clip && `${formatTime(clip.startTime)} → ${formatTime(clip.endTime)}`}
                </span>
              </div>
              {clip && (
                <Badge variant={clip.format === 'vertical' ? 'default' : 'secondary'}>
                  {clip.format === 'vertical' ? '9:16' : '16:9'}
                </Badge>
              )}
            </div>
          </div>

          {/* Description + Download */}
          {clip?.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{clip.description}</p>
          )}

          {onDownload && clip && (
            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={handleDownload}
              disabled={downloading || !videoUrl}
            >
              {downloading ? (
                <><Loader2 className="h-5 w-5 animate-spin" />Descargando...</>
              ) : (
                <><Download className="h-5 w-5" />Descargar clip</>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
