import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface TagBadgeProps {
  tag: string;
  onRemove?: (tag: string) => void;
  className?: string;
}

const TagBadge = ({ tag, onRemove, className }: TagBadgeProps) => {
  // Génère une couleur déterministe basée sur le texte du tag
  const getTagColor = (text: string) => {
    const colors = [
      'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
      'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
      'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
      'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
      'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400',
      'bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400',
    ];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
      getTagColor(tag),
      className
    )}>
      {tag}
      {onRemove && (
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(tag); }}
          className="hover:opacity-70 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

export default TagBadge;