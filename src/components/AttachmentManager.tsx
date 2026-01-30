import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Paperclip, X, FileText, Image as ImageIcon, Loader2, Download, Trash2 } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import imageCompression from 'browser-image-compression';
import { cn } from '@/lib/utils';

interface AttachmentManagerProps {
  taskId: string;
}

const AttachmentManager = ({ taskId }: AttachmentManagerProps) => {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAttachments();
  }, [taskId]);

  const fetchAttachments = async () => {
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });
    
    if (error) showError(error.message);
    else setAttachments(data || []);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      let fileToUpload = file;

      // Compression si c'est une image
      if (file.type.startsWith('image/')) {
        const options = {
          maxSizeMB: 0.5, // 500 KB
          maxWidthOrHeight: 1920,
          useWebWorker: true
        };
        fileToUpload = await imageCompression(file, options);
      } else if (file.size > 500 * 1024) {
        throw new Error("Le fichier dépasse la limite de 500 Ko");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${taskId}/${fileName}`;

      // Upload vers Supabase Storage (assurez-vous que le bucket 'attachments' existe)
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, fileToUpload);

      if (uploadError) throw uploadError;

      // Enregistrement en base
      const { error: dbError } = await supabase
        .from('attachments')
        .insert([{
          task_id: taskId,
          user_id: user.id,
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: fileToUpload.size
        }]);

      if (dbError) throw dbError;

      showSuccess("Fichier ajouté");
      fetchAttachments();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteAttachment = async (attachment: any) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('attachments')
        .remove([attachment.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachment.id);

      if (dbError) throw dbError;

      setAttachments(attachments.filter(a => a.id !== attachment.id));
      showSuccess("Fichier supprimé");
    } catch (error: any) {
      showError(error.message);
    }
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('attachments').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pièces jointes (Max 500 Ko)</Label>
        <div className="relative">
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label 
            htmlFor="file-upload"
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-blue-500/20 transition-all",
              uploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Paperclip className="w-3 h-3" />}
            Ajouter
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attachments.map((att) => (
          <div key={att.id} className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-2xl group border-none shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {att.file_type.startsWith('image/') ? (
                <img src={getPublicUrl(att.file_path)} alt={att.name} className="w-full h-full object-cover" />
              ) : (
                <FileText className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate dark:text-white">{att.name}</p>
              <p className="text-[9px] text-gray-400 font-medium">{(att.file_size / 1024).toFixed(1)} Ko</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <a 
                href={getPublicUrl(att.file_path)} 
                download={att.name}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-500"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
              <button 
                onClick={() => deleteAttachment(att)}
                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {attachments.length === 0 && !uploading && (
          <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2rem]">
            <p className="text-xs text-gray-400 font-medium">Aucune pièce jointe</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentManager;