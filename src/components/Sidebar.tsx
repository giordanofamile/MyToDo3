import React, { useEffect, useState } from 'react';
import { 
  Sun, Star, Calendar, Hash, Plus, LogOut, Search, Moon, Trash2, 
  Settings2, BarChart3, CalendarDays, ChevronRight, ChevronDown,
  FolderPlus, Settings, GripVertical
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { showError, showSuccess } from '@/utils/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import ListDialog from './ListDialog';
import ProfileDialog from './ProfileDialog';
import SettingsDialog from './SettingsDialog';
import Logo from './Logo';

interface SidebarProps {
  activeList: string;
  setActiveList: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  lists: any[];
  onListsUpdate: () => void;
}

const Sidebar = ({ activeList, setActiveList, searchQuery, setSearchQuery, lists, onListsUpdate }: SidebarProps) => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<any>(null);
  const [expandedLists, setExpandedLists] = useState<Set<string>>(new Set());
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetchUser();
    fetchCounts();
  }, [lists]);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) fetchProfile(user.id);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
  };

  const fetchCounts = async () => {
    const { data: tasks } = await supabase.from('tasks').select('id, list_id, is_important, due_date, is_completed, is_archived').eq('is_completed', false).eq('is_archived', false);
    if (!tasks) return;
    const newCounts: Record<string, number> = {
      'my-day': tasks.filter(t => !t.list_id).length,
      'important': tasks.filter(t => t.is_important).length,
      'planned': tasks.filter(t => t.due_date).length,
      'calendar': tasks.filter(t => t.due_date).length,
      'tasks': tasks.length,
    };
    tasks.forEach(t => { if (t.list_id) newCounts[t.list_id] = (newCounts[t.list_id] || 0) + 1; });
    setCounts(newCounts);
  };

  const handleSaveList = async (listData: any) => {
    if (editingList?.id) {
      const { error } = await supabase.from('lists').update(listData).eq('id', editingList.id);
      if (error) showError(error.message);
      else {
        onListsUpdate();
        showSuccess("Liste mise à jour");
      }
    } else {
      const { data, error } = await supabase.from('lists').insert([{ ...listData, user_id: user.id }]).select();
      if (error) showError(error.message);
      else {
        onListsUpdate();
        setActiveList(data[0].id);
        showSuccess("Liste créée");
      }
    }
    setEditingList(null);
  };

  const onDragStart = (e: React.DragEvent, id: string, type: 'list' | 'task') => {
    e.dataTransfer.setData('id', id);
    e.dataTransfer.setData('type', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const onDrop = async (e: React.DragEvent, targetListId: string) => {
    e.preventDefault();
    setDragOverId(null);
    const id = e.dataTransfer.getData('id');
    const type = e.dataTransfer.getData('type');

    if (id === targetListId) return;

    try {
      if (type === 'list') {
        const { error } = await supabase
          .from('lists')
          .update({ parent_id: targetListId === 'root' ? null : targetListId })
          .eq('id', id);
        if (error) throw error;
        showSuccess("Hiérarchie mise à jour");
        onListsUpdate();
      } else if (type === 'task') {
        let updates: any = {};
        
        // Gestion intelligente des listes spéciales
        if (targetListId === 'important') {
          updates.is_important = true;
        } else if (targetListId === 'my-day') {
          updates.list_id = null;
        } else if (['planned', 'calendar', 'tasks', 'dashboard'].includes(targetListId)) {
          // On ne change rien de spécial pour ces vues globales
        } else {
          updates.list_id = targetListId;
        }

        const { error } = await supabase
          .from('tasks')
          .update(updates)
          .eq('id', id);
        
        if (error) throw error;
        showSuccess("Tâche déplacée");
        fetchCounts();
        window.dispatchEvent(new CustomEvent('task-moved'));
      }
    } catch (error: any) {
      showError(error.message);
    }
  };

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedLists);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedLists(newExpanded);
  };

  const renderListTree = (parentId: string | null = null, depth = 0) => {
    const children = lists.filter(l => l.parent_id === parentId);
    if (children.length === 0) return null;

    return (
      <div className={cn("space-y-0.5", depth > 0 && "ml-3 border-l border-gray-200 dark:border-white/5 pl-2")}>
        {children.map((list) => {
          const Icon = (LucideIcons as any)[list.icon || 'Hash'] || Hash;
          const hasChildren = lists.some(l => l.parent_id === list.id);
          const isExpanded = expandedLists.has(list.id);
          const isActive = activeList === list.id;
          const isDragOver = dragOverId === list.id;

          return (
            <div key={list.id} className="space-y-0.5">
              <div
                draggable
                onDragStart={(e) => onDragStart(e, list.id, 'list')}
                onDragOver={(e) => onDragOver(e, list.id)}
                onDragLeave={() => setDragOverId(null)}
                onDrop={(e) => onDrop(e, list.id)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-white dark:bg-white/10 shadow-sm text-black dark:text-white" 
                    : "text-gray-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white",
                  isDragOver && "ring-2 ring-blue-500 bg-blue-500/10"
                )}
              >
                <div className="flex items-center gap-2 truncate flex-1" onClick={() => setActiveList(list.id)}>
                  {hasChildren && (
                    <div onClick={(e) => toggleExpand(e, list.id)} className="p-0.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md">
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </div>
                  )}
                  <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", list.color || "text-gray-400")} />
                  <span className="text-xs font-semibold truncate">{list.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {counts[list.id] > 0 && (
                    <span className={cn(
                      "text-[8px] font-black px-1.5 py-0.5 rounded-md",
                      list.color?.replace('text-', 'bg-') || 'bg-gray-200',
                      "bg-opacity-10 text-opacity-100"
                    )}>
                      {counts[list.id]}
                    </span>
                  )}
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditingList({ parent_id: list.id }); 
                        setIsListDialogOpen(true); 
                      }}
                      className="p-1 hover:bg-blue-500/10 rounded-md transition-colors"
                    >
                      <FolderPlus className="w-3 h-3 text-blue-500" />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditingList(list); 
                        setIsListDialogOpen(true); 
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md transition-colors"
                    >
                      <Settings2 className="w-3 h-3 text-gray-300 hover:text-blue-500" />
                    </button>
                  </div>
                </div>
              </div>
              {isExpanded && renderListTree(list.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  const staticMenu = [
    { id: 'dashboard', label: 'Insights', icon: BarChart3, color: 'text-indigo-500' },
    { id: 'my-day', label: 'Ma journée', icon: Sun, color: 'text-blue-500' },
    { id: 'important', label: 'Important', icon: Star, color: 'text-pink-500' },
    { id: 'planned', label: 'Planifié', icon: Calendar, color: 'text-teal-500' },
    { id: 'calendar', label: 'Calendrier', icon: CalendarDays, color: 'text-orange-500' },
    { id: 'tasks', label: 'Tâches', icon: Hash, color: 'text-blue-600' },
  ];

  return (
    <div className="w-64 h-screen bg-[#F5F5F7]/60 dark:bg-[#1C1C1E]/60 backdrop-blur-2xl border-r border-gray-200/50 dark:border-white/10 flex flex-col p-5">
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2.5">
          <Logo size="sm" className="w-8 h-8" />
          <span className="font-black text-lg tracking-tighter dark:text-white">iTodo</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button 
            onClick={() => setIsSettingsDialogOpen(true)} 
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-transform active:scale-90"
          >
            <Settings className="w-3.5 h-3.5 text-gray-500" />
          </button>
          {mounted && (
            <button 
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} 
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-transform active:scale-90"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-yellow-500" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-gray-500" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
        <input type="text" placeholder="Rechercher" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-200/40 dark:bg-white/5 border-none rounded-lg py-1.5 pl-8 pr-3 text-xs focus:ring-1 focus:ring-blue-500/20 transition-all" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 custom-scrollbar">
        <nav className="space-y-0.5">
          {staticMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveList(item.id)}
              onDragOver={(e) => onDragOver(e, item.id)}
              onDragLeave={() => setDragOverId(null)}
              onDrop={(e) => onDrop(e, item.id)}
              className={cn(
                "w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all duration-200",
                activeList === item.id ? "bg-white dark:bg-white/10 shadow-sm text-black dark:text-white" : "text-gray-500 hover:bg-white/50 dark:hover:bg-white/5",
                dragOverId === item.id && "ring-2 ring-blue-500 bg-blue-500/10"
              )}
            >
              <div className="flex items-center gap-2.5">
                <item.icon className={cn("w-4 h-4", item.color)} />
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
              {counts[item.id] > 0 && <span className="text-[9px] font-bold bg-gray-200/50 dark:bg-white/10 px-1.5 py-0.5 rounded-md">{counts[item.id]}</span>}
            </button>
          ))}
        </nav>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-2.5 mb-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Mes Listes</span>
            <button onClick={() => { setEditingList(null); setIsListDialogOpen(true); }} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md">
              <Plus className="w-3 h-3 text-gray-500" />
            </button>
          </div>
          {renderListTree()}
          
          <div 
            onDragOver={(e) => onDragOver(e, 'root')}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => onDrop(e, 'root')}
            className={cn(
              "h-8 border-2 border-dashed border-transparent rounded-lg flex items-center justify-center transition-all",
              dragOverId === 'root' && "border-blue-500 bg-blue-500/5"
            )}
          >
            {dragOverId === 'root' && <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Déposer ici pour la racine</span>}
          </div>
        </div>
      </div>

      <div className="pt-4 mt-auto border-t border-gray-200/50 dark:border-white/10">
        <div onClick={() => setIsProfileDialogOpen(true)} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 cursor-pointer">
          <Avatar className="h-8 w-8 border border-white dark:border-white/10 shadow-sm">
            <AvatarImage src={`https://avatar.vercel.sh/${user?.email}`} />
            <AvatarFallback className="bg-blue-500 text-white text-[10px]">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{profile?.first_name || user?.email?.split('@')[0]}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); supabase.auth.signOut(); }} className="p-1.5 text-gray-400 hover:text-red-500">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ListDialog isOpen={isListDialogOpen} onClose={() => { setIsListDialogOpen(false); setEditingList(null); }} onSave={handleSaveList} initialData={editingList} />
      <ProfileDialog isOpen={isProfileDialogOpen} onClose={() => setIsProfileDialogOpen(false)} onUpdate={() => fetchUser()} />
      <SettingsDialog isOpen={isSettingsDialogOpen} onClose={() => setIsSettingsDialogOpen(false)} />
    </div>
  );
};

export default Sidebar;