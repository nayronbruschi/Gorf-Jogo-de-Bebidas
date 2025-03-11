import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
}

export function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar o tamanho do arquivo (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Por favor, selecione uma imagem menor que 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const fileName = `${Date.now()}-${file.name}`;
      console.log('Iniciando upload:', fileName);

      const url = await uploadImage(file, fileName);
      console.log('Upload completo:', url);

      onUploadComplete(url);

      toast({
        title: "Upload completo",
        description: "A imagem foi carregada com sucesso!",
      });
    } catch (error) {
      console.error('Erro no upload:', error);
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
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" />
          Fazendo upload...
        </div>
      )}
    </div>
  );
}