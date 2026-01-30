import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Hash, 
  Briefcase, 
  ShoppingCart, 
  Heart, 
  Star, 
  Music, 
  Book, 
  Plane,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS = [
  { name: 'Hash', icon: Hash },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'Heart', icon: Heart },
  { name: 'Star', icon: Star },
  { name: 'Music', icon: Music },
  { name: 'Book', icon: Book },
  { name: 'Plane', icon: Plane },
];

const COLORS = [
  'text-blue-500',
  'text-pink-500',
  'text-purple-500',
  'text-orange-500',
  'text-green-500',
  'text-yellow-500',
  'text-indigo-500',
  'text-red-500',
];

interface ListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string, icon: string, color: string }) => void;
  initialData?: { name: string, icon: string, color: string };
}

const ListDialog = ({ isOpen, onClose, onSave, initialData }: ListDialogProps) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Hash');
  const [selectedColor, setSelectedColor] = useState('text-blue-500');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSelectedIcon(initialData.icon);
      setSelectedColor(initialData.color);
    } else {
      setName('');
      setSelectedIcon('Hash');
      setSelectedColor('text-blue-500');
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name, icon: selectedIcon, color: selectedColor });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {initialData ? 'Modifier la liste' : 'Nouvelle liste'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Nom de la liste</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Courses, Travail..."
              className="h-12 rounded-xl bg-gray-100 dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-blue-500/20 text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Icône</Label>
            <div className="grid grid-cols-4 gap-2">
              {ICONS.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setSelectedIcon(item.name)}
                  className={cn(
                    "flex items-center justify-center h-12 rounded-xl transition-all",
                    selectedIcon === item.name 
                      ? "bg-white dark:bg-white/10 shadow-md scale-110 ring-2 ring-blue-500/20" 
                      : "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", selectedIcon === item.name && selectedColor)} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Couleur</Label>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "flex items-center justify-center h-12 rounded-xl transition-all group",
                    selectedColor === color 
                      ? "bg-white dark:bg-white/10 shadow-md scale-110 ring-2 ring-blue-500/20" 
                      : "hover:bg-gray-100 dark:hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full transition-transform group-hover:scale-110",
                    color.replace('text-', 'bg-')
                  )}>
                    {selectedColor === color && <Check className="w-4 h-4 text-white m-1" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full h-12 bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-xl font-bold text-lg transition-all"
          >
            {initialData ? 'Enregistrer' : 'Créer la liste'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ListDialog;