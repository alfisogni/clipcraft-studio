/**
 * ProjectDetailView Component
 * Displays project details with all generated clips
 */

import React, { useState } from 'react';
import { ArrowLeft, Film, Clock, Download, Share2, CheckSquare, Square, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipCard } from '@/components/ClipCard';
import { EditClipDialog } from '@/components/EditClipDialog';
import { StatusFilter } from '@/components/StatusFilter';
import { Project, Clip, StatusFilter as FilterType } from '@/types';

interface ProjectDetailViewProps {
  project: Project;
  filteredClips: Clip[];
  selectedClips: Clip[];
  filterCounts: {
    all: number;
    pending: number;
    ready: number;
    processing: number;
    favorites: number;
  };
  statusFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onBack: () => void;
  onUpdateClip: (clipId: string, title: string, description: string) => void;
  onToggleFavorite: (clipId: string) => void;
  onToggleSelect: (clipId: string) => void;
  onSelectAll: (select: boolean) => void;
  onExportSelected: () => void;
  onDeleteClip?: (clipId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onRegenerateClip?: (clipId: string) => void;
  onDownloadClip?: (clip: Clip) => Promise<void>;
  onProcessClip?: (clip: Clip) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  filteredClips,
  selectedClips,
  filterCounts,
  statusFilter,
  onFilterChange,
  onBack,
  onUpdateClip,
  onToggleFavorite,
  onToggleSelect,
  onSelectAll,
  onExportSelected,
  onDeleteClip,
  onDeleteProject,
  onRegenerateClip,
  onDownloadClip,
  onProcessClip,
}) => {
  const [editingClip, setEditingClip] = useState<Clip | null>(null);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
  };

  const allSelected = filteredClips.length > 0 && filteredClips.every(c => c.isSelected);

  const handleDeleteProject = () => {
    if (window.confirm(`¿Eliminar el proyecto "${project.name}" y todos sus clips?`)) {
      onDeleteProject?.(project.id);
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleDeleteProject}>
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
                Compartir
              </Button>
              {selectedClips.length > 0 ? (
                <Button variant="gradient" size="sm" onClick={onExportSelected}>
                  <Download className="h-4 w-4" />
                  Exportar {selectedClips.length} seleccionados
                </Button>
              ) : (
                <Button variant="gradient" size="sm">
                  <Download className="h-4 w-4" />
                  Exportar todo
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

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
              {filterCounts.ready > 0 && <Badge variant="ready">{filterCounts.ready} listos</Badge>}
              {filterCounts.pending > 0 && <Badge variant="pending">{filterCounts.pending} pendientes</Badge>}
              {filterCounts.processing > 0 && <Badge variant="processing">{filterCounts.processing} procesando</Badge>}
            </div>
            <div className="ml-auto text-sm text-muted-foreground">
              Formato: <span className="font-medium text-foreground">
                {project.settings.outputFormat === 'vertical' ? '9:16 Vertical' : '16:9 Horizontal'}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <StatusFilter currentFilter={statusFilter} onFilterChange={onFilterChange} counts={filterCounts} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onSelectAll(!allSelected)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {allSelected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
              <span>{allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}</span>
            </button>
            {selectedClips.length > 0 && (
              <span className="text-sm text-primary font-medium">{selectedClips.length} clips seleccionados</span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            {statusFilter === 'all' ? 'Todos los clips' : 
             statusFilter === 'favorites' ? 'Clips favoritos' :
             statusFilter === 'ready' ? 'Clips listos' :
             statusFilter === 'pending' ? 'Clips pendientes' : 'Clips procesando'}
          </h2>
        </div>

        {filteredClips.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No hay clips en esta categoría</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClips.map((clip, index) => (
              <ClipCard 
                key={clip.id} 
                clip={clip} 
                index={index}
                onEdit={setEditingClip}
                onToggleFavorite={onToggleFavorite}
                onToggleSelect={onToggleSelect}
                onDelete={onDeleteClip}
                onRegenerate={onRegenerateClip}
                onDownload={onDownloadClip}
                onProcess={onProcessClip}
              />
            ))}
          </div>
        )}
      </div>

      <EditClipDialog
        clip={editingClip}
        isOpen={!!editingClip}
        onClose={() => setEditingClip(null)}
        onSave={onUpdateClip}
      />
    </div>
  );
};
