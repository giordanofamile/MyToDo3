import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Label } from '@/components/ui/label';
import { FileText, Loader2, Download, Trash2, UploadCloud } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import imageCompression from 'browser-image-compression';
import { cn } from '@/lib/utils';

interface AttachmentManagerProps {
  taskId: string;
}

const AttachmentManager = ({ taskId }: AttachmentManagerProps) => {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchAttachments();
  }, [taskId]);

  const fetchAttachments = async () => {
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });
    
    if (error) console.error("Error fetching attachments:", error);
    else setAttachments(data || []);
  };

  const processAndUploadFiles = async (files: FileList | File[]) => {
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      showError("Session expirée. Veuillez vous reconnecter.");
      setUploading(false);
      return;
    }

    const filesArray = Array.from(files);
    let successCount = 0;

    for (const file of filesArray) {
      try {
        let fileToUpload = file;

        // Compression pour les images > 500KB
        if (file.type.startsWith('image/') && file.size > 500 * 1024) {
          const options = {
            maxSizeMB: 0.4,
            maxWidthOrHeight: 1920,
            useWebWorker: true
          };
          fileToUpload = await imageCompression(file, options);
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${user.id}/${taskId}/${fileName}`;

        // Upload vers Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, fileToUpload, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Storage Upload Error:", uploadError);
          throw new Error(`Erreur Storage: ${uploadError.message}`);
        }

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

        if (dbError) {
          console.error("Database Insert Error:", dbError);
          // Nettoyage du fichier orphelin dans le storage
          await supabase.storage.from('attachments').remove([filePath]);
          throw new Error(`Erreur Base de données: ${dbError.message}`);
        }

        successCount++;
      } catch (error: any) {
        showError(error.message);
      }
    }

    if (successCount > 0) {
      showSuccess(`${successCount} fichier(s) ajouté(s)`);
      fetchAttachments();
    }
    setUploading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processAndUploadFiles(e.target.files);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processAndUploadFiles(e.dataTransfer.files);
    }
  }, []);

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
      </div>

      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-[2rem] p-8 transition-all duration-300 flex flex-col items-center justify-center gap-3 group",
          isDragging 
            ? "border-blue-500 bg-blue-500/5 scale-[0.98]" 
            : "border-gray-100 dark:border-white/5 hover:border-blue-500/30 hover:bg-gray-50 dark:hover:bg-white/5"
        )}
      >
        <input 
          type="file" 
          id="file-upload" 
          multiple
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={handleFileSelect}
          disabled={uploading}
        />
        
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
          isDragging ? "bg-blue-500 text-white" : "bg-blue-500/10 text-blue-500 group-hover:scale-110"
        )}>
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>
        
        <div className="text-center">
          <p className="text-sm font-bold dark:text-white">
            {uploading ? "Téléchargement..." : "Glissez vos fichiers ici"}
          </p>
          <p className="text-[10px] text-gray-400 font-medium mt-1">
            Plusieurs fichiers acceptés (Max 500 Ko par fichier)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attachments.map((att) => (
          <div key={att.id} className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-2xl group border border-gray-50 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
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
      </div>
    </div>
  );
};

export default AttachmentManager;