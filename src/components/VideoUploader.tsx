/**
 * VideoUploader Component
 * Handles video file upload with drag-and-drop support
 */

import React, { useCallback, useState } from 'react';
import { Upload, Film, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  onFileSelect,
  selectedFile,
  onClear,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('video/')) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (selectedFile) {
    return (
      <div className="glass-card rounded-xl p-6 animate-fade-in">
        <div className="flex items-center gap-4">
          {/* Video icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/20">
            <Film className="h-7 w-7 text-primary" />
          </div>
          
          {/* File info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {selectedFile.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          
          {/* Clear button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "upload-zone rounded-xl p-12 text-center transition-all duration-300",
        isDragOver && "upload-zone-active"
      )}
    >
      <input
        type="file"
        accept="video/*"
        onChange={handleFileInput}
        className="hidden"
        id="video-upload"
      />
      
      <label htmlFor="video-upload" className="cursor-pointer block">
        <div className="flex flex-col items-center gap-4">
          {/* Upload icon with glow effect */}
          <div className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full bg-secondary transition-all duration-300",
            isDragOver && "bg-primary/20 scale-110"
          )}>
            <Upload className={cn(
              "h-8 w-8 text-muted-foreground transition-colors",
              isDragOver && "text-primary"
            )} />
          </div>
          
          {/* Instructions */}
          <div>
            <p className="text-lg font-medium text-foreground">
              {isDragOver ? "Suelta el video aquí" : "Arrastra tu video o haz clic"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Formatos soportados: MP4, MOV, AVI
            </p>
          </div>
          
          {/* Browse button */}
          <Button variant="outline" size="lg" className="mt-2">
            Explorar archivos
          </Button>
        </div>
      </label>
    </div>
  );
};
