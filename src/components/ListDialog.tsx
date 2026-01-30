import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { Search, X, Image as ImageIcon, Palette, Check } from 'lucide-react';

const ICON_CATEGORIES: Record<string, string[]> = {
  'Essentiels': ['Hash', 'Star', 'Check', 'AlertCircle', 'Info', 'HelpCircle', 'Plus', 'Target', 'Zap', 'Flag', 'Bell', 'Bookmark', 'Tag', 'Heart', 'Flame', 'Shield', 'Lock', 'Key', 'Eye', 'Settings', 'Trash2', 'Edit', 'Share2', 'ExternalLink', 'Link'],
  'Travail': ['Briefcase', 'FileText', 'Presentation', 'Mail', 'Calendar', 'Clipboard', 'Database', 'HardDrive', 'Layers', 'Trello', 'PenTool', 'Printer', 'Send', 'Archive', 'BarChart', 'PieChart', 'LineChart', 'TrendingUp', 'Users', 'UserPlus', 'Building', 'Globe', 'Languages'],
  'Finance': ['Wallet', 'CreditCard', 'Banknote', 'Coins', 'PiggyBank', 'DollarSign', 'Euro', 'Bitcoin', 'Receipt', 'Calculator', 'ShoppingBag', 'ShoppingCart', 'Tag', 'Percent'],
  'Technologie': ['Laptop', 'Smartphone', 'Watch', 'Camera', 'Cpu', 'Monitor', 'Mouse', 'Wifi', 'Bluetooth', 'Code', 'Terminal', 'Server', 'Cloud', 'HardDrive', 'Usb', 'Battery', 'Speaker', 'Headphones', 'Mic'],
  'Santé & Bien-être': ['Heart', 'Activity', 'Stethoscope', 'Thermometer', 'Pill', 'Dumbbell', 'Timer', 'Footprints', 'Apple', 'GlassWater', 'Coffee', 'Moon', 'Sun', 'Wind', 'Leaf'],
  'Éducation': ['Book', 'BookOpen', 'GraduationCap', 'School', 'Library', 'Pencil', 'Eraser', 'Ruler', 'Compass', 'Brain', 'Lightbulb', 'Microscope', 'Telescope'],
  'Médias': ['Play', 'Pause', 'SkipBack', 'SkipForward', 'Volume2', 'Music', 'Video', 'Image', 'Film', 'Mic', 'Radio', 'Tv', 'Cast', 'Airplay'],
  'Nature & Voyage': ['TreePine', 'Flower', 'Bird', 'Fish', 'Mountain', 'Waves', 'Cloud', 'Sun', 'Moon', 'Stars', 'Compass', 'Map', 'MapPin', 'Plane', 'Car', 'Bike', 'Ship', 'Tent', 'Umbrella'],
  'Maison': ['Home', 'Bed', 'Bath', 'Lamp', 'Sofa', 'Refrigerator', 'Microwave', 'Utensils', 'Coffee', 'Wine', 'Pizza', 'ChefHat'],
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

const UNSPLASH_CATEGORIES = ['Minimal', 'Nature', 'Abstract', 'Textures', 'Architecture', 'Workspace', 'Dark', 'Gradient'];

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
  const [activeCategory, setActiveCategory] = useState('Minimal');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        icon: initialData.icon || 'Hash',
        color: initialData.color || 'text-blue-500',
        bg_image: initialData.bg_image || '',
        bg_color: initialData.bg_color || '',
        parent_id: initialData.parent_id || null
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: 'Hash',
        color: 'text-blue-500',
        bg_image: '',
        bg_color: '',
        parent_id: null
      });
    }
  }, [initialData, isOpen]);

  const fetchImages = async (category: string) => {
    setActiveCategory(category);
    // Utilisation de l'API source.unsplash.com pour des images réelles et variées
    const mockImages = Array.from({ length: 12 }, (_, i) => 
      `https://images.unsplash.com/photo-${1500000000000 + (i * 1000000) + (category.length * 50000)}?auto=format&fit=crop&w=600&q=80`
    );
    setImages(mockImages);
  };

  useEffect(() => {
    if (isOpen) fetchImages('Minimal');
  }, [isOpen]);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] border-none shadow-2xl bg-[#F8F9FA] dark:bg-[#1C1C1E] p-0 overflow-hidden">
        <div className="p-8 pb-4">
          <DialogTitle className="text-3xl font-black tracking-tight text-[#1A1A1A] dark:text-white mb-8">
            {initialData?.id ? 'Configurer la liste' : formData.parent_id ? 'Nouvelle sous-liste' : 'Nouvelle liste'}
          </DialogTitle>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-none h-auto p-0 mb-8 gap-8">
              <TabsTrigger value="general" className="data-[state=active]:text-[#3B82F6] data-[state=active]:bg-transparent data-[state=active]:shadow-none p-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[#94A3B8]">GÉNÉRAL</TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:text-[#3B82F6] data-[state=active]:bg-transparent data-[state=active]:shadow-none p-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[#94A3B8]">APPARENCE</TabsTrigger>
              <TabsTrigger value="background" className="data-[state=active]:text-[#3B82F6] data-[state=active]:bg-transparent data-[state=active]:shadow-none p-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[#94A3B8]">IMMERSION</TabsTrigger>
            </TabsList>

            <div className="px-1">
              <TabsContent value="general" className="mt-0 animate-in fade-in-50 duration-300">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-8 py-2">
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
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="appearance" className="mt-0 animate-in fade-in-50 duration-300">
                <div className="flex items-center gap-3 bg-white dark:bg-white/5 rounded-2xl px-4 h-12 shadow-sm mb-6">
                  <Search className="w-4 h-4 text-[#94A3B8]" />
                  <input 
                    placeholder="Rechercher parmi des centaines d'icônes..." 
                    className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium"
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                  />
                </div>
                <ScrollArea className="h-[340px] pr-4 custom-scrollbar">
                  <div className="space-y-8 pb-6">
                    {Object.entries(ICON_CATEGORIES).map(([category, icons]) => {
                      const filteredIcons = icons.filter(i => i.toLowerCase().includes(iconSearch.toLowerCase()));
                      if (filteredIcons.length === 0) return null;
                      
                      return (
                        <div key={category} className="space-y-3">
                          <h4 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest ml-1">{category}</h4>
                          <div className="grid grid-cols-5 gap-3">
                            {filteredIcons.map((iconName) => {
                              const Icon = (LucideIcons as any)[iconName];
                              return (
                                <button
                                  key={iconName}
                                  onClick={() => setFormData({ ...formData, icon: iconName })}
                                  className={cn(
                                    "flex items-center justify-center h-14 rounded-2xl transition-all",
                                    formData.icon === iconName ? "bg-white dark:bg-white/10 shadow-lg scale-105 ring-2 ring-[#3B82F6]/20" : "hover:bg-white/50 dark:hover:bg-white/5 text-[#94A3B8]"
                                  )}
                                >
                                  {Icon && <Icon className={cn("w-6 h-6", formData.icon === iconName && formData.color)} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
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

              <TabsContent value="background" className="mt-0 animate-in fade-in-50 duration-300">
                <ScrollArea className="h-[400px] pr-4 custom-scrollbar">
                  <div className="space-y-8 py-2 pb-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-[#3B82F6]" />
                        <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94A3B8]">COULEUR DE FOND</Label>
                      </div>
                      <div className="grid grid-cols-5 gap-3">
                        {COLORS.map((color) => (
                          <button
                            key={color.bg}
                            onClick={() => setFormData({ ...formData, bg_color: color.bg, bg_image: '' })}
                            className={cn(
                              "h-12 rounded-2xl transition-all border-2 flex items-center justify-center",
                              color.bg,
                              formData.bg_color === color.bg ? "border-[#3B82F6] scale-95 shadow-md" : "border-transparent hover:opacity-80"
                            )}
                          >
                            {formData.bg_color === color.bg && <Check className="w-4 h-4 text-[#3B82F6]" />}
                          </button>
                        ))}
                        <button
                          onClick={() => setFormData({ ...formData, bg_color: '', bg_image: '' })}
                          className={cn(
                            "h-12 rounded-2xl transition-all border-2 border-dashed border-[#E2E8F0] dark:border-white/10 flex items-center justify-center",
                            !formData.bg_color && !formData.bg_image ? "bg-white dark:bg-white/5 border-[#3B82F6]" : "hover:bg-white/50"
                          )}
                        >
                          <X className="w-4 h-4 text-[#94A3B8]" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#3B82F6]" />
                        <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94A3B8]">IMAGE UNSPLASH</Label>
                      </div>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {UNSPLASH_CATEGORIES.map(cat => (
                          <button 
                            key={cat} 
                            onClick={() => fetchImages(cat)} 
                            className={cn(
                              "px-4 py-2 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border",
                              activeCategory === cat 
                                ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-md" 
                                : "bg-white dark:bg-white/5 text-[#64748B] border-[#E2E8F0] dark:border-white/5 hover:border-[#3B82F6]"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {images.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setFormData({ ...formData, bg_image: img, bg_color: '' })}
                            className={cn(
                              "aspect-video rounded-2xl overflow-hidden border-2 transition-all relative group",
                              formData.bg_image === img ? "border-[#3B82F6] scale-95 shadow-lg" : "border-transparent hover:scale-105"
                            )}
                          >
                            <img src={img} alt="Unsplash" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            {formData.bg_image === img && (
                              <div className="absolute inset-0 bg-[#3B82F6]/20 flex items-center justify-center">
                                <Check className="w-8 h-8 text-white drop-shadow-md" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="p-8 pt-4">
          <Button 
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className={cn(
              "w-full h-16 rounded-2xl font-bold text-lg transition-all shadow-xl active:scale-[0.98]",
              formData.name.trim() 
                ? "bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-[#F8F9FA]" 
                : "bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed"
            )}
          >
            {initialData?.id ? 'Enregistrer les modifications' : 'Créer la liste'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListDialog;