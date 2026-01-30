import React, { useEffect, useState } from 'react';
import { 
  Sun, Star, Calendar, Hash, Plus, LogOut, Search, Moon, Trash2, 
  Settings2, BarChart3, CalendarDays, ChevronRight, ChevronDown,
  FolderPlus
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { showError, showSuccess } from '@/utils/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import ListDialog from './ListDialog';
import ProfileDialog from './ProfileDialog';
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
  const [editingList, setEditingList] = useState<any>(null);
  const [expandedLists, setExpandedLists] = useState<Set<string>>(new Set());
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

  const handleDeleteList = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette liste et toutes ses tâches ?")) return;
    
    const { error } = await supabase.from('lists').delete().eq('id', id);
    if (error) showError(error.message);
    else {
      onListsUpdate();
      if (activeList === id) setActiveList('my-day');
      showSuccess("Liste supprimée");
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
      <div className={cn("space-y-1", depth > 0 && "ml-4 border-l border-gray-200 dark:border-white/5 pl-2")}>
        {children.map((list) => {
          const Icon = (LucideIcons as any)[list.icon || 'Hash'] || Hash;
          const hasChildren = lists.some(l => l.parent_id === list.id);
          const isExpanded = expandedLists.has(list.id);
          const isActive = activeList === list.id;

          return (
            <div key={list.id} className="space-y-1">
              <button
                onClick={() => setActiveList(list.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-white dark:bg-white/10 shadow-sm text-black dark:text-white" 
                    : "text-gray-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {hasChildren && (
                    <div onClick={(e) => toggleExpand(e, list.id)} className="p-0.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md">
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </div>
                  )}
                  <Icon className={cn("w-4 h-4 flex-shrink-0", list.color || "text-gray-400")} />
                  <span className="text-sm font-semibold truncate">{list.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {counts[list.id] > 0 && (
                    <span className={cn(
                      "text-[9px] font-black px-1.5 py-0.5 rounded-full",
                      list.color?.replace('text-', 'bg-') || 'bg-gray-200',
                      "bg-opacity-10 text-opacity-100"
                    )}>
                      {counts[list.id]}
                    </span>
                  )}
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditingList({ parent_id: list.id }); 
                        setIsListDialogOpen(true); 
                      }}
                      className="p-1 hover:bg-blue-500/10 rounded-md transition-colors"
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-blue-500" />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditingList(list); 
                        setIsListDialogOpen(true); 
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md transition-colors"
                    >
                      <Settings2 className="w-3.5 h-3.5 text-gray-300 hover:text-blue-500" />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDeleteList(list.id);
                      }}
                      className="p-1 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </button>
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
    <div className="w-72 h-screen bg-[#F5F5F7]/60 dark:bg-[#1C1C1E]/60 backdrop-blur-2xl border-r border-gray-200/50 dark:border-white/10 flex flex-col p-6">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="font-black text-xl tracking-tighter dark:text-white">iTodo</span>
        </div>
        {mounted && (
          <button 
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} 
            className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-transform active:scale-90"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-yellow-500" />
            ) : (
              <Moon className="w-4 h-4 text-gray-500" />
            )}
          </button>
        )}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input type="text" placeholder="Rechercher" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-200/40 dark:bg-white/5 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar">
        <nav className="space-y-1">
          {staticMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveList(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200",
                activeList === item.id ? "bg-white dark:bg-white/10 shadow-md text-black dark:text-white" : "text-gray-500 hover:bg-white/50 dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", item.color)} />
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
              {counts[item.id] > 0 && <span className="text-[10px] font-bold bg-gray-200/50 dark:bg-white/10 px-2 py-0.5 rounded-full">{counts[item.id]}</span>}
            </button>
          ))}
        </nav>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Mes Listes</span>
            <button onClick={() => { setEditingList(null); setIsListDialogOpen(true); }} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md">
              <Plus className="w-3 h-3 text-gray-500" />
            </button>
          </div>
          {renderListTree()}
        </div>
      </div>

      <div className="pt-6 mt-auto border-t border-gray-200/50 dark:border-white/10">
        <div onClick={() => setIsProfileDialogOpen(true)} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 cursor-pointer">
          <Avatar className="h-10 w-10 border-2 border-white dark:border-white/10 shadow-sm">
            <AvatarImage src={`https://avatar.vercel.sh/${user?.email}`} />
            <AvatarFallback className="bg-blue-500 text-white">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{profile?.first_name || user?.email?.split('@')[0]}</p>
            <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); supabase.auth.signOut(); }} className="p-2 text-gray-400 hover:text-red-500">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ListDialog isOpen={isListDialogOpen} onClose={() => { setIsListDialogOpen(false); setEditingList(null); }} onSave={handleSaveList} initialData={editingList} />
      <ProfileDialog isOpen={isProfileDialogOpen} onClose={() => setIsProfileDialogOpen(false)} onUpdate={() => fetchUser()} />
    </div>
  );
};

export default Sidebar;