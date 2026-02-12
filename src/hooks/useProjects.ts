/**
 * useProjects Hook
 * Manages project state with Lovable Cloud database
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, VideoFormat, DashboardStats, StatusFilter, Clip } from '@/types';
import { generateMockClips } from '@/lib/mockData';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

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

  // Create project with real video upload
  const createProject = useCallback(async (
    videoName: string,
    videoDuration: number,
    settings: { minClipDuration: number; maxClipDuration: number; outputFormat: VideoFormat },
    file?: File
  ) => {
    if (!user) return;

    let videoStoragePath: string | null = null;

    // Upload video to storage if file provided
    if (file) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      toast.info('Subiendo video...');
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Error al subir el video');
        return;
      }
      videoStoragePath = filePath;
      toast.success('Video subido correctamente');
    }

    // Insert project
    const projectInsert = {
      user_id: user.id,
      name: videoName.replace(/\.[^/.]+$/, ''),
      original_video_name: videoName,
      original_video_duration: videoDuration,
      settings: JSON.parse(JSON.stringify(settings)),
      video_storage_path: videoStoragePath,
    };
    const { data: project, error: projErr } = await supabase
      .from('projects')
      .insert(projectInsert)
      .select()
      .single();

    if (projErr || !project) { console.error('Error creating project:', projErr); return; }

    // Generate clips with time segments
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

    // Now use AI to generate better titles and descriptions for each clip
    const { data: insertedClips } = await supabase
      .from('clips')
      .select('*')
      .eq('project_id', project.id)
      .order('start_time');

    if (insertedClips && insertedClips.length > 0) {
      // Generate AI content for each clip in parallel (fire-and-forget for speed)
      toast.info('Generando títulos con IA...');
      const aiPromises = insertedClips.map(async (clip, index) => {
        try {
          const res = await supabase.functions.invoke('generate-clip-content', {
            body: {
              videoName: videoName,
              clipIndex: index,
              startTime: clip.start_time,
              endTime: clip.end_time,
              duration: clip.duration,
              format: clip.format,
            },
          });
          if (res.data && !res.error && res.data.title && res.data.description) {
            await supabase.from('clips').update({
              title: res.data.title,
              description: res.data.description,
            }).eq('id', clip.id);
          }
        } catch (e) {
          console.warn('AI content generation failed for clip', clip.id, e);
        }
      });

      // Wait for all AI calls, then refresh
      await Promise.allSettled(aiPromises);
      toast.success('Títulos generados con IA');
    }

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
      videoStoragePath: project.video_storage_path,
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

  // Delete a project and its clips
  const deleteProject = useCallback(async (projectId: string) => {
    if (!user) return;

    const project = projects.find(p => p.id === projectId);

    // Delete clips first
    await supabase.from('clips').delete().eq('project_id', projectId);

    // Delete video from storage if exists
    if (project?.videoStoragePath) {
      await supabase.storage.from('videos').remove([project.videoStoragePath]);
    }

    // Delete project
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) { console.error('Error deleting project:', error); toast.error('Error al eliminar proyecto'); return; }

    toast.success('Proyecto eliminado');
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
    fetchProjects();
  }, [user, projects, selectedProject, fetchProjects]);

  // Delete a single clip
  const deleteClip = useCallback(async (clipId: string) => {
    const { error } = await supabase.from('clips').delete().eq('id', clipId);
    if (error) { console.error('Error deleting clip:', error); toast.error('Error al eliminar clip'); return; }

    toast.success('Clip eliminado');
    setSelectedProject(prev => {
      if (!prev) return prev;
      return { ...prev, clips: prev.clips.filter(c => c.id !== clipId) };
    });
    fetchProjects();
  }, [fetchProjects]);

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

  // Regenerate AI content for a single clip
  const regenerateClipContent = useCallback(async (clipId: string) => {
    if (!selectedProject) return;
    const clip = selectedProject.clips.find(c => c.id === clipId);
    if (!clip) return;

    toast.info('Regenerando con IA...');
    const index = selectedProject.clips.indexOf(clip);

    try {
      const res = await supabase.functions.invoke('generate-clip-content', {
        body: {
          videoName: selectedProject.originalVideoName,
          clipIndex: index,
          startTime: clip.startTime,
          endTime: clip.endTime,
          duration: clip.duration,
          format: clip.format,
        },
      });

      if (res.data && !res.error && res.data.title && res.data.description) {
        await supabase.from('clips').update({
          title: res.data.title,
          description: res.data.description,
        }).eq('id', clipId);

        setSelectedProject(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            clips: prev.clips.map(c => c.id === clipId
              ? { ...c, title: res.data.title, description: res.data.description }
              : c),
          };
        });
        toast.success('Contenido regenerado');
        fetchProjects();
      } else {
        toast.error('Error al generar contenido');
      }
    } catch (e) {
      console.error('Regenerate error:', e);
      toast.error('Error al conectar con IA');
    }
  }, [selectedProject, fetchProjects]);

  return {
    projects, selectedProject, stats, filterCounts, filteredClips,
    selectedClips, statusFilter, loading,
    setStatusFilter, createProject, selectProject, clearSelection,
    updateClipContent, toggleClipFavorite, toggleClipSelect,
    selectAllClips, exportSelectedClips,
    deleteProject, deleteClip, regenerateClipContent,
  };
};
