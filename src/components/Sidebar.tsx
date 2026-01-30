import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Star, 
  Calendar, 
  User, 
  Hash, 
  Plus,
  LogOut,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface SidebarProps {
  activeList: string;
  setActiveList: (id: string) => void;
}

const Sidebar = ({ activeList, setActiveList }: SidebarProps) => {
  const menuItems = [
    { id: 'my-day', label: 'Ma journée', icon: Sun, color: 'text-blue-500' },
    { id: 'important', label: 'Important', icon: Star, color: 'text-pink-500' },
    { id: 'planned', label: 'Planifié', icon: Calendar, color: 'text-teal-500' },
    { id: 'assigned', label: 'Affecté à moi', icon: User, color: 'text-indigo-500' },
    { id: 'tasks', label: 'Tâches', icon: Hash, color: 'text-blue-600' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="w-72 h-screen bg-[#F5F5F7]/50 backdrop-blur-xl border-r border-gray-200/50 flex flex-col p-6">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white rounded-full" />
        </div>
        <span className="font-semibold text-lg tracking-tight">iTodo</span>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Rechercher" 
          className="w-full bg-gray-200/50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-0 placeholder:text-gray-500"
        />
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveList(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
              activeList === item.id 
                ? "bg-white shadow-sm text-black" 
                : "text-gray-500 hover:bg-gray-200/50 hover:text-gray-900"
            )}
          >
            <item.icon className={cn("w-5 h-5", item.color)} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-gray-200/50 space-y-2">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-gray-900 transition-colors">
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Nouvelle liste</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;