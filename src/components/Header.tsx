/**
 * Header Component
 * Main navigation header with branding
 */

import React from 'react';
import { Scissors, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onNewProject: () => void;
  showNewButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNewProject, showNewButton = true }) => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(199,89%,48%)] shadow-lg">
              <Scissors className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">ClipFlow</h1>
              <p className="text-xs text-muted-foreground">Video Creator Tool</p>
            </div>
          </div>

          {/* Actions */}
          {showNewButton && (
            <Button variant="gradient" onClick={onNewProject}>
              <Plus className="h-4 w-4" />
              Nuevo proyecto
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
