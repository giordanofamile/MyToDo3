import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo = ({ className, size = 'md' }: LogoProps) => {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-24 h-24'
  };

  return (
    <div className={cn("relative flex items-center justify-center group", sizes[size], className)}>
      {/* Halo de lumière dynamique */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-500 rounded-[32%] blur-2xl opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700" />
      
      {/* Corps du logo avec Mesh Gradient */}
      <div className="relative w-full h-full rounded-[32%] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
        {/* Fond Mesh Gradient Animé */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5] via-[#9333EA] to-[#EC4899] animate-gradient-xy" />
        
        {/* Reflets de surface */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent" />
        
        {/* Coche en Glassmorphism */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/5 h-3/5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner flex items-center justify-center">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              className="w-3/4 h-3/4 text-white drop-shadow-lg" 
              stroke="currentColor" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path 
                d="M20 6L9 17l-5-5" 
                className="animate-[draw_0.8s_ease-out_forwards]"
                style={{ strokeDasharray: 50, strokeDashoffset: 50 }}
              />
            </svg>
          </div>
        </div>

        {/* Bordure lumineuse interne */}
        <div className="absolute inset-0 border border-white/20 rounded-[32%]" />
      </div>

      <style>{`
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 15s ease infinite;
        }
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
      `}</style>
    </div>
  );
};

export default Logo;