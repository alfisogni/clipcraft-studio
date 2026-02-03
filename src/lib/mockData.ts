/**
 * Mock data generator for ClipFlow
 * Simulates AI-generated clips from a long-form video
 */

import { Clip, Project, ClipStatus, VideoFormat } from '@/types';

// Generates compelling titles for social media clips
const clipTitleTemplates = [
  "🔥 El momento que cambió todo...",
  "💡 Esto nadie te lo explica así",
  "⚡ La clave está en los primeros 5 segundos",
  "🎯 El secreto que usan los profesionales",
  "📈 Cómo triplicar tu engagement",
  "🚀 La técnica viral del momento",
  "💪 Mindset de alto rendimiento",
  "🎬 Behind the scenes: la verdad",
  "✨ El tip que me hubiera gustado saber antes",
  "🔑 Desbloqueando el algoritmo",
];

// Social media optimized descriptions
const clipDescriptionTemplates = [
  "Descubre el insight que está cambiando la industria. Guarda este clip. 📌 #ContentCreator #VideoMarketing",
  "Este momento del video es oro puro. Si creas contenido, necesitas ver esto. 🎯 #CreadorDeContenido",
  "La diferencia entre creadores que crecen y los que no. Todo está aquí. 💡 #Growth #SocialMedia",
  "3 segundos que resumen 10 años de experiencia. No pierdas este insight. 🔥 #Viral #ContentTips",
  "El framework que uso para crear contenido que conecta. Explicado en 45 segundos. ⚡ #Storytelling",
  "Esto es lo que separa a los amateurs de los pros. Toma nota. 📝 #ProTips #VideoCreation",
];

/**
 * Generates a random ID
 */
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

/**
 * Gets a random item from an array
 */
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Generates a random duration between min and max seconds
 */
const getRandomDuration = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generates mock clips based on video duration and settings
 */
export const generateMockClips = (
  videoDuration: number,
  minClipDuration: number,
  maxClipDuration: number,
  format: VideoFormat
): Clip[] => {
  const clips: Clip[] = [];
  let currentTime = 0;
  let clipIndex = 0;

  // Generate clips until we've covered most of the video
  while (currentTime < videoDuration - minClipDuration) {
    const clipDuration = getRandomDuration(minClipDuration, maxClipDuration);
    const endTime = Math.min(currentTime + clipDuration, videoDuration);
    
    // Random status distribution: 40% ready, 40% pending, 20% processing
    const statusRoll = Math.random();
    let status: ClipStatus;
    if (statusRoll < 0.4) {
      status = 'ready';
    } else if (statusRoll < 0.8) {
      status = 'pending';
    } else {
      status = 'processing';
    }

    clips.push({
      id: generateId(),
      title: getRandomItem(clipTitleTemplates),
      description: getRandomItem(clipDescriptionTemplates),
      duration: endTime - currentTime,
      startTime: currentTime,
      endTime: endTime,
      status,
      format,
    });

    // Move to next segment with some gap
    currentTime = endTime + getRandomDuration(5, 30);
    clipIndex++;

    // Limit to reasonable number of clips
    if (clipIndex >= 8) break;
  }

  return clips;
};

/**
 * Generates a mock project with clips
 */
export const generateMockProject = (
  videoName: string,
  videoDuration: number,
  settings: {
    minClipDuration: number;
    maxClipDuration: number;
    outputFormat: VideoFormat;
  }
): Project => {
  const now = new Date();
  
  return {
    id: generateId(),
    name: videoName.replace(/\.[^/.]+$/, ''), // Remove extension
    createdAt: now,
    updatedAt: now,
    originalVideoName: videoName,
    originalVideoDuration: videoDuration,
    clips: generateMockClips(
      videoDuration,
      settings.minClipDuration,
      settings.maxClipDuration,
      settings.outputFormat
    ),
    settings: {
      minClipDuration: settings.minClipDuration,
      maxClipDuration: settings.maxClipDuration,
      outputFormat: settings.outputFormat,
    },
  };
};

/**
 * Sample projects for demo purposes
 */
export const sampleProjects: Project[] = [
  generateMockProject('masterclass-youtube-growth.mp4', 3600, {
    minClipDuration: 30,
    maxClipDuration: 60,
    outputFormat: 'vertical',
  }),
  generateMockProject('podcast-episode-127.mp4', 5400, {
    minClipDuration: 45,
    maxClipDuration: 90,
    outputFormat: 'vertical',
  }),
];
