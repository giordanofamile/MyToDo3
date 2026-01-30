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
import { Search, X, Image as ImageIcon, Palette } from 'lucide-react';

const ICON_CATEGORIES: Record<string, string[]> = {
  'Essentiels': ['Hash', 'Star', 'Check', 'AlertCircle', 'Info', 'HelpCircle', 'Plus', 'Target', 'Zap', 'Flag', 'Bell', 'Bookmark', 'Tag', 'Heart', 'Flame'],
  'Travail': ['Briefcase', 'FileText', 'Presentation', 'Mail', 'Calendar', 'Clipboard', 'Database', 'HardDrive', 'Layers', 'Trello', 'PenTool', 'Printer', 'Send', 'Archive', 'BarChart'],
  'Technologie': ['Laptop', 'Smartphone', 'Watch', 'Camera', 'Cpu', 'Monitor', 'Mouse', 'Wifi', 'Bluetooth', 'Code', 'Terminal', 'Settings', 'Shield', 'Key', 'Lock'],
  'Personnel': ['User', 'Home', 'ShoppingBag', 'Coffee', 'Utensils', 'Bed', 'Baby', 'Dog', 'Cat', 'GlassWater', 'Wine', 'Pizza', 'Apple', 'Car', 'Bike'],
  'Nature': ['Leaf', 'TreePine', 'Cloud', 'Sun', 'Moon', 'Zap', 'Droplets', 'Wind', 'Mountain', 'Flower', 'Bird', 'Fish', 'Shell', 'Sunrise', 'Sunset'],
  'Logistique': ['Truck', 'Package', 'Box', 'Map', 'Navigation', 'Compass', 'Plane', 'Train', 'Ship', 'Anchor', 'Globe', 'MapPin', 'Warehouse', 'Container', 'Forklift'],
  'Santé': ['Activity', 'HeartPulse', 'Stethoscope', 'Pill', 'Thermometer', 'FirstAid', 'Brain', 'Eye', 'Dna', 'Microscope', 'Syringe', 'Bandage', 'Cross'],
  'Éducation': ['Book', 'BookOpen', 'GraduationCap', 'School', 'Library', 'Calculator', 'Compass', 'Languages', 'Globe2', 'Pencil', 'Eraser', 'Ruler', 'Atom', 'Lightbulb'],
  'Finance': ['Banknote', 'Wallet', 'CreditCard', 'Coins', 'PiggyBank', 'TrendingUp', 'TrendingDown', 'DollarSign', 'Euro', 'Receipt', 'Landmark', 'PieChart'],
  'Voyage': ['Plane', 'Train', 'Car', 'Bike', 'Ship', 'Map', 'Compass', 'Globe', 'Palmtree', 'Tent', 'Luggage', 'Hotel', 'Ticket', 'Mountain'],
  'Sport': ['Dumbbell', 'Trophy', 'Medal', 'Target', 'Timer', 'Activity', 'Footprints', 'Bike', 'Waves', 'Mountain', 'Flame', 'HeartPulse'],
  'Météo': ['Sun', 'Moon', 'Cloud', 'CloudRain', 'CloudLightning', 'CloudSnow', 'Wind', 'Droplets', 'Thermometer', 'Sunrise', 'Sunset', 'Umbrella'],
  'Média': ['Music', 'Video', 'Camera', 'Mic', 'Headphones', 'Speaker', 'Play', 'Pause', 'Film', 'Image', 'Tv', 'Radio'],
  'Social': ['Users', 'UserPlus', 'MessageCircle', 'MessageSquare', 'Share2', 'Heart', 'ThumbsUp', 'AtSign', 'Link', 'Globe', 'Smile'],
  'Outils': ['Hammer', 'Wrench', 'Settings', 'Scissors', 'PenTool', 'Brush', 'Eraser', 'Pencil', 'Ruler', 'Trash2', 'Save', 'Copy'],
  'Science': ['FlaskConical', 'Atom', 'Dna', 'Microscope', 'Telescope', 'Brain', 'Lightbulb', 'Magnet', 'Beaker', 'Binary', 'Orbit'],
  'Shopping': ['ShoppingBag', 'ShoppingCart', 'Tag', 'Gift', 'CreditCard', 'Store', 'Package', 'Truck', 'Ticket', 'Percent'],
  'Sécurité': ['Shield', 'Lock', 'Unlock', 'Key', 'Eye', 'EyeOff', 'Fingerprint', 'ShieldCheck', 'ShieldAlert', 'FileLock', 'HardDrive']
};

const ICON_TRANSLATIONS: Record<string, string[]> = {
  'travail': ['work', 'briefcase', 'file', 'presentation', 'mail', 'calendar', 'clipboard', 'archive'],
  'argent': ['finance', 'bank', 'wallet', 'credit', 'coins', 'dollar', 'euro', 'receipt'],
  'maison': ['home', 'user', 'bed'],
  'voiture': ['car', 'bike', 'truck', 'navigation'],
  'avion': ['plane', 'travel', 'voyage'],
  'livre': ['book', 'education', 'school', 'pencil', 'library'],
  'coeur': ['heart', 'love', 'social', 'health'],
  'soleil': ['sun', 'weather', 'météo', 'light'],
  'nuage': ['cloud', 'rain', 'snow'],
  'musique': ['music', 'media', 'audio', 'headphones'],
  'paramètres': ['settings', 'tools', 'wrench', 'hammer'],
  'poubelle': ['trash', 'delete'],
  'recherche': ['search', 'find', 'eye'],
  'utilisateur': ['user', 'profile', 'social'],
  'message': ['message', 'chat', 'mail', 'send'],
  'santé': ['health', 'activity', 'heart', 'pill', 'brain'],
  'école': ['school', 'education', 'book', 'graduation'],
  'nourriture': ['food', 'coffee', 'utensils', 'pizza', 'apple'],
  'café': ['coffee', 'cup', 'drink'],
  'clé': ['key', 'lock', 'security'],
  'cadenas': ['lock', 'security', 'shield'],
  'code': ['code', 'terminal', 'laptop', 'binary'],
  'ordinateur': ['laptop', 'monitor', 'cpu', 'tech'],
  'téléphone': ['smartphone', 'phone', 'mobile'],
  'montre': ['watch', 'timer', 'clock'],
  'appareil': ['camera', 'image', 'video'],
  'sport': ['dumbbell', 'trophy', 'medal', 'activity'],
  'météo': ['weather', 'sun', 'cloud', 'rain'],
  'voyage': ['travel', 'plane', 'map', 'hotel'],
  'cadeau': ['gift', 'shopping', 'tag']
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

  const fetchImages = async (query: string) => {
    const mockImages = Array.from({ length: 15 }, (_, i) => 
      `https://images.unsplash.com/photo-${1500000000000 + (i * 1234567)}?auto=format&fit=crop&w=400&q=80`
    );
    setImages(mockImages);
  };

  useEffect(() => {
    if (isOpen) fetchImages('minimal');
  }, [isOpen]);

  const handleSave = () => {
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  const filteredIcons = Object.entries(ICON_CATEGORIES).reduce((acc, [category, icons]) => {
    const searchLower = iconSearch.toLowerCase();
    const translatedTerms = ICON_TRANSLATIONS[searchLower] || [];
    const filtered = icons.filter(icon => {
      const iconLower = icon.toLowerCase();
      return iconLower.includes(searchLower) || translatedTerms.some(term => iconLower.includes(term));
    });
    if (filtered.length > 0) acc[category] = filtered;
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] border-none shadow-2xl bg-[#F8F9FA] dark:bg-[#1C1C1E] p-0 overflow-hidden">
        <div className="relative p-8 pb-4">
          <DialogTitle className="text-3xl font-black tracking-tight text-[#1A1A1A] dark:text-white mb-8">
            {initialData?.id ? 'Configurer la liste' : formData.parent_id ? 'Nouvelle sous-liste' : 'Nouvelle liste'}
          </DialogTitle>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-none h-auto p-0 mb-8 gap-8">
              <TabsTrigger value="general" className="data-[state=active]:text-[#3B82F6] data-[state=active]:bg-transparent data-[state=active]:shadow-none p-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[#94A3B8]">GÉNÉRAL</TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:text-[#3B82F6] data-[state=active]:bg-transparent data-[state=active]:shadow-none p-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[#94A3B8]">APPARENCE</TabsTrigger>
              <TabsTrigger value="background" className="data-[state=active]:text-[#3B82F6] data-[state=active]:bg-transparent data-[state=active]:shadow-none p-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[#94A3B8]">IMMERSION</TabsTrigger>
            </TabsList>

            <div className="h-[420px]">
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
                    placeholder="Rechercher (ex: travail, argent, sport...)" 
                    className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium"
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                  />
                </div>
                <ScrollArea className="flex-1 pr-4 custom-scrollbar">
                  <div className="space-y-8 pb-4">
                    {Object.entries(filteredIcons).map(([category, icons]) => (
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
                                  formData.icon === iconName ? "bg-white dark:bg-white/10 shadow-lg scale-105 ring-2 ring-[#3B82F6]/20" : "hover:bg-white/50 dark:hover:bg-white/5 text-[#94A3B8]"
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

              <TabsContent value="background" className="mt-0 h-full flex flex-col">
                <div className="space-y-6 pb-4">
                  {/* Zone Couleur de fond - Placée en haut */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5 text-[#3B82F6]" />
                      <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94A3B8]">COULEUR DE FOND</Label>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {COLORS.map((color) => (
                        <button
                          key={color.bg}
                          onClick={() => setFormData({ ...formData, bg_color: color.bg, bg_image: '' })}
                          className={cn(
                            "h-10 rounded-xl transition-all border-2",
                            color.bg,
                            formData.bg_color === color.bg ? "border-[#3B82F6] scale-95 shadow-md" : "border-transparent hover:opacity-80"
                          )}
                        />
                      ))}
                      <button
                        onClick={() => setFormData({ ...formData, bg_color: '', bg_image: '' })}
                        className={cn(
                          "h-10 rounded-xl transition-all border-2 border-dashed border-[#E2E8F0] dark:border-white/10 flex items-center justify-center",
                          !formData.bg_color && !formData.bg_image ? "bg-white dark:bg-white/5 border-[#3B82F6]" : "hover:bg-white/50"
                        )}
                      >
                        <X className="w-4 h-4 text-[#94A3B8]" />
                      </button>
                    </div>
                  </div>

                  {/* Zone Image Unsplash */}
                  <div className="space-y-3 flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-[#3B82F6]" />
                        <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94A3B8]">IMAGE UNSPLASH</Label>
                      </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                      {UNSPLASH_CATEGORIES.map(cat => (
                        <button 
                          key={cat} 
                          onClick={() => fetchImages(cat)} 
                          className="px-3 py-1.5 rounded-full bg-white dark:bg-white/5 text-[9px] font-bold whitespace-nowrap text-[#64748B] hover:text-[#3B82F6] transition-colors border border-[#E2E8F0] dark:border-white/5"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <ScrollArea className="flex-1 pr-4 custom-scrollbar">
                      <div className="grid grid-cols-3 gap-3 pb-4">
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
            {initialData?.id ? 'Enregistrer les modifications' : 'Créer la liste'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListDialog;