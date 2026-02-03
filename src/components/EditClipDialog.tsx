/**
 * EditClipDialog Component
 * Modal dialog for editing clip title and description
 */

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Clip } from '@/types';

interface EditClipDialogProps {
  clip: Clip | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (clipId: string, title: string, description: string) => void;
}

export const EditClipDialog: React.FC<EditClipDialogProps> = ({
  clip,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Update form when clip changes
  useEffect(() => {
    if (clip) {
      setTitle(clip.title);
      setDescription(clip.description);
    }
  }, [clip]);

  const handleSave = () => {
    if (clip && title.trim()) {
      onSave(clip.id, title.trim(), description.trim());
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen || !clip) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="w-full max-w-lg glass-card rounded-xl p-6 shadow-lg animate-slide-up mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Editar Clip</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Title field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Título
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del clip..."
              className="bg-secondary/50"
            />
          </div>

          {/* Description field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Descripción
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción optimizada para redes sociales..."
              className="bg-secondary/50 min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {description.length}/300 caracteres recomendados
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            variant="gradient" 
            className="flex-1"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            <Save className="h-4 w-4" />
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
};
