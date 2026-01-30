import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'minimal', label: 'Minimaliste', query: 'minimalist' },
  { id: 'nature', label: 'Nature', query: 'nature' },
  { id: 'abstract', label: 'Abstrait', query: 'abstract' },
  { id: 'work', label: 'Travail', query: 'workspace' },
  { id: 'textures', label: 'Textures', query: 'texture' },
];

interface UnsplashPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

const UnsplashPicker = ({ isOpen, onClose, onSelect }: UnsplashPickerProps) => {
  const [search, setSearch] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('minimal');

  const fetchImages = async (query: string) => {
    setLoading(true);
    try {
      const mockIds: Record<string, string[]> = {
        minimal: ['1494438639946-1ebd1d20bf85', '1507525428034-b723cf961d3e', '1483728642387-6c3bdd6c93e5', '1490750967868-88aa4486c946', '1518133910546-b6c2fb7d79e3', '1454165833767-027ffea9e778'],
        nature: ['1441974231531-c6227db76b6e', '1470071459604-3b5ec3a7fe05', '1447752875215-b2761acb3c5d', '1464822759023-fed622ff2c3b', '1501785888041-af3ef285b470', '1433086566608-06a3a5475673'],
        abstract: ['1541701494587-cb58502866ab', '1550684848-fac1c5b4e853', '1506792006437-256b748d3c6c', '1549490349-8643362247b5', '1557683316-973673baf926', '1557682250-33bd709cbe85'],
        work: ['1499750310107-5fef28a66643', '1486312338219-ce68d2c6f44d', '1519389950473-47ba0277781c', '1497215728101-856f4ea42174', '1522202176988-66273c2fd55f', '1517245386807-bb43f82c33c4'],
        textures: ['1508739773434-c26b3d09e071', '1518531933037-91b2f5f229cc', '1550684376-efcbd6e3f031', '1558591710-4b4a1ad0f048', '1554188248-986adbb73be4', '1553356084-58ef4a67b2a7']
      };

      const ids = mockIds[activeTab] || mockIds.minimal;
      const urls = ids.map(id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`);
      setImages(urls);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchImages(activeTab);
  }, [isOpen, activeTab]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 rounded-xl border-none shadow-2xl bg-white dark:bg-[#1C1C1E]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-blue-500" />
            Bibliothèque Unsplash
          </DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Rechercher une image..." 
              className="pl-10 bg-gray-50 dark:bg-white/5 border-none h-10 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchImages(search)}
            />
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="px-6 bg-transparent border-none h-auto p-0 gap-4 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(cat => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id}
                className="data-[state=active]:text-blue-500 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 px-0 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => { onSelect(url); onClose(); }}
                    className="aspect-video rounded-lg overflow-hidden hover:scale-[1.02] transition-all shadow-sm group relative"
                  >
                    <img src={url} alt="Unsplash" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold uppercase tracking-widest">Sélectionner</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UnsplashPicker;