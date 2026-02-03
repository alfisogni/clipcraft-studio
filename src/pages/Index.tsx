/**
 * Index Page - Main Application Entry
 * ClipFlow: Video Creator Automation Tool
 * 
 * This application helps video creators automate their content workflow
 * by generating optimized clips from long-form videos.
 */

import React, { useState } from 'react';
import { DashboardView } from '@/components/DashboardView';
import { NewProjectView } from '@/components/NewProjectView';
import { ProjectDetailView } from '@/components/ProjectDetailView';
import { useProjects } from '@/hooks/useProjects';

type ViewState = 'dashboard' | 'new-project' | 'project-detail';

const Index: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  const {
    projects,
    selectedProject,
    stats,
    filterCounts,
    filteredClips,
    selectedClips,
    statusFilter,
    setStatusFilter,
    createProject,
    selectProject,
    clearSelection,
    updateClipContent,
    toggleClipFavorite,
    toggleClipSelect,
    selectAllClips,
    exportSelectedClips,
  } = useProjects();

  // Navigation handlers
  const handleNewProject = () => {
    setCurrentView('new-project');
  };

  const handleBackToDashboard = () => {
    clearSelection();
    setCurrentView('dashboard');
  };

  const handleSelectProject = (projectId: string) => {
    selectProject(projectId);
    setCurrentView('project-detail');
  };

  const handleCreateProject = (
    videoName: string,
    videoDuration: number,
    settings: Parameters<typeof createProject>[2]
  ) => {
    createProject(videoName, videoDuration, settings);
    setCurrentView('project-detail');
  };

  // Render appropriate view based on state
  switch (currentView) {
    case 'new-project':
      return (
        <NewProjectView
          onBack={handleBackToDashboard}
          onCreateProject={handleCreateProject}
        />
      );

    case 'project-detail':
      if (!selectedProject) {
        // Fallback to dashboard if no project selected
        setCurrentView('dashboard');
        return null;
      }
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
        />
      );

    default:
      return (
        <DashboardView
          projects={projects}
          stats={stats}
          onNewProject={handleNewProject}
          onSelectProject={handleSelectProject}
        />
      );
  }
};

export default Index;
