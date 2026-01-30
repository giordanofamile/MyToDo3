import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { Search, Image as ImageIcon, Palette, Smile, Info } from 'lucide-react';

// Catégories d'icônes pour simuler une vaste bibliothèque
const ICON_CATEGORIES = {
  'Travail': ['Briefcase', 'FileText', 'Presentation', 'Mail', 'Calendar', 'Clipboard', 'Database', 'HardDrive', 'Layers', 'Trello'],
  'Personnel': ['User', 'Heart', 'Home', 'ShoppingBag', 'Coffee', 'Utensils', 'Bed', 'Baby', 'Dog', 'Cat'],
  'Nature': ['Leaf', 'TreePine', 'Cloud', 'Sun', 'Moon', 'Zap', 'Droplets', 'Flame', 'Wind', 'Mountain'],
  'Objets': ['Camera', 'Smartphone', 'Laptop', 'Watch', 'Key', 'Lock', 'Gift', 'Bell', 'Flag', 'Anchor'],
  'Symboles': ['Hash', 'Star', 'Check', 'AlertCircle', 'Info', 'HelpCircle', 'Plus', 'Minus', 'Target', 'Zap']
};

const COLORS = [
  { name: 'Bleu', class: 'text-blue-500', bg: 'bg-blue-500/10' },
  { name: 'Rose', class: 'text-pink-500', bg: 'bg-pink-500/10' },
  { name: 'Violet', class: 'text-purple-500', bg: 'bg-purple-500/10' },
  { name: 'Orange', class: 'text-orange-500', bg: 'bg-orange-500/10' },
  { name: 'Vert', class: 'text-green-500', bg: 'bg-green-500/10' },
  { name: 'Rouge', class: 'text-red-500', bg: 'bg-red-500/10' },
  { name: 'Indigo', class: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { name: 'Teal', class: 'text-teal-500', bg: 'bg-teal-500/10' },
];

const UNSPLASH_CATEGORIES = ['Minimal', 'Nature', 'Abstract', 'Textures', 'Architecture', 'Workspace'];

interface ListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const ListDialog = ({ isOpen, onClose, onSave, initialData }: ListDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Hash',
    color: 'text-blue-500',
    bg_image: '',
    bg_color: '',
    parent_id: null as string | null
  });
  const [iconSearch, setIconSearch] = useState('');
  const [imageSearch, setImageSearch] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) setFormData({ ...formData, ...initialData });
    else setFormData({
      name: '',
      description: '',
      icon: 'Hash',
      color: 'text-blue-500',
      bg_image: '',
      bg_color: '',
      parent_id: null
    });
  }, [initialData, isOpen]);

  const fetchImages = async (query: string) => {
    // Simulation d'appel Unsplash (dans une vraie app, on utiliserait l'API Unsplash)
    const mockImages = Array.from({ length: 12 }, (_, i) => 
      `https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&w=400&q=80`
    );
    setImages(mockImages);
  };

  useEffect(() => {
    fetchImages('minimal');
  }, []);

  const handleSave = () => {
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] border-none shadow-2xl bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-black tracking-tight">
            {initialData ? 'Configurer la liste' : 'Nouvelle liste intelligente'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full justify-start px-6 bg-transparent border-b border-gray-100 dark:border-white/5 h-12 gap-6">
            <TabsTrigger value="general" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-500 font-bold text-xs uppercase tracking-widest">Général</TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-500 font-bold text-xs uppercase tracking-widest">Apparence</TabsTrigger>
            <TabsTrigger value="background" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-500 font-bold text-xs uppercase tracking-widest">Immersion</TabsTrigger>
          </TabsList>

          <div className="p-6 h-[400px]">
            <TabsContent value="general" className="space-y-6 mt-0">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Nom de la liste</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Projet Alpha, Courses..."
                  className="h-12 rounded-xl bg-gray-100 dark:bg-white/5 border-none text-lg font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="De quoi s'agit-il ?"
                  className="min-h-[120px] rounded-xl bg-gray-100 dark:bg-white/5 border-none resize-none"
                />
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6 mt-0 h-full flex flex-col">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 rounded-xl px-3 h-10">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  placeholder="Rechercher une icône..." 
                  className="bg-transparent border-none focus:ring-0 text-sm w-full"
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                />
              </div>
              
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                  {Object.entries(ICON_CATEGORIES).map(([category, icons]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{category}</h4>
                      <div className="grid grid-cols-6 gap-2">
                        {icons.map((iconName) => {
                          const Icon = (LucideIcons as any)[iconName];
                          return (
                            <button
                              key={iconName}
                              onClick={() => setFormData({ ...formData, icon: iconName })}
                              className={cn(
                                "flex items-center justify-center h-12 rounded-xl transition-all",
                                formData.icon === iconName 
                                  ? "bg-white dark:bg-white/10 shadow-md scale-110 ring-2 ring-blue-500/20" 
                                  : "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400"
                              )}
                            >
                              {Icon && <Icon className={cn("w-5 h-5", formData.icon === iconName && formData.color)} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {COLORS.map((color) => (
                    <button
                      key={color.class}
                      onClick={() => setFormData({ ...formData, color: color.class })}
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full transition-all",
                        color.class.replace('text-', 'bg-'),
                        formData.color === color.class ? "ring-4 ring-blue-500/20 scale-110" : "hover:scale-110"
                      )}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="background" className="space-y-6 mt-0 h-full flex flex-col">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Couleur de fond</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color.bg}
                        onClick={() => setFormData({ ...formData, bg_color: color.bg, bg_image: '' })}
                        className={cn(
                          "h-10 rounded-lg transition-all",
                          color.bg,
                          formData.bg_color === color.bg ? "ring-2 ring-blue-500" : "hover:opacity-80"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Image Unsplash</Label>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {UNSPLASH_CATEGORIES.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => fetchImages(cat)}
                        className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-[10px] font-bold whitespace-nowrap"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 pr-4">
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setFormData({ ...formData, bg_image: img, bg_color: '' })}
                      className={cn(
                        "aspect-video rounded-xl overflow-hidden border-2 transition-all",
                        formData.bg_image === img ? "border-blue-500 scale-95" : "border-transparent hover:scale-105"
                      )}
                    >
                      <img src={img} alt="Unsplash" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="p-6 bg-gray-50 dark:bg-white/5">
          <Button 
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className="w-full h-12 bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-xl font-bold text-lg transition-all"
          >
            {initialData ? 'Enregistrer les modifications' : 'Créer la liste'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ListDialog;