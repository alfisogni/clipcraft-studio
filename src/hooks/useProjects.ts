/**
 * useProjects Hook
 * Manages project state and operations
 */

import { useState, useCallback, useMemo } from 'react';
import { Project, VideoFormat, DashboardStats, StatusFilter, Clip } from '@/types';
import { generateMockProject, sampleProjects } from '@/lib/mockData';

export const useProjects = () => {
  // Initialize with sample projects
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Calculate dashboard statistics
  const stats: DashboardStats = useMemo(() => {
    const allClips = projects.flatMap(p => p.clips);
    return {
      totalProjects: projects.length,
      totalClips: allClips.length,
      pendingClips: allClips.filter(c => c.status === 'pending').length,
      readyClips: allClips.filter(c => c.status === 'ready').length,
    };
  }, [projects]);

  // Filter counts for current project
  const filterCounts = useMemo(() => {
    if (!selectedProject) {
      return { all: 0, pending: 0, ready: 0, processing: 0, favorites: 0 };
    }
    const clips = selectedProject.clips;
    return {
      all: clips.length,
      pending: clips.filter(c => c.status === 'pending').length,
      ready: clips.filter(c => c.status === 'ready').length,
      processing: clips.filter(c => c.status === 'processing').length,
      favorites: clips.filter(c => c.isFavorite).length,
    };
  }, [selectedProject]);

  // Filtered clips based on current filter
  const filteredClips = useMemo(() => {
    if (!selectedProject) return [];
    
    switch (statusFilter) {
      case 'pending':
        return selectedProject.clips.filter(c => c.status === 'pending');
      case 'ready':
        return selectedProject.clips.filter(c => c.status === 'ready');
      case 'processing':
        return selectedProject.clips.filter(c => c.status === 'processing');
      case 'favorites':
        return selectedProject.clips.filter(c => c.isFavorite);
      default:
        return selectedProject.clips;
    }
  }, [selectedProject, statusFilter]);

  // Selected clips for batch export
  const selectedClips = useMemo(() => {
    if (!selectedProject) return [];
    return selectedProject.clips.filter(c => c.isSelected);
  }, [selectedProject]);

  // Create a new project from uploaded video
  const createProject = useCallback((
    videoName: string,
    videoDuration: number,
    settings: {
      minClipDuration: number;
      maxClipDuration: number;
      outputFormat: VideoFormat;
    }
  ) => {
    const newProject = generateMockProject(videoName, videoDuration, settings);
    setProjects(prev => [newProject, ...prev]);
    setSelectedProject(newProject);
    return newProject;
  }, []);

  // Select a project to view details
  const selectProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project || null);
    setStatusFilter('all'); // Reset filter when selecting new project
  }, [projects]);

  // Clear selected project (go back to dashboard)
  const clearSelection = useCallback(() => {
    setSelectedProject(null);
    setStatusFilter('all');
  }, []);

  // Update clip status
  const updateClipStatus = useCallback((
    projectId: string,
    clipId: string,
    status: 'pending' | 'processing' | 'ready'
  ) => {
    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;
      return {
        ...project,
        updatedAt: new Date(),
        clips: project.clips.map(clip => 
          clip.id === clipId ? { ...clip, status } : clip
        ),
      };
    }));

    setSelectedProject(prev => {
      if (!prev || prev.id !== projectId) return prev;
      return {
        ...prev,
        updatedAt: new Date(),
        clips: prev.clips.map(clip =>
          clip.id === clipId ? { ...clip, status } : clip
        ),
      };
    });
  }, []);

  // Update clip title and description
  const updateClipContent = useCallback((
    clipId: string,
    title: string,
    description: string
  ) => {
    if (!selectedProject) return;

    const updatedClips = selectedProject.clips.map(clip =>
      clip.id === clipId ? { ...clip, title, description } : clip
    );

    const updatedProject = {
      ...selectedProject,
      updatedAt: new Date(),
      clips: updatedClips,
    };

    setSelectedProject(updatedProject);
    setProjects(prev => prev.map(p => 
      p.id === selectedProject.id ? updatedProject : p
    ));
  }, [selectedProject]);

  // Toggle clip favorite
  const toggleClipFavorite = useCallback((clipId: string) => {
    if (!selectedProject) return;

    const updatedClips = selectedProject.clips.map(clip =>
      clip.id === clipId ? { ...clip, isFavorite: !clip.isFavorite } : clip
    );

    const updatedProject = {
      ...selectedProject,
      clips: updatedClips,
    };

    setSelectedProject(updatedProject);
    setProjects(prev => prev.map(p => 
      p.id === selectedProject.id ? updatedProject : p
    ));
  }, [selectedProject]);

  // Toggle clip selection
  const toggleClipSelect = useCallback((clipId: string) => {
    if (!selectedProject) return;

    const updatedClips = selectedProject.clips.map(clip =>
      clip.id === clipId ? { ...clip, isSelected: !clip.isSelected } : clip
    );

    const updatedProject = {
      ...selectedProject,
      clips: updatedClips,
    };

    setSelectedProject(updatedProject);
    setProjects(prev => prev.map(p => 
      p.id === selectedProject.id ? updatedProject : p
    ));
  }, [selectedProject]);

  // Select all visible clips
  const selectAllClips = useCallback((select: boolean) => {
    if (!selectedProject) return;

    const filteredIds = new Set(filteredClips.map(c => c.id));
    const updatedClips = selectedProject.clips.map(clip =>
      filteredIds.has(clip.id) ? { ...clip, isSelected: select } : clip
    );

    const updatedProject = {
      ...selectedProject,
      clips: updatedClips,
    };

    setSelectedProject(updatedProject);
    setProjects(prev => prev.map(p => 
      p.id === selectedProject.id ? updatedProject : p
    ));
  }, [selectedProject, filteredClips]);

  // Export selected clips (mock)
  const exportSelectedClips = useCallback(() => {
    if (selectedClips.length === 0) return;
    
    // In a real app, this would trigger download
    console.log('Exporting clips:', selectedClips.map(c => c.title));
    alert(`Exportando ${selectedClips.length} clips seleccionados...`);
  }, [selectedClips]);

  return {
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
    updateClipStatus,
    updateClipContent,
    toggleClipFavorite,
    toggleClipSelect,
    selectAllClips,
    exportSelectedClips,
  };
};
