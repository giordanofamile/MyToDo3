import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo = ({ className, size = 'md' }: LogoProps) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };

  return (
    <div className={cn("relative flex items-center justify-center group", sizes[size], className)}>
      {/* Effet de halo lumineux en arrière-plan */}
      <div className="absolute inset-0 bg-blue-500/20 rounded-[30%] blur-xl group-hover:bg-blue-500/40 transition-all duration-500" />
      
      {/* Le Squircle principal */}
      <div className="relative w-full h-full bg-black dark:bg-white rounded-[30%] flex items-center justify-center shadow-2xl overflow-hidden transition-transform duration-500 group-hover:scale-105">
        {/* Dégradé de surface pour l'effet premium */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-black/5" />
        
        {/* L'icône de coche stylisée */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="w-1/2 h-1/2 text-white dark:text-black z-10" 
          stroke="currentColor" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path 
            d="M20 6L9 17l-5-5" 
            className="animate-[draw_0.6s_ease-out_forwards]"
            style={{ strokeDasharray: 50, strokeDashoffset: 50 }}
          />
        </svg>

        {/* Cercle de progression subtil */}
        <div className="absolute inset-1 border-[1.5px] border-white/10 dark:border-black/5 rounded-[28%]" />
      </div>

      <style>{`
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default Logo;