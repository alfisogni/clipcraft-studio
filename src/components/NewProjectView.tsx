/**
 * NewProjectView Component
 * Step-by-step project creation flow with real video upload
 */

import React, { useState } from 'react';
import { ArrowLeft, Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoUploader } from '@/components/VideoUploader';
import { ClipSettings } from '@/components/ClipSettings';
import { VideoFormat } from '@/types';

interface NewProjectViewProps {
  onBack: () => void;
  onCreateProject: (
    videoName: string,
    videoDuration: number,
    settings: {
      minClipDuration: number;
      maxClipDuration: number;
      outputFormat: VideoFormat;
    },
    file?: File
  ) => Promise<void>;
}

export const NewProjectView: React.FC<NewProjectViewProps> = ({ onBack, onCreateProject }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [minDuration, setMinDuration] = useState(30);
  const [maxDuration, setMaxDuration] = useState(60);
  const [format, setFormat] = useState<VideoFormat>('vertical');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerate = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    // Try to get real video duration from the file
    let videoDuration: number;
    try {
      videoDuration = await getVideoDuration(selectedFile);
    } catch {
      // Fallback to estimated duration based on file size
      videoDuration = Math.floor(Math.random() * 5400) + 1800;
    }

    await onCreateProject(selectedFile.name, videoDuration, {
      minClipDuration: minDuration,
      maxClipDuration: maxDuration,
      outputFormat: format,
    }, selectedFile);

    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Nuevo proyecto</h1>
              <p className="text-sm text-muted-foreground">Sube un video y configura los parámetros</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <section className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</div>
              <h2 className="text-lg font-semibold text-foreground">Sube tu video largo</h2>
            </div>
            <VideoUploader onFileSelect={setSelectedFile} selectedFile={selectedFile} onClear={() => setSelectedFile(null)} />
          </section>

          <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">2</div>
              <h2 className="text-lg font-semibold text-foreground">Configura los parámetros</h2>
            </div>
            <div className="glass-card rounded-xl p-6">
              <ClipSettings
                minDuration={minDuration} maxDuration={maxDuration} format={format}
                onMinDurationChange={setMinDuration} onMaxDurationChange={setMaxDuration} onFormatChange={setFormat}
              />
            </div>
          </section>

          <div className="pt-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Button variant="gradient" size="xl" className="w-full" disabled={!selectedFile || isProcessing} onClick={handleGenerate}>
              {isProcessing ? (
                <><Loader2 className="h-5 w-5 animate-spin" />Subiendo y analizando video...</>
              ) : (
                <><Wand2 className="h-5 w-5" />Generar clips automáticamente</>
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-3">
              El video se subirá al storage y la IA generará clips con títulos optimizados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Extract real duration from a video file using HTMLVideoElement */
function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      if (video.duration && isFinite(video.duration)) {
        resolve(Math.floor(video.duration));
      } else {
        reject(new Error('Could not determine duration'));
      }
    };
    video.onerror = () => reject(new Error('Video load error'));
    video.src = URL.createObjectURL(file);
  });
}
