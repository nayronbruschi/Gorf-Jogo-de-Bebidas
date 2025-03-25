import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image } from "lucide-react";

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  multiple?: boolean;
}

export function ImageUploader({ onUploadComplete, multiple = false }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Para upload único, validar apenas o primeiro arquivo
    if (!multiple && files[0].size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Por favor, selecione uma imagem menor que 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      if (multiple) {
        // Upload múltiplo
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.size > 5 * 1024 * 1024) {
            toast({
              title: "Arquivo ignorado",
              description: `A imagem ${file.name} é maior que 5MB e foi ignorada`,
              variant: "destructive",
            });
            continue;
          }

          const fileName = `${Date.now()}-${file.name}`;
          const url = await uploadImage(file, fileName);
          onUploadComplete(url);
        }
      } else {
        // Upload único
        const file = files[0];
        const fileName = `${Date.now()}-${file.name}`;
        const url = await uploadImage(file, fileName);
        onUploadComplete(url);
      }

      toast({
        title: "Upload completo",
        description: "A(s) imagem(ns) foi(ram) carregada(s) com sucesso!",
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
      <label
        className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${isUploading ? 'border-purple-500 bg-purple-100' : 'border-gray-300 hover:border-purple-500 bg-gray-50 hover:bg-purple-50'}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-2" />
              <p className="text-sm text-purple-600 font-medium">Fazendo upload...</p>
            </>
          ) : (
            <>
              <Image className="h-8 w-8 text-gray-500 mb-2" />
              <p className="text-sm text-gray-500">
                {multiple ? "Arraste ou clique para selecionar várias imagens" : "Arraste ou clique para selecionar uma imagem"}
              </p>
            </>
          )}
        </div>
        <Input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
      </label>
    </div>
  );
}