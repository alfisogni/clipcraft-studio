/**
 * Core types for ClipFlow - Video Creator Automation Tool
 */

export type ClipStatus = 'pending' | 'processing' | 'ready';

export type VideoFormat = 'vertical' | 'horizontal';

export type StatusFilter = 'all' | 'pending' | 'ready' | 'processing' | 'favorites';

export interface Clip {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  startTime: number; // timestamp in original video
  endTime: number;
  status: ClipStatus;
  format: VideoFormat;
  thumbnailUrl?: string;
  isFavorite?: boolean; // New: mark as favorite
  isSelected?: boolean; // New: for batch export
}

export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  originalVideoName: string;
  originalVideoDuration: number; // in seconds
  clips: Clip[];
  settings: ProjectSettings;
}

export interface ProjectSettings {
  minClipDuration: number; // in seconds
  maxClipDuration: number;
  outputFormat: VideoFormat;
}

export interface UploadState {
  file: File | null;
  progress: number;
  isUploading: boolean;
  error: string | null;
}

export interface DashboardStats {
  totalProjects: number;
  totalClips: number;
  pendingClips: number;
  readyClips: number;
}
