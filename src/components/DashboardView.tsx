/**
 * DashboardView Component
 * Main dashboard showing all projects and statistics
 */

import React from 'react';
import { Folder, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { ProjectCard } from '@/components/ProjectCard';
import { Project, DashboardStats } from '@/types';
import type { User } from '@supabase/supabase-js';

interface DashboardViewProps {
  projects: Project[];
  stats: DashboardStats;
  loading?: boolean;
  user: User;
  onSignOut: () => Promise<void>;
  onNewProject: () => void;
  onSelectProject: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects, stats, loading, user, onSignOut, onNewProject, onSelectProject, onDeleteProject,
}) => {
  return (
    <div className="min-h-screen bg-background">
      <Header onNewProject={onNewProject} user={user} onSignOut={onSignOut} />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Gestiona tus proyectos y clips de contenido</p>
        </div>

        <div className="mb-8">
          <StatsCards stats={stats} />
        </div>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Folder className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Tus proyectos</h3>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : projects.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center animate-fade-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mx-auto mb-4">
                <Folder className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Sin proyectos aún</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Sube tu primer video largo y deja que la IA genere clips optimizados para redes sociales
              </p>
              <Button variant="gradient" onClick={onNewProject}>
                <Plus className="h-4 w-4" />
                Crear primer proyecto
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project, index) => (
                <div key={project.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <ProjectCard project={project} onClick={() => onSelectProject(project.id)} onDelete={onDeleteProject} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
