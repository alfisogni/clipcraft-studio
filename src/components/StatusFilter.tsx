/**
 * StatusFilter Component
 * Filter tabs for clip status
 */

import React from 'react';
import { Filter, Clock, CheckCircle2, Loader2, Star } from 'lucide-react';
import { StatusFilter as FilterType } from '@/types';
import { cn } from '@/lib/utils';

interface StatusFilterProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    pending: number;
    ready: number;
    processing: number;
    favorites: number;
  };
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  currentFilter,
  onFilterChange,
  counts,
}) => {
  const filters: { key: FilterType; label: string; icon: React.ElementType; color?: string }[] = [
    { key: 'all', label: 'Todos', icon: Filter },
    { key: 'favorites', label: 'Favoritos', icon: Star, color: 'text-warning' },
    { key: 'ready', label: 'Listos', icon: CheckCircle2, color: 'text-success' },
    { key: 'pending', label: 'Pendientes', icon: Clock, color: 'text-warning' },
    { key: 'processing', label: 'Procesando', icon: Loader2, color: 'text-primary' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const count = counts[filter.key];
        const isActive = currentFilter === filter.key;
        const Icon = filter.icon;

        return (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className={cn(
              "h-4 w-4",
              !isActive && filter.color
            )} />
            <span>{filter.label}</span>
            <span className={cn(
              "ml-1 px-1.5 py-0.5 rounded-full text-xs",
              isActive
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
