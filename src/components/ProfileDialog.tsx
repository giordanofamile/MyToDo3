import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { User } from 'lucide-react';

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const ProfileDialog = ({ isOpen, onClose, onUpdate }: ProfileDialogProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchProfile();
  }, [isOpen]);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user?.id,
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString(),
      });

    if (error) showError(error.message);
    else {
      showSuccess("Profil mis à jour !");
      onUpdate();
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] border-none shadow-2xl bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Mon Profil</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center">
              <User className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Prénom</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-12 rounded-xl bg-gray-100 dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Nom</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-12 rounded-xl bg-gray-100 dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="w-full h-12 bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-xl font-bold transition-all"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;