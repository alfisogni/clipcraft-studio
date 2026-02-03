/**
 * ProjectDetailView Component
 * Displays project details with all generated clips
 */

import React from 'react';
import { ArrowLeft, Film, Clock, Settings, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipCard } from '@/components/ClipCard';
import { Project } from '@/types';

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  onBack,
}) => {
  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  // Calculate statistics
  const readyClips = project.clips.filter(c => c.status === 'ready').length;
  const pendingClips = project.clips.filter(c => c.status === 'pending').length;
  const processingClips = project.clips.filter(c => c.status === 'processing').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
                <p className="text-sm text-muted-foreground">{project.originalVideoName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
                Configurar
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
                Compartir
              </Button>
              <Button variant="gradient" size="sm">
                <Download className="h-4 w-4" />
                Exportar todo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Project stats */}
        <div className="glass-card rounded-xl p-6 mb-8 animate-fade-in">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <Film className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{project.clips.length}</p>
                <p className="text-xs text-muted-foreground">clips generados</p>
              </div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-lg font-semibold text-foreground">{formatDuration(project.originalVideoDuration)}</p>
                <p className="text-xs text-muted-foreground">video original</p>
              </div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="flex items-center gap-4">
              {readyClips > 0 && <Badge variant="ready">{readyClips} listos</Badge>}
              {pendingClips > 0 && <Badge variant="pending">{pendingClips} pendientes</Badge>}
              {processingClips > 0 && <Badge variant="processing">{processingClips} procesando</Badge>}
            </div>
            <div className="ml-auto text-sm text-muted-foreground">
              Formato: <span className="font-medium text-foreground">
                {project.settings.outputFormat === 'vertical' ? '9:16 Vertical' : '16:9 Horizontal'}
              </span>
            </div>
          </div>
        </div>

        {/* Clips grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Clips generados</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {project.clips.map((clip, index) => (
              <ClipCard key={clip.id} clip={clip} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
