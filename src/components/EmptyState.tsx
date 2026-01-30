import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Search, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  type: 'no-tasks' | 'no-search' | 'all-done';
  title: string;
  description: string;
}

const EmptyState = ({ type, title, description }: EmptyStateProps) => {
  const icons = {
    'no-tasks': ClipboardList,
    'no-search': Search,
    'all-done': CheckCircle2,
  };

  const Icon = icons[type];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
        <div className="relative w-20 h-20 bg-white dark:bg-white/5 rounded-[2rem] shadow-xl flex items-center justify-center border border-gray-100 dark:border-white/10">
          <Icon className="w-10 h-10 text-blue-500" />
          {type === 'all-done' && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-yellow-500 fill-current" />
            </motion.div>
          )}
        </div>
      </div>
      <h3 className="text-xl font-black tracking-tight dark:text-white mb-2">{title}</h3>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-[250px] leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

export default EmptyState;