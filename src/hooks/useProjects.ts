/**
 * useProjects Hook
 * Manages project state with database or mock data (demo mode)
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, VideoFormat, DashboardStats, StatusFilter, Clip } from '@/types';
import { generateMockClips, sampleProjects } from '@/lib/mockData';
import { useDemo } from '@/contexts/DemoContext';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export const useProjects = (user: User | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const { isDemo } = useDemo();

  // ─── DEMO MODE: load sample projects ───
  useEffect(() => {
    if (isDemo) {
      setProjects(sampleProjects);
      setLoading(false);
    }
  }, [isDemo]);

  // ─── REAL MODE: fetch from database ───
  const fetchProjects = useCallback(async () => {
    if (isDemo || !user) { if (!isDemo) { setProjects([]); setLoading(false); } return; }
    
    setLoading(true);
    const { data: projectRows, error } = await supabase
      .from('projects').select('*').order('created_at', { ascending: false });

    if (error) { console.error('Error fetching projects:', error); setLoading(false); return; }

    const { data: clipRows } = await supabase
      .from('clips').select('*').order('start_time', { ascending: true });

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
          id: c.id, title: c.title, description: c.description,
          duration: c.duration, startTime: c.start_time, endTime: c.end_time,
          status: c.status as Clip['status'], format: c.format as VideoFormat,
          isFavorite: c.is_favorite, isSelected: false,
          thumbnailUrl: c.thumbnail_url || undefined,
        })),
      settings: p.settings as unknown as Project['settings'],
    }));

    setProjects(mapped);
    setLoading(false);
  }, [user, isDemo]);

  useEffect(() => { if (!isDemo) fetchProjects(); }, [fetchProjects, isDemo]);

  // Sync selectedProject
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

  // Stats
  const stats: DashboardStats = useMemo(() => {
    const allClips = projects.flatMap(p => p.clips);
    return {
      totalProjects: projects.length,
      totalClips: allClips.length,
      pendingClips: allClips.filter(c => c.status === 'pending').length,
      readyClips: allClips.filter(c => c.status === 'ready').length,
    };
  }, [projects]);

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

  // ─── CREATE PROJECT ───
  const createProject = useCallback(async (
    videoName: string,
    videoDuration: number,
    settings: { minClipDuration: number; maxClipDuration: number; outputFormat: VideoFormat },
    file?: File
  ) => {
    if (!user) return;

    // DEMO MODE: create locally
    if (isDemo) {
      const mockClips = generateMockClips(videoDuration, settings.minClipDuration, settings.maxClipDuration, settings.outputFormat);
      const now = new Date();
      const newProject: Project = {
        id: Math.random().toString(36).substring(2, 15),
        name: videoName.replace(/\.[^/.]+$/, ''),
        createdAt: now, updatedAt: now,
        originalVideoName: videoName,
        originalVideoDuration: videoDuration,
        clips: mockClips,
        settings,
      };
      setProjects(prev => [newProject, ...prev]);
      setSelectedProject(newProject);
      toast.success('Proyecto demo creado con clips de ejemplo');
      return;
    }

    // REAL MODE
    let videoStoragePath: string | null = null;
    if (file) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      toast.info('Subiendo video...');
      const { error: uploadError } = await supabase.storage
        .from('videos').upload(filePath, file, { contentType: file.type, upsert: false });
      if (uploadError) { console.error('Upload error:', uploadError); toast.error('Error al subir el video'); return; }
      videoStoragePath = filePath;
      toast.success('Video subido correctamente');
    }

    const { data: project, error: projErr } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: videoName.replace(/\.[^/.]+$/, ''),
        original_video_name: videoName,
        original_video_duration: videoDuration,
        settings: JSON.parse(JSON.stringify(settings)),
        video_storage_path: videoStoragePath,
      })
      .select().single();

    if (projErr || !project) { console.error('Error creating project:', projErr); return; }

    const mockClips = generateMockClips(videoDuration, settings.minClipDuration, settings.maxClipDuration, settings.outputFormat);
    const clipInserts = mockClips.map(c => ({
      project_id: project.id, user_id: user.id,
      title: c.title, description: c.description, duration: c.duration,
      start_time: c.startTime, end_time: c.endTime, status: c.status, format: c.format,
    }));
    await supabase.from('clips').insert(clipInserts);

    const { data: insertedClips } = await supabase
      .from('clips').select('*').eq('project_id', project.id).order('start_time');

    if (insertedClips && insertedClips.length > 0) {
      toast.info('Generando títulos con IA...');
      const aiPromises = insertedClips.map(async (clip, index) => {
        try {
          const res = await supabase.functions.invoke('generate-clip-content', {
            body: { videoName, clipIndex: index, startTime: clip.start_time, endTime: clip.end_time, duration: clip.duration, format: clip.format },
          });
          if (res.data && !res.error && res.data.title && res.data.description) {
            await supabase.from('clips').update({ title: res.data.title, description: res.data.description }).eq('id', clip.id);
          }
        } catch (e) { console.warn('AI content generation failed for clip', clip.id, e); }
      });
      await Promise.allSettled(aiPromises);
      toast.success('Títulos generados con IA');
    }

    await fetchProjects();
    const { data: newClips } = await supabase.from('clips').select('*').eq('project_id', project.id).order('start_time');
    const newProject: Project = {
      id: project.id, name: project.name,
      createdAt: new Date(project.created_at), updatedAt: new Date(project.updated_at),
      originalVideoName: project.original_video_name, originalVideoDuration: project.original_video_duration,
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
  }, [user, isDemo, fetchProjects]);

  const selectProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project || null);
    setStatusFilter('all');
  }, [projects]);

  const clearSelection = useCallback(() => { setSelectedProject(null); setStatusFilter('all'); }, []);

  // ─── DELETE PROJECT ───
  const deleteProject = useCallback(async (projectId: string) => {
    if (isDemo) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (selectedProject?.id === projectId) setSelectedProject(null);
      toast.success('Proyecto demo eliminado');
      return;
    }
    if (!user) return;
    const project = projects.find(p => p.id === projectId);
    await supabase.from('clips').delete().eq('project_id', projectId);
    if (project?.videoStoragePath) await supabase.storage.from('videos').remove([project.videoStoragePath]);
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) { console.error('Error deleting project:', error); toast.error('Error al eliminar proyecto'); return; }
    toast.success('Proyecto eliminado');
    if (selectedProject?.id === projectId) setSelectedProject(null);
    fetchProjects();
  }, [user, isDemo, projects, selectedProject, fetchProjects]);

  // ─── DELETE CLIP ───
  const deleteClip = useCallback(async (clipId: string) => {
    if (isDemo) {
      setSelectedProject(prev => prev ? { ...prev, clips: prev.clips.filter(c => c.id !== clipId) } : prev);
      setProjects(prev => prev.map(p => ({ ...p, clips: p.clips.filter(c => c.id !== clipId) })));
      toast.success('Clip demo eliminado');
      return;
    }
    const { error } = await supabase.from('clips').delete().eq('id', clipId);
    if (error) { console.error('Error deleting clip:', error); toast.error('Error al eliminar clip'); return; }
    toast.success('Clip eliminado');
    setSelectedProject(prev => prev ? { ...prev, clips: prev.clips.filter(c => c.id !== clipId) } : prev);
    fetchProjects();
  }, [isDemo, fetchProjects]);

  // ─── UPDATE CLIP CONTENT ───
  const updateClipContent = useCallback(async (clipId: string, title: string, description: string) => {
    if (isDemo) {
      setSelectedProject(prev => prev ? {
        ...prev, clips: prev.clips.map(c => c.id === clipId ? { ...c, title, description } : c),
      } : prev);
      toast.success('Clip actualizado (demo)');
      return;
    }
    await supabase.from('clips').update({ title, description }).eq('id', clipId);
    setSelectedProject(prev => prev ? {
      ...prev, clips: prev.clips.map(c => c.id === clipId ? { ...c, title, description } : c),
    } : prev);
    fetchProjects();
  }, [isDemo, fetchProjects]);

  // ─── TOGGLE FAVORITE ───
  const toggleClipFavorite = useCallback(async (clipId: string) => {
    const clip = selectedProject?.clips.find(c => c.id === clipId);
    if (!clip) return;
    if (isDemo) {
      setSelectedProject(prev => prev ? {
        ...prev, clips: prev.clips.map(c => c.id === clipId ? { ...c, isFavorite: !c.isFavorite } : c),
      } : prev);
      return;
    }
    await supabase.from('clips').update({ is_favorite: !clip.isFavorite }).eq('id', clipId);
    setSelectedProject(prev => prev ? {
      ...prev, clips: prev.clips.map(c => c.id === clipId ? { ...c, isFavorite: !c.isFavorite } : c),
    } : prev);
    fetchProjects();
  }, [selectedProject, isDemo, fetchProjects]);

  // Toggle selection (local only)
  const toggleClipSelect = useCallback((clipId: string) => {
    setSelectedProject(prev => prev ? {
      ...prev, clips: prev.clips.map(c => c.id === clipId ? { ...c, isSelected: !c.isSelected } : c),
    } : prev);
  }, []);

  const selectAllClips = useCallback((select: boolean) => {
    const filteredIds = new Set(filteredClips.map(c => c.id));
    setSelectedProject(prev => prev ? {
      ...prev, clips: prev.clips.map(c => filteredIds.has(c.id) ? { ...c, isSelected: select } : c),
    } : prev);
  }, [filteredClips]);

  const exportSelectedClips = useCallback(() => {
    if (selectedClips.length === 0) return;
    toast.info(`Exportando ${selectedClips.length} clips seleccionados...`);
  }, [selectedClips]);

  // ─── DOWNLOAD CLIP ───
  const downloadClip = useCallback(async (clip: Clip) => {
    if (isDemo) {
      toast.info('Descarga simulada en modo demo');
      return;
    }
    if (!selectedProject?.videoStoragePath) { toast.error('No hay video almacenado para este proyecto'); return; }
    try {
      const { data, error } = await supabase.storage.from('videos').createSignedUrl(selectedProject.videoStoragePath, 3600);
      if (error || !data?.signedUrl) { toast.error('Error al generar enlace de descarga'); return; }
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = `${clip.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Descarga iniciada');
    } catch (e) { console.error('Download error:', e); toast.error('Error al descargar el clip'); }
  }, [selectedProject, isDemo]);

  // ─── PROCESS CLIP ───
  const processClip = useCallback(async (clip: Clip) => {
    if (isDemo) {
      setSelectedProject(prev => prev ? {
        ...prev, clips: prev.clips.map(c => c.id === clip.id ? { ...c, status: 'processing' as const } : c),
      } : prev);
      toast.info('Procesando clip (demo)...');
      setTimeout(() => {
        setSelectedProject(prev => prev ? {
          ...prev, clips: prev.clips.map(c => c.id === clip.id ? { ...c, status: 'ready' as const } : c),
        } : prev);
        setProjects(prev => prev.map(p => ({
          ...p, clips: p.clips.map(c => c.id === clip.id ? { ...c, status: 'ready' as const } : c),
        })));
        toast.success('Clip procesado (demo)');
      }, 3000);
      return;
    }
    if (!selectedProject?.videoStoragePath) { toast.error('No hay video almacenado para este proyecto'); return; }
    setSelectedProject(prev => prev ? {
      ...prev, clips: prev.clips.map(c => c.id === clip.id ? { ...c, status: 'processing' as const } : c),
    } : prev);
    toast.info('Enviando clip a procesar...');
    try {
      const res = await supabase.functions.invoke('process-video', {
        body: { clipId: clip.id, projectId: selectedProject.id, videoStoragePath: selectedProject.videoStoragePath, startTime: clip.startTime, endTime: clip.endTime, format: clip.format },
      });
      if (res.error) {
        toast.error('Error al procesar clip');
        setSelectedProject(prev => prev ? { ...prev, clips: prev.clips.map(c => c.id === clip.id ? { ...c, status: 'pending' as const } : c) } : prev);
        return;
      }
      toast.success('Clip enviado a procesar.');
      fetchProjects();
    } catch (e) {
      console.error('Process error:', e);
      toast.error('Error al conectar con el servicio de procesamiento');
      setSelectedProject(prev => prev ? { ...prev, clips: prev.clips.map(c => c.id === clip.id ? { ...c, status: 'pending' as const } : c) } : prev);
    }
  }, [selectedProject, isDemo, fetchProjects]);

  // ─── REGENERATE CLIP CONTENT ───
  const regenerateClipContent = useCallback(async (clipId: string) => {
    if (!selectedProject) return;
    const clip = selectedProject.clips.find(c => c.id === clipId);
    if (!clip) return;

    if (isDemo) {
      const titles = [
        "🔥 Momento clave del video", "💡 Insight que no puedes perder",
        "⚡ La parte más viral", "🎯 Contenido de alto impacto",
      ];
      const descs = [
        "Este clip tiene potencial viral. Perfecto para redes sociales. 📌",
        "Un momento clave que conecta con tu audiencia. 🎬",
      ];
      const newTitle = titles[Math.floor(Math.random() * titles.length)];
      const newDesc = descs[Math.floor(Math.random() * descs.length)];
      setSelectedProject(prev => prev ? {
        ...prev, clips: prev.clips.map(c => c.id === clipId ? { ...c, title: newTitle, description: newDesc } : c),
      } : prev);
      toast.success('Contenido regenerado (demo)');
      return;
    }

    toast.info('Regenerando con IA...');
    const index = selectedProject.clips.indexOf(clip);
    try {
      const res = await supabase.functions.invoke('generate-clip-content', {
        body: { videoName: selectedProject.originalVideoName, clipIndex: index, startTime: clip.startTime, endTime: clip.endTime, duration: clip.duration, format: clip.format },
      });
      if (res.data && !res.error && res.data.title && res.data.description) {
        await supabase.from('clips').update({ title: res.data.title, description: res.data.description }).eq('id', clipId);
        setSelectedProject(prev => prev ? {
          ...prev, clips: prev.clips.map(c => c.id === clipId ? { ...c, title: res.data.title, description: res.data.description } : c),
        } : prev);
        toast.success('Contenido regenerado');
        fetchProjects();
      } else { toast.error('Error al generar contenido'); }
    } catch (e) { console.error('Regenerate error:', e); toast.error('Error al conectar con IA'); }
  }, [selectedProject, isDemo, fetchProjects]);

  return {
    projects, selectedProject, stats, filterCounts, filteredClips,
    selectedClips, statusFilter, loading,
    setStatusFilter, createProject, selectProject, clearSelection,
    updateClipContent, toggleClipFavorite, toggleClipSelect,
    selectAllClips, exportSelectedClips,
    deleteProject, deleteClip, regenerateClipContent,
    downloadClip, processClip,
  };
};
