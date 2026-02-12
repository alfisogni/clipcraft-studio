/**
 * ProjectCard Component
 * Displays project summary with clip statistics and delete action
 */

import React from 'react';
import { Folder, Film, Clock, ChevronRight, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onDelete?: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onDelete }) => {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const readyClips = project.clips.filter(c => c.status === 'ready').length;
  const pendingClips = project.clips.filter(c => c.status === 'pending').length;
  const processingClips = project.clips.filter(c => c.status === 'processing').length;

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`¿Eliminar el proyecto "${project.name}" y todos sus clips?`)) {
      onDelete?.(project.id);
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full glass-card rounded-xl p-6 text-left transition-all duration-300 hover:border-primary/30 hover:scale-[1.01] group"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/20">
          <Folder className="h-6 w-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {project.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">{project.originalVideoName}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Film className="h-4 w-4" /><span>{project.clips.length} clips</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /><span>{formatDuration(project.originalVideoDuration)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {readyClips > 0 && <Badge variant="ready">{readyClips} listos</Badge>}
            {pendingClips > 0 && <Badge variant="pending">{pendingClips} pendientes</Badge>}
            {processingClips > 0 && <Badge variant="processing">{processingClips} procesando</Badge>}
          </div>

          <p className="text-xs text-muted-foreground mt-4">Creado {formatDate(project.createdAt)}</p>
        </div>
      </div>
    </button>
  );
};
