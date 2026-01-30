import React from 'react';
import { 
  LayoutList, LayoutGrid, Trello, BarChart3, 
  CalendarDays, Clock, GanttChart, FileBarChart,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

export type ViewType = 'list' | 'grid' | 'kanban' | 'dashboard' | 'calendar' | 'timeline' | 'gantt' | 'reports';

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const VIEWS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3, color: 'text-indigo-500' },
  { id: 'list', label: 'Liste détaillée', icon: LayoutList, color: 'text-blue-500' },
  { id: 'grid', label: 'Grille riche', icon: LayoutGrid, color: 'text-pink-500' },
  { id: 'kanban', label: 'Kanban', icon: Trello, color: 'text-orange-500' },
  { id: 'calendar', label: 'Calendrier', icon: CalendarDays, color: 'text-teal-500' },
  { id: 'timeline', label: 'Timeline', icon: Clock, color: 'text-purple-500' },
  { id: 'gantt', label: 'Gantt', icon: GanttChart, color: 'text-emerald-500' },
  { id: 'reports', label: 'Rapports', icon: FileBarChart, color: 'text-amber-500' },
];

const ViewSwitcher = ({ currentView, onViewChange }: ViewSwitcherProps) => {
  const activeView = VIEWS.find(v => v.id === currentView) || VIEWS[1];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 px-4 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-sm hover:shadow-md transition-all gap-2">
          <activeView.icon className={cn("w-4 h-4", activeView.color)} />
          <span className="text-xs font-bold uppercase tracking-widest">{activeView.label}</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-[2rem] p-2 border-none shadow-2xl bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-2xl">
        {VIEWS.map((view) => (
          <DropdownMenuItem
            key={view.id}
            onClick={() => onViewChange(view.id as ViewType)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all mb-1 last:mb-0",
              currentView === view.id ? "bg-blue-500/10 text-blue-600" : "hover:bg-gray-100 dark:hover:bg-white/5"
            )}
          >
            <view.icon className={cn("w-4 h-4", view.color)} />
            <span className="text-sm font-bold">{view.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ViewSwitcher;