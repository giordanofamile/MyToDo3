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
      <DialogContent className="sm:max-w-[350px] rounded-[2rem] border-none shadow-2xl bg-white dark:bg-[#1C1C1E] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-center mb-4">Mon Profil</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Prénom</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-9 rounded-none bg-transparent border-none focus-visible:ring-0 p-0 font-semibold"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Nom</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-9 rounded-none bg-transparent border-none focus-visible:ring-0 p-0 font-semibold"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="w-full h-11 bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-xl font-bold transition-all shadow-lg"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;