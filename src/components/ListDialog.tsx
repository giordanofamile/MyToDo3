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
import { Search, Image as ImageIcon, Palette, Smile, Info, X } from 'lucide-react';

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
    const mockImages = Array.from({ length: 12 }, (_, i) => 
      `https://images.unsplash.com/photo-${1500000000000 + (i * 1000000)}?auto=format&fit=crop&w=400&q=80`
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
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] border-none shadow-2xl bg-[#F8F9FA] dark:bg-[#1C1C1E] p-0 overflow-hidden">
        <div className="relative p-8 pb-4">
          <DialogTitle className="text-3xl font-black tracking-tight text-[#1A1A1A] dark:text-white mb-8">
            {initialData ? 'Configurer la liste' : 'Nouvelle liste'}
          </DialogTitle>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-none h-auto p-0 mb-8 gap-8">
              <TabsTrigger 
                value="general" 
                className="data-[state=active]:text-[#3B82F6] data-[state=active]:bg-transparent data-[state=active]:shadow-none p-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[#94A3B8] transition-colors"
              >
                GÉNÉRAL
              </TabsTrigger>
              <TabsTrigger 
                value="appearance" 
                className="data-[state=active]:text-[#3B82F6] data-[state=active]:bg-transparent data-[state=active]:shadow-none p-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[#94A3B8] transition-colors"
              >
                APPARENCE
              </TabsTrigger>
              <TabsTrigger 
                value="background" 
                className="data-[state=active]:text-[#3B82F6] data-[state=active]:bg-transparent data-[state=active]:shadow-none p-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[#94A3B8] transition-colors"
              >
                IMMERSION
              </TabsTrigger>
            </TabsList>

            <div className="h-[380px]">
              <TabsContent value="general" className="space-y-8 mt-0">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94A3B8]">NOM DE LA LISTE</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Projet Alpha"
                    className="h-14 rounded-2xl bg-white dark:bg-white/5 border-none text-lg font-semibold shadow-sm focus-visible:ring-2 focus-visible:ring-[#3B82F6]/20"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94A3B8]">DESCRIPTION</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ajoutez un contexte..."
                    className="min-h-[140px] rounded-2xl bg-white dark:bg-white/5 border-none resize-none p-4 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-[#3B82F6]/20"
                  />
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-6 mt-0 h-full flex flex-col">
                <div className="flex items-center gap-3 bg-white dark:bg-white/5 rounded-2xl px-4 h-12 shadow-sm">
                  <Search className="w-4 h-4 text-[#94A3B8]" />
                  <input 
                    placeholder="Rechercher une icône..." 
                    className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium"
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                  />
                </div>
                
                <ScrollArea className="flex-1 pr-4 custom-scrollbar">
                  <div className="space-y-8">
                    {Object.entries(ICON_CATEGORIES).map(([category, icons]) => (
                      <div key={category} className="space-y-4">
                        <h4 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">{category}</h4>
                        <div className="grid grid-cols-5 gap-3">
                          {icons.map((iconName) => {
                            const Icon = (LucideIcons as any)[iconName];
                            return (
                              <button
                                key={iconName}
                                onClick={() => setFormData({ ...formData, icon: iconName })}
                                className={cn(
                                  "flex items-center justify-center h-14 rounded-2xl transition-all",
                                  formData.icon === iconName 
                                    ? "bg-white dark:bg-white/10 shadow-lg scale-105 ring-2 ring-[#3B82F6]/20" 
                                    : "hover:bg-white/50 dark:hover:bg-white/5 text-[#94A3B8]"
                                )}
                              >
                                {Icon && <Icon className={cn("w-6 h-6", formData.icon === iconName && formData.color)} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="pt-4 border-t border-[#E2E8F0] dark:border-white/5">
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {COLORS.map((color) => (
                      <button
                        key={color.class}
                        onClick={() => setFormData({ ...formData, color: color.class })}
                        className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-full transition-all border-4 border-transparent",
                          color.class.replace('text-', 'bg-'),
                          formData.color === color.class ? "border-white dark:border-[#1C1C1E] shadow-lg scale-110" : "hover:scale-110"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="background" className="space-y-8 mt-0 h-full flex flex-col">
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94A3B8]">COULEUR DE FOND</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color.bg}
                        onClick={() => setFormData({ ...formData, bg_color: color.bg, bg_image: '' })}
                        className={cn(
                          "h-10 rounded-xl transition-all",
                          color.bg,
                          formData.bg_color === color.bg ? "ring-2 ring-[#3B82F6] scale-95" : "hover:opacity-80"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94A3B8]">IMAGE UNSPLASH</Label>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[250px]">
                      {UNSPLASH_CATEGORIES.map(cat => (
                        <button 
                          key={cat}
                          onClick={() => fetchImages(cat)}
                          className="px-3 py-1 rounded-full bg-white dark:bg-white/5 text-[9px] font-bold whitespace-nowrap text-[#64748B] hover:text-[#3B82F6] transition-colors"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <ScrollArea className="flex-1 pr-4 custom-scrollbar">
                    <div className="grid grid-cols-3 gap-3">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setFormData({ ...formData, bg_image: img, bg_color: '' })}
                          className={cn(
                            "aspect-video rounded-2xl overflow-hidden border-2 transition-all relative group",
                            formData.bg_image === img ? "border-[#3B82F6] scale-95 shadow-lg" : "border-transparent hover:scale-105"
                          )}
                        >
                          <img src={img} alt="Unsplash" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="p-8 pt-0">
          <Button 
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className="w-full h-16 bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-[#F8F9FA] rounded-2xl font-bold text-lg transition-all shadow-xl active:scale-[0.98]"
          >
            {initialData ? 'Enregistrer les modifications' : 'Créer la liste'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListDialog;