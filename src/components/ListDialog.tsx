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
};

const COLORS = [
  { name: 'Bleu', class: 'text-blue-500', bg: 'bg-blue-500/10', dot: 'bg-blue-500' },
  { name: 'Rose', class: 'text-pink-500', bg: 'bg-pink-500/10', dot: 'bg-pink-500' },
  { name: 'Violet', class: 'text-purple-500', bg: 'bg-purple-500/10', dot: 'bg-purple-500' },
  { name: 'Orange', class: 'text-orange-500', bg: 'bg-orange-500/10', dot: 'bg-orange-500' },
  { name: 'Vert', class: 'text-green-500', bg: 'bg-green-500/10', dot: 'bg-green-500' },
  { name: 'Gris', class: 'text-gray-500', bg: 'bg-gray-500/10', dot: 'bg-gray-500' },
];

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

  const fetchImages = (category: string) => {
    const mockIds: Record<string, string[]> = {
      'Minimal': ['1494438639946-1ebd1d20bf85', '1507525428034-b723cf961d3e', '1483728642387-6c3bdd6c93e5'],
      'Nature': ['1441974231531-c6227db76b6e', '1470071459604-3b5ec3a7fe05', '1447752875215-b2761acb3c5d'],
    };
    const ids = mockIds[category] || mockIds['Minimal'];
    const urls = ids.map(id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`);
    setImages(urls);
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
      <DialogContent className="sm:max-w-[450px] rounded-xl border-none shadow-2xl bg-white dark:bg-[#1C1C1E] p-0 overflow-hidden">
        <div className="p-6 pb-2">
          <DialogTitle className="text-2xl font-black tracking-tight text-[#1A1A1A] dark:text-white mb-6">
            {initialData?.id ? 'Configurer' : 'Nouvelle liste'}
          </DialogTitle>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-none h-auto p-0 mb-6 gap-6">
              <TabsTrigger value="general" className="data-[state=active]:text-[#3B82F6] data-[state=active]:bg-transparent p-0 text-[9px] font-bold uppercase tracking-widest text-[#94A3B8]">GÉNÉRAL</TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:text-[#3B82F6] data-[state=active]:bg-transparent p-0 text-[9px] font-bold uppercase tracking-widest text-[#94A3B8]">ICÔNE</TabsTrigger>
              <TabsTrigger value="background" className="data-[state=active]:text-[#3B82F6] data-[state=active]:bg-transparent p-0 text-[9px] font-bold uppercase tracking-widest text-[#94A3B8]">IMMERSION</TabsTrigger>
            </TabsList>

            <div className="h-[320px] overflow-y-auto custom-scrollbar pr-2">
              <TabsContent value="general" className="mt-0">
                <div className="space-y-6 py-2">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-[#94A3B8]">NOM</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Projet Alpha"
                      className="h-10 rounded-none bg-transparent border-none text-lg font-semibold focus-visible:ring-0 p-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-[#94A3B8]">DESCRIPTION</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Ajoutez un contexte..."
                      className="min-h-[80px] rounded-none bg-transparent border-none resize-none p-0 text-sm focus-visible:ring-0"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-[#94A3B8]">COULEUR DE L'ICÔNE</Label>
                    <div className="flex gap-2">
                      {COLORS.map((color) => (
                        <button
                          key={color.class}
                          onClick={() => setFormData({ ...formData, color: color.class })}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                            color.dot,
                            formData.color === color.class ? "ring-4 ring-blue-500/20 scale-110" : "opacity-60 hover:opacity-100"
                          )}
                        >
                          {formData.color === color.class && <Check className="w-4 h-4 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="mt-0">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-lg px-3 h-9 mb-4">
                  <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <input 
                    placeholder="Rechercher..." 
                    className="bg-transparent border-none focus:ring-0 text-xs w-full font-medium"
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-6 gap-2 pb-4">
                  {Object.values(ICON_CATEGORIES).flat().filter(i => i.toLowerCase().includes(iconSearch.toLowerCase())).map((iconName) => {
                    const Icon = (LucideIcons as any)[iconName];
                    return (
                      <button
                        key={iconName}
                        onClick={() => setFormData({ ...formData, icon: iconName })}
                        className={cn(
                          "flex items-center justify-center h-10 rounded-lg transition-all",
                          formData.icon === iconName ? "bg-blue-500/10 text-blue-500" : "text-[#94A3B8] hover:bg-gray-50 dark:hover:bg-white/5"
                        )}
                      >
                        {Icon && <Icon className="w-5 h-5" />}
                      </button>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="background" className="mt-0">
                <div className="space-y-6">
                  <div className="grid grid-cols-6 gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color.bg}
                        onClick={() => setFormData({ ...formData, bg_color: color.bg, bg_image: '' })}
                        className={cn(
                          "h-10 rounded-lg transition-all border-2",
                          color.bg,
                          formData.bg_color === color.bg ? "border-[#3B82F6]" : "border-transparent"
                        )}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setFormData({ ...formData, bg_image: img, bg_color: '' })}
                        className={cn(
                          "aspect-video rounded-lg overflow-hidden border-2 transition-all",
                          formData.bg_image === img ? "border-[#3B82F6]" : "border-transparent"
                        )}
                      >
                        <img src={img} alt="Unsplash" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="p-6 pt-2">
          <Button 
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className="w-full h-12 rounded-lg font-bold text-sm bg-black dark:bg-white text-white dark:text-black shadow-lg"
          >
            {initialData?.id ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListDialog;