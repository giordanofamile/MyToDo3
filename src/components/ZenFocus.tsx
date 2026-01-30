import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Wind, 
  Brain, 
  Timer,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ZenFocusProps {
  task: any;
  onClose: () => void;
  onToggleComplete: (id: string, completed: boolean) => void;
}

const ZenFocus = ({ task, onClose, onToggleComplete }: ZenFocusProps) => {
  const [step, setStep] = useState<'breathe' | 'focus'>('breathe');
  const [breathingState, setBreathingState] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  useEffect(() => {
    if (step === 'breathe') {
      const timer = setInterval(() => {
        setBreathingState(prev => {
          if (prev === 'inhale') return 'hold';
          if (prev === 'hold') return 'exhale';
          return 'inhale';
        });
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [step]);

  const getBreathingText = () => {
    if (breathingState === 'inhale') return 'Inspirez...';
    if (breathingState === 'hold') return 'Retenez...';
    return 'Expirez...';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white dark:bg-[#1C1C1E] flex flex-col items-center justify-center p-8"
    >
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClose}
        className="absolute top-8 right-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
      >
        <X className="w-6 h-6 text-gray-400" />
      </Button>

      <AnimatePresence mode="wait">
        {step === 'breathe' ? (
          <motion.div 
            key="breathe"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center space-y-12"
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tight dark:text-white">Prenez un instant</h2>
              <p className="text-gray-500 font-medium">Centrez votre esprit avant de commencer.</p>
            </div>

            <div className="relative flex items-center justify-center">
              <motion.div 
                animate={{ 
                  scale: breathingState === 'inhale' ? 1.5 : breathingState === 'hold' ? 1.5 : 1,
                  opacity: breathingState === 'inhale' ? 0.5 : 0.2
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className="absolute w-64 h-64 bg-blue-500 rounded-full blur-3xl"
              />
              <motion.div 
                animate={{ 
                  scale: breathingState === 'inhale' ? 1.2 : breathingState === 'hold' ? 1.2 : 1
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className="relative w-48 h-48 border-4 border-blue-500/30 rounded-full flex items-center justify-center"
              >
                <Wind className="w-12 h-12 text-blue-500" />
              </motion.div>
            </div>

            <motion.p 
              key={breathingState}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-blue-500"
            >
              {getBreathingText()}
            </motion.p>

            <Button 
              onClick={() => setStep('focus')}
              className="bg-black dark:bg-white dark:text-black rounded-2xl px-8 h-14 font-bold text-lg shadow-xl"
            >
              Je suis prêt
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            key="focus"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full space-y-12 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest">
              <Brain className="w-4 h-4" />
              Focus Profond
            </div>

            {task ? (
              <div className="space-y-8">
                <h1 className="text-5xl sm:text-7xl font-black tracking-tighter dark:text-white leading-tight">
                  {task.title}
                </h1>
                {task.notes && (
                  <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-lg mx-auto">
                    {task.notes}
                  </p>
                )}
                
                <div className="pt-12 flex flex-col items-center gap-6">
                  <Button 
                    onClick={() => onToggleComplete(task.id, !task.is_completed)}
                    className={cn(
                      "h-20 px-12 rounded-[2.5rem] text-xl font-bold transition-all shadow-2xl",
                      task.is_completed 
                        ? "bg-green-500 hover:bg-green-600 text-white" 
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    )}
                  >
                    {task.is_completed ? (
                      <><CheckCircle2 className="w-8 h-8 mr-3" /> Terminée !</>
                    ) : (
                      <><Circle className="w-8 h-8 mr-3" /> Marquer comme fait</>
                    )}
                  </Button>
                  
                  <p className="text-gray-400 font-medium flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    Appuyez sur P pour lancer le minuteur
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h1 className="text-5xl font-black tracking-tight dark:text-white">Rien n'est sélectionné</h1>
                <p className="text-xl text-gray-500">Choisissez une tâche pour commencer votre session de focus.</p>
                <Button onClick={onClose} variant="outline" className="rounded-2xl h-12 px-8">
                  Retour à la liste
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-4">
        <div className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-white/5 rounded-full">
          <div className={cn("w-2 h-2 rounded-full", step === 'breathe' ? "bg-blue-500" : "bg-gray-300")} />
          <div className={cn("w-2 h-2 rounded-full", step === 'focus' ? "bg-blue-500" : "bg-gray-300")} />
        </div>
      </div>
    </motion.div>
  );
};

export default ZenFocus;