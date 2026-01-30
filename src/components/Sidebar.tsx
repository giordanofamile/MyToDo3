import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Star, 
  Calendar, 
  User, 
  Hash, 
  Plus,
  LogOut,
  Search,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { showError } from '@/utils/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarProps {
  activeList: string;
  setActiveList: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Sidebar = ({ activeList, setActiveList, searchQuery, setSearchQuery }: SidebarProps) => {
  const [customLists, setCustomLists] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUser();
    fetchLists();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchLists = async () => {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) showError(error.message);
    else setCustomLists(data || []);
  };

  const createNewList = async () => {
    const name = prompt("Nom de la nouvelle liste :");
    if (!name) return;

    const { data, error } = await supabase
      .from('lists')
      .insert([{ name, user_id: user.id }])
      .select();

    if (error) showError(error.message);
    else {
      setCustomLists([...customLists, data[0]]);
      setActiveList(data[0].id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const staticMenu = [
    { id: 'my-day', label: 'Ma journée', icon: Sun, color: 'text-blue-500' },
    { id: 'important', label: 'Important', icon: Star, color: 'text-pink-500' },
    { id: 'planned', label: 'Planifié', icon: Calendar, color: 'text-teal-500' },
    { id: 'tasks', label: 'Tâches', icon: Hash, color: 'text-blue-600' },
  ];

  return (
    <div className="w-72 h-screen bg-[#F5F5F7]/60 backdrop-blur-2xl border-r border-gray-200/50 flex flex-col p-6">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shadow-lg">
            <div className="w-4 h-4 border-2 border-white rounded-full" />
          </div>
          <span className="font-bold text-xl tracking-tight">iTodo</span>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Rechercher" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-200/40 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-500"
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
                  ? "bg-white shadow-md text-black" 
                  : "text-gray-500 hover:bg-white/50 hover:text-gray-900"
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
            <button onClick={createNewList} className="p-1 hover:bg-gray-200 rounded-md transition-colors">
              <Plus className="w-3 h-3 text-gray-500" />
            </button>
          </div>
          <nav className="space-y-1">
            {customLists.map((list) => (
              <button
                key={list.id}
                onClick={() => setActiveList(list.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  activeList === list.id 
                    ? "bg-white shadow-md text-black" 
                    : "text-gray-500 hover:bg-white/50 hover:text-gray-900"
                )}
              >
                <Hash className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-semibold truncate">{list.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="pt-6 mt-auto border-t border-gray-200/50">
        <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/50 transition-colors cursor-pointer group">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarImage src={`https://avatar.vercel.sh/${user?.email}`} />
            <AvatarFallback className="bg-blue-500 text-white">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;