import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Star, 
  Calendar, 
  Hash, 
  Plus,
  LogOut,
  Search,
  Moon,
  Trash2,
  Briefcase,
  ShoppingCart,
  Heart,
  Music,
  Book,
  Plane,
  Settings2,
  BarChart3,
  User as UserIcon,
  Archive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { showError, showSuccess } from '@/utils/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import ListDialog from './ListDialog';
import ProfileDialog from './ProfileDialog';

const ICON_MAP: Record<string, any> = {
  Hash, Briefcase, ShoppingCart, Heart, Star, Music, Book, Plane
};

interface SidebarProps {
  activeList: string;
  setActiveList: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Sidebar = ({ activeList, setActiveList, searchQuery, setSearchQuery }: SidebarProps) => {
  const [customLists, setCustomLists] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<any>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchUser();
    fetchLists();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) fetchProfile(user.id);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  };

  const fetchLists = async () => {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) showError(error.message);
    else setCustomLists(data || []);
  };

  const handleSaveList = async (listData: { name: string, icon: string, color: string }) => {
    if (editingList) {
      const { data, error } = await supabase
        .from('lists')
        .update(listData)
        .eq('id', editingList.id)
        .select();

      if (error) showError(error.message);
      else {
        setCustomLists(customLists.map(l => l.id === editingList.id ? data[0] : l));
        showSuccess("Liste mise à jour");
      }
    } else {
      const { data, error } = await supabase
        .from('lists')
        .insert([{ ...listData, user_id: user.id }])
        .select();

      if (error) showError(error.message);
      else {
        setCustomLists([...customLists, data[0]]);
        setActiveList(data[0].id);
        showSuccess("Liste créée");
      }
    }
    setEditingList(null);
  };

  const deleteList = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Supprimer cette liste et toutes ses tâches ?")) return;

    const { error } = await supabase.from('lists').delete().eq('id', id);
    if (error) showError(error.message);
    else {
      setCustomLists(customLists.filter(l => l.id !== id));
      if (activeList === id) setActiveList('my-day');
      showSuccess("Liste supprimée");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const staticMenu = [
    { id: 'dashboard', label: 'Insights', icon: BarChart3, color: 'text-indigo-500' },
    { id: 'my-day', label: 'Ma journée', icon: Sun, color: 'text-blue-500' },
    { id: 'important', label: 'Important', icon: Star, color: 'text-pink-500' },
    { id: 'planned', label: 'Planifié', icon: Calendar, color: 'text-teal-500' },
    { id: 'tasks', label: 'Tâches', icon: Hash, color: 'text-blue-600' },
    { id: 'archive', label: 'Archive', icon: Archive, color: 'text-gray-500' },
  ];

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim() 
    : user?.email?.split('@')[0];

  return (
    <div className="w-72 h-screen bg-[#F5F5F7]/60 dark:bg-[#1C1C1E]/60 backdrop-blur-2xl border-r border-gray-200/50 dark:border-white/10 flex flex-col p-6 transition-colors duration-500">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center shadow-lg">
            <div className="w-4 h-4 border-2 border-white dark:border-black rounded-full" />
          </div>
          <span className="font-bold text-xl tracking-tight dark:text-white">iTodo</span>
        </div>
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-gray-500" />}
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Rechercher" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-200/40 dark:bg-white/5 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-500 dark:text-white"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar">
        <nav className="space-y-1">
          {staticMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveList(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                activeList === item.id 
                  ? "bg-white dark:bg-white/10 shadow-md dark:shadow-none text-black dark:text-white" 
                  : "text-gray-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", item.color)} />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Mes Listes</span>
            <button 
              onClick={() => { setEditingList(null); setIsListDialogOpen(true); }} 
              className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md transition-colors"
            >
              <Plus className="w-3 h-3 text-gray-500" />
            </button>
          </div>
          <nav className="space-y-1">
            {customLists.map((list) => {
              const Icon = ICON_MAP[list.icon || 'Hash'] || Hash;
              return (
                <button
                  key={list.id}
                  onClick={() => setActiveList(list.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group",
                    activeList === list.id 
                      ? "bg-white dark:bg-white/10 shadow-md dark:shadow-none text-black dark:text-white" 
                      : "text-gray-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={cn("w-5 h-5", list.color || "text-gray-400")} />
                    <span className="text-sm font-semibold truncate">{list.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <Settings2 
                      className="w-4 h-4 text-gray-300 hover:text-blue-500 cursor-pointer" 
                      onClick={(e) => { e.stopPropagation(); setEditingList(list); setIsListDialogOpen(true); }}
                    />
                    <Trash2 
                      className="w-4 h-4 text-gray-300 hover:text-red-500 cursor-pointer" 
                      onClick={(e) => deleteList(e, list.id)}
                    />
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="pt-6 mt-auto border-t border-gray-200/50 dark:border-white/10">
        <div 
          onClick={() => setIsProfileDialogOpen(true)}
          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
        >
          <Avatar className="h-10 w-10 border-2 border-white dark:border-white/10 shadow-sm">
            <AvatarImage src={`https://avatar.vercel.sh/${user?.email}`} />
            <AvatarFallback className="bg-blue-500 text-white">
              {displayName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{displayName}</p>
            <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); handleLogout(); }} 
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ListDialog 
        isOpen={isListDialogOpen}
        onClose={() => { setIsListDialogOpen(false); setEditingList(null); }}
        onSave={handleSaveList}
        initialData={editingList}
      />

      <ProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
        onUpdate={() => fetchUser()}
      />
    </div>
  );
};

export default Sidebar;