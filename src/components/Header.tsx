/**
 * Header Component
 * Main navigation header with branding and user info
 */

import React from 'react';
import { Plus, LogOut, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useDemo } from '@/contexts/DemoContext';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
  onNewProject: () => void;
  showNewButton?: boolean;
  user?: User;
  onSignOut?: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({ onNewProject, showNewButton = true, user, onSignOut }) => {
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const { isDemo } = useDemo();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(199,89%,48%)] shadow-lg">
              <Scissors className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold gradient-text">Clip Flow Studio</h1>
                {isDemo && (
                  <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-600 text-[10px] px-1.5 py-0 font-semibold animate-pulse">
                    DEMO
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Video Creator Tool</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {showNewButton && (
              <Button variant="gradient" onClick={onNewProject}>
                <Plus className="h-4 w-4" />
                Nuevo proyecto
              </Button>
            )}

            {user && (
              <div className="flex items-center gap-3 ml-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground hidden md:block">{displayName}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={onSignOut} title="Cerrar sesión">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
