/**
 * useProjects Hook
 * Manages project state with Lovable Cloud database
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, VideoFormat, DashboardStats, StatusFilter, Clip } from '@/types';
import { generateMockClips } from '@/lib/mockData';
import type { User } from '@supabase/supabase-js';

export const useProjects = (user: User | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);

  // Fetch projects from database
  const fetchProjects = useCallback(async () => {
    if (!user) { setProjects([]); setLoading(false); return; }
    
    setLoading(true);
    const { data: projectRows, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { console.error('Error fetching projects:', error); setLoading(false); return; }

    // Fetch clips for all projects
    const { data: clipRows } = await supabase
      .from('clips')
      .select('*')
      .order('start_time', { ascending: true });

    const mapped: Project[] = (projectRows || []).map(p => ({
      id: p.id,
      name: p.name,
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
      originalVideoName: p.original_video_name,
      originalVideoDuration: p.original_video_duration,
      videoStoragePath: p.video_storage_path,
      clips: (clipRows || [])
        .filter(c => c.project_id === p.id)
        .map(c => ({
          id: c.id,
          title: c.title,
          description: c.description,
          duration: c.duration,
          startTime: c.start_time,
          endTime: c.end_time,
          status: c.status as Clip['status'],
          format: c.format as VideoFormat,
          isFavorite: c.is_favorite,
          isSelected: false,
          thumbnailUrl: c.thumbnail_url || undefined,
        })),
      settings: p.settings as unknown as Project['settings'],
    }));

    setProjects(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // Sync selectedProject with projects
  useEffect(() => {
    if (selectedProject) {
      const updated = projects.find(p => p.id === selectedProject.id);
      if (updated) setSelectedProject(prev => ({
        ...updated,
        clips: updated.clips.map(c => {
          const prevClip = prev?.clips.find(pc => pc.id === c.id);
          return { ...c, isSelected: prevClip?.isSelected || false };
        }),
      }));
    }
  }, [projects]);

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
    if (!selectedProject) return { all: 0, pending: 0, ready: 0, processing: 0, favorites: 0 };
    const clips = selectedProject.clips;
    return {
      all: clips.length,
      pending: clips.filter(c => c.status === 'pending').length,
      ready: clips.filter(c => c.status === 'ready').length,
      processing: clips.filter(c => c.status === 'processing').length,
      favorites: clips.filter(c => c.isFavorite).length,
    };
  }, [selectedProject]);

  // Filtered clips
  const filteredClips = useMemo(() => {
    if (!selectedProject) return [];
    switch (statusFilter) {
      case 'pending': return selectedProject.clips.filter(c => c.status === 'pending');
      case 'ready': return selectedProject.clips.filter(c => c.status === 'ready');
      case 'processing': return selectedProject.clips.filter(c => c.status === 'processing');
      case 'favorites': return selectedProject.clips.filter(c => c.isFavorite);
      default: return selectedProject.clips;
    }
  }, [selectedProject, statusFilter]);

  const selectedClips = useMemo(() => {
    if (!selectedProject) return [];
    return selectedProject.clips.filter(c => c.isSelected);
  }, [selectedProject]);

  // Create project in database
  const createProject = useCallback(async (
    videoName: string,
    videoDuration: number,
    settings: { minClipDuration: number; maxClipDuration: number; outputFormat: VideoFormat }
  ) => {
    if (!user) return;

    // Insert project
    const projectInsert = {
      user_id: user.id,
      name: videoName.replace(/\.[^/.]+$/, ''),
      original_video_name: videoName,
      original_video_duration: videoDuration,
      settings: JSON.parse(JSON.stringify(settings)),
    };
    const { data: project, error: projErr } = await supabase
      .from('projects')
      .insert(projectInsert)
      .select()
      .single();

    if (projErr || !project) { console.error('Error creating project:', projErr); return; }

    // Generate mock clips and insert them
    const mockClips = generateMockClips(videoDuration, settings.minClipDuration, settings.maxClipDuration, settings.outputFormat);
    
    const clipInserts = mockClips.map(c => ({
      project_id: project.id,
      user_id: user.id,
      title: c.title,
      description: c.description,
      duration: c.duration,
      start_time: c.startTime,
      end_time: c.endTime,
      status: c.status,
      format: c.format,
    }));

    await supabase.from('clips').insert(clipInserts);

    // Refresh and select
    await fetchProjects();
    
    // Select the new project
    const { data: newClips } = await supabase
      .from('clips')
      .select('*')
      .eq('project_id', project.id)
      .order('start_time');

    const newProject: Project = {
      id: project.id,
      name: project.name,
      createdAt: new Date(project.created_at),
      updatedAt: new Date(project.updated_at),
      originalVideoName: project.original_video_name,
      originalVideoDuration: project.original_video_duration,
      clips: (newClips || []).map(c => ({
        id: c.id, title: c.title, description: c.description,
        duration: c.duration, startTime: c.start_time, endTime: c.end_time,
        status: c.status as Clip['status'], format: c.format as VideoFormat,
        isFavorite: c.is_favorite, isSelected: false,
      })),
      settings,
    };
    setSelectedProject(newProject);
  }, [user, fetchProjects]);

  const selectProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project || null);
    setStatusFilter('all');
  }, [projects]);

  const clearSelection = useCallback(() => {
    setSelectedProject(null);
    setStatusFilter('all');
  }, []);

  // Update clip content in database
  const updateClipContent = useCallback(async (clipId: string, title: string, description: string) => {
    await supabase.from('clips').update({ title, description }).eq('id', clipId);
    
    setSelectedProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        clips: prev.clips.map(c => c.id === clipId ? { ...c, title, description } : c),
      };
    });
    fetchProjects();
  }, [fetchProjects]);

  // Toggle favorite in database
  const toggleClipFavorite = useCallback(async (clipId: string) => {
    const clip = selectedProject?.clips.find(c => c.id === clipId);
    if (!clip) return;

    await supabase.from('clips').update({ is_favorite: !clip.isFavorite }).eq('id', clipId);
    
    setSelectedProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        clips: prev.clips.map(c => c.id === clipId ? { ...c, isFavorite: !c.isFavorite } : c),
      };
    });
    fetchProjects();
  }, [selectedProject, fetchProjects]);

  // Toggle selection (local only)
  const toggleClipSelect = useCallback((clipId: string) => {
    setSelectedProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        clips: prev.clips.map(c => c.id === clipId ? { ...c, isSelected: !c.isSelected } : c),
      };
    });
  }, []);

  const selectAllClips = useCallback((select: boolean) => {
    const filteredIds = new Set(filteredClips.map(c => c.id));
    setSelectedProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        clips: prev.clips.map(c => filteredIds.has(c.id) ? { ...c, isSelected: select } : c),
      };
    });
  }, [filteredClips]);

  const exportSelectedClips = useCallback(() => {
    if (selectedClips.length === 0) return;
    console.log('Exporting clips:', selectedClips.map(c => c.title));
    alert(`Exportando ${selectedClips.length} clips seleccionados...`);
  }, [selectedClips]);

  return {
    projects, selectedProject, stats, filterCounts, filteredClips,
    selectedClips, statusFilter, loading,
    setStatusFilter, createProject, selectProject, clearSelection,
    updateClipContent, toggleClipFavorite, toggleClipSelect,
    selectAllClips, exportSelectedClips,
  };
};
