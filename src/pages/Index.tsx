/**
 * Index Page - Main Application Entry
 * ClipFlow: Video Creator Automation Tool
 */

import React, { useState } from 'react';
import { DashboardView } from '@/components/DashboardView';
import { NewProjectView } from '@/components/NewProjectView';
import { ProjectDetailView } from '@/components/ProjectDetailView';
import { useProjects } from '@/hooks/useProjects';
import type { User } from '@supabase/supabase-js';

type ViewState = 'dashboard' | 'new-project' | 'project-detail';

interface IndexProps {
  user: User;
  onSignOut: () => Promise<void>;
}

const Index: React.FC<IndexProps> = ({ user, onSignOut }) => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  const {
    projects, selectedProject, stats, filterCounts,
    filteredClips, selectedClips, statusFilter, loading,
    setStatusFilter, createProject, selectProject, clearSelection,
    updateClipContent, toggleClipFavorite, toggleClipSelect,
    selectAllClips, exportSelectedClips,
    deleteProject, deleteClip, regenerateClipContent,
    downloadClip, processClip,
  } = useProjects(user);

  const handleNewProject = () => setCurrentView('new-project');
  const handleBackToDashboard = () => { clearSelection(); setCurrentView('dashboard'); };
  const handleSelectProject = (projectId: string) => { selectProject(projectId); setCurrentView('project-detail'); };

  const handleCreateProject = async (
    videoName: string,
    videoDuration: number,
    settings: Parameters<typeof createProject>[2],
    file?: File
  ) => {
    await createProject(videoName, videoDuration, settings, file);
    setCurrentView('project-detail');
  };

  const handleDeleteProject = async (projectId: string) => {
    await deleteProject(projectId);
    setCurrentView('dashboard');
  };

  switch (currentView) {
    case 'new-project':
      return (
        <NewProjectView
          onBack={handleBackToDashboard}
          onCreateProject={handleCreateProject}
        />
      );

    case 'project-detail':
      if (!selectedProject) { setCurrentView('dashboard'); return null; }
      return (
        <ProjectDetailView
          project={selectedProject}
          filteredClips={filteredClips}
          selectedClips={selectedClips}
          filterCounts={filterCounts}
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
          onBack={handleBackToDashboard}
          onUpdateClip={updateClipContent}
          onToggleFavorite={toggleClipFavorite}
          onToggleSelect={toggleClipSelect}
          onSelectAll={selectAllClips}
          onExportSelected={exportSelectedClips}
          onDeleteClip={deleteClip}
          onDeleteProject={handleDeleteProject}
          onRegenerateClip={regenerateClipContent}
          onDownloadClip={downloadClip}
          onProcessClip={processClip}
        />
      );

    default:
      return (
        <DashboardView
          projects={projects}
          stats={stats}
          loading={loading}
          user={user}
          onSignOut={onSignOut}
          onNewProject={handleNewProject}
          onSelectProject={handleSelectProject}
          onDeleteProject={deleteProject}
        />
      );
  }
};

export default Index;
