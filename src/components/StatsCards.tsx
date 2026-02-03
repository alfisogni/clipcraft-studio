/**
 * StatsCards Component
 * Dashboard statistics overview
 */

import React from 'react';
import { Folder, Film, Clock, CheckCircle2 } from 'lucide-react';
import { DashboardStats } from '@/types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const statItems = [
    {
      label: 'Proyectos',
      value: stats.totalProjects,
      icon: Folder,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
    {
      label: 'Total clips',
      value: stats.totalClips,
      icon: Film,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
    {
      label: 'Pendientes',
      value: stats.pendingClips,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/20',
    },
    {
      label: 'Listos',
      value: stats.readyClips,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div
          key={item.label}
          className="glass-card rounded-xl p-4 animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bgColor}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
