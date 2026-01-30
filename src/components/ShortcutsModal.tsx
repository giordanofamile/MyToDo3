import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Command, Keyboard, MousePointer2, Zap } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutItem = ({ keys, label }: { keys: string[], label: string }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5 last:border-none">
    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
    <div className="flex gap-1">
      {keys.map((key) => (
        <kbd key={key} className="px-2 py-1 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-md text-[10px] font-bold shadow-sm min-w-[24px] text-center">
          {key}
        </kbd>
      ))}
    </div>
  </div>
);

const ShortcutsModal = ({ isOpen, onClose }: ShortcutsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] border-none shadow-2xl bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Raccourcis Clavier
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Navigation & Actions</h4>
            <ShortcutItem keys={['N']} label="Nouvelle tâche" />
            <ShortcutItem keys={['F']} label="Mode Focus" />
            <ShortcutItem keys={['P']} label="Minuteur Pomodoro" />
            <ShortcutItem keys={['ESC']} label="Fermer / Annuler" />
          </section>

          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Interface</h4>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Réorganiser</span>
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full">
                <MousePointer2 className="w-3 h-3" />
                Glisser-Déposer
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShortcutsModal;