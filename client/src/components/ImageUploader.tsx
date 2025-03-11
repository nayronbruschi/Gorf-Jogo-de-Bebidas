import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
}

export function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileName = `${Date.now()}-${file.name}`;
      const url = await uploadImage(file, fileName);
      onUploadComplete(url);
      
      toast({
        title: "Upload completo",
        description: "A imagem foi carregada com sucesso!",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="bg-white/10 border-white/20 text-white"
      />
      {isUploading && (
        <div className="text-sm text-white/60">
          Fazendo upload...
        </div>
      )}
    </div>
  );
}
