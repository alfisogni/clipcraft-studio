/**
 * NewProjectView Component
 * Step-by-step project creation flow
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
    }
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

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock video duration
    const mockDuration = Math.floor(Math.random() * 5400) + 1800;

    await onCreateProject(selectedFile.name, mockDuration, {
      minClipDuration: minDuration,
      maxClipDuration: maxDuration,
      outputFormat: format,
    });

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
                <><Loader2 className="h-5 w-5 animate-spin" />Analizando video...</>
              ) : (
                <><Wand2 className="h-5 w-5" />Generar clips automáticamente</>
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-3">
              La IA analizará tu video y generará clips optimizados para redes sociales
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
