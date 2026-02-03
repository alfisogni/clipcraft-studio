/**
 * useProjects Hook
 * Manages project state and operations
 */

import { useState, useCallback, useMemo } from 'react';
import { Project, VideoFormat, DashboardStats } from '@/types';
import { generateMockProject, sampleProjects } from '@/lib/mockData';

export const useProjects = () => {
  // Initialize with sample projects
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
  }, [projects]);

  // Clear selected project (go back to dashboard)
  const clearSelection = useCallback(() => {
    setSelectedProject(null);
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

    // Update selected project if it's the one being modified
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

  return {
    projects,
    selectedProject,
    stats,
    createProject,
    selectProject,
    clearSelection,
    updateClipStatus,
  };
};
