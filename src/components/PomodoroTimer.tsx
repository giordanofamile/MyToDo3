import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { showSuccess } from '@/utils/toast';

interface PomodoroTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PomodoroTimer = ({ isOpen, onClose }: PomodoroTimerProps) => {
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  const totalTime = mode === 'work' ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const saveFocusSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('focus_sessions').insert([
      { user_id: user.id, duration_minutes: 25 }
    ]);
    showSuccess("Session de focus enregistrée !");
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  }, [mode]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'work') {
        saveFocusSession();
      }
      const newMode = mode === 'work' ? 'break' : 'work';
      setMode(newMode);
      setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-32 right-8 z-50 w-72 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50 dark:border-white/10 p-6 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {mode === 'work' ? (
                <Brain className="w-5 h-5 text-orange-500" />
              ) : (
                <Coffee className="w-5 h-5 text-blue-500" />
              )}
              <span className="font-bold text-sm uppercase tracking-widest text-gray-500">
                {mode === 'work' ? 'Focus' : 'Pause'}
              </span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="text-center mb-6">
            <motion.h2 
              key={timeLeft}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-5xl font-black tracking-tighter tabular-nums dark:text-white"
            >
              {formatTime(timeLeft)}
            </motion.h2>
          </div>

          <Progress 
            value={progress} 
            className={cn(
              "h-1.5 mb-8 bg-gray-100 dark:bg-white/5",
              mode === 'work' ? "[&>div]:bg-orange-500" : "[&>div]:bg-blue-500"
            )} 
          />

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={resetTimer}
              className="rounded-full h-12 w-12 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <RotateCcw className="w-5 h-5 text-gray-500" />
            </Button>
            <Button
              onClick={toggleTimer}
              className={cn(
                "h-16 w-16 rounded-full shadow-xl transition-all active:scale-95",
                isActive 
                  ? "bg-gray-100 dark:bg-white/10 text-black dark:text-white" 
                  : mode === 'work' ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
              )}
            >
              {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setMode(mode === 'work' ? 'break' : 'work');
                resetTimer();
              }}
              className="rounded-full h-12 w-12 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              {mode === 'work' ? <Coffee className="w-5 h-5 text-gray-500" /> : <Brain className="w-5 h-5 text-gray-500" />}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PomodoroTimer;