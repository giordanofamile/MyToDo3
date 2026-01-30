import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, X, CloudRain, Trees, Coffee as CoffeeIcon, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { showSuccess } from '@/utils/toast';
import { useSettings } from '@/hooks/use-settings';

interface PomodoroTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AMBIENCES = [
  { id: 'none', icon: VolumeX, label: 'Silence', url: '' },
  { id: 'rain', icon: CloudRain, label: 'Pluie', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'forest', icon: Trees, label: 'Forêt', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'cafe', icon: CoffeeIcon, label: 'Café', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

const PomodoroTimer = ({ isOpen, onClose }: PomodoroTimerProps) => {
  const { settings } = useSettings();
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [ambience, setAmbience] = useState('none');
  const [volume, setVolume] = useState([50]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialisation de l'audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Gestion de la lecture audio
  useEffect(() => {
    if (!audioRef.current) return;

    const currentAmbience = AMBIENCES.find(a => a.id === ambience);
    
    if (ambience === 'none' || !currentAmbience?.url) {
      audioRef.current.pause();
    } else {
      if (audioRef.current.src !== currentAmbience.url) {
        audioRef.current.src = currentAmbience.url;
      }
      audioRef.current.volume = volume[0] / 100;
      
      // On ne joue que si le timer est actif ou si l'utilisateur vient de changer d'ambiance
      if (isActive) {
        audioRef.current.play().catch(e => console.log("Audio play blocked by browser", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [ambience, isActive, volume]);

  // Mettre à jour le temps quand les réglages changent
  useEffect(() => {
    if (settings) {
      const workTime = (settings.pomodoro_work_duration || 25) * 60;
      const breakTime = (settings.pomodoro_short_break || 5) * 60;
      if (!isActive) {
        setTimeLeft(mode === 'work' ? workTime : breakTime);
      }
    }
  }, [settings, mode, isActive]);

  const totalTime = mode === 'work' 
    ? (settings?.pomodoro_work_duration || 25) * 60 
    : (settings?.pomodoro_short_break || 5) * 60;
    
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const saveFocusSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('focus_sessions').insert([
      { user_id: user.id, duration_minutes: settings?.pomodoro_work_duration || 25 }
    ]);
    showSuccess("Session de focus enregistrée !");
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    const workTime = (settings?.pomodoro_work_duration || 25) * 60;
    const breakTime = (settings?.pomodoro_short_break || 5) * 60;
    setTimeLeft(mode === 'work' ? workTime : breakTime);
  }, [mode, settings]);

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
      
      if (settings?.pomodoro_auto_start) {
        setIsActive(true);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, settings]);

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
          className="fixed bottom-32 right-8 z-50 w-80 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50 dark:border-white/10 p-6 overflow-hidden"
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

          <div className="flex items-center justify-center gap-4 mb-8">
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

          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ambiance</span>
              <div className="flex items-center gap-2">
                <Volume2 className="w-3 h-3 text-gray-400" />
                <Slider 
                  value={volume} 
                  onValueChange={setVolume} 
                  max={100} 
                  step={1} 
                  className="w-20"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {AMBIENCES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAmbience(item.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                    ambience === item.id 
                      ? "bg-blue-500 text-white shadow-lg scale-105" 
                      : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PomodoroTimer;