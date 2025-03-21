import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ImageUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function BannerUploader() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBanner, setSelectedBanner] = useState<string>("1");
  const [bannerUrls, setBannerUrls] = useState<Record<string, string>>({});
  const [isPublishing, setIsPublishing] = useState(false);

  // Carregar banners existentes
  const { data: existingBanners = {} } = useQuery({
    queryKey: ["/api/banners"],
    onSuccess: (data) => {
      setBannerUrls(data);
    },
  });

  const handleUploadComplete = (url: string) => {
    setBannerUrls(prev => ({
      ...prev,
      [selectedBanner]: url
    }));

    toast({
      title: "Imagem carregada",
      description: `Banner ${selectedBanner} foi atualizado com sucesso!`,
    });
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          banners: bannerUrls
        })
      });
      
      // Forçar atualização dos dados no cliente
      await queryClient.invalidateQueries({ queryKey: ["/api/banners"] });

      if (!response.ok) {
        throw new Error('Falha ao publicar banners');
      }

      // Atualizar cache do React Query
      await queryClient.invalidateQueries({ queryKey: ["/api/banners"] });

      toast({
        title: "Banners publicados",
        description: "Os banners foram atualizados com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao publicar:', error);
      toast({
        title: "Erro ao publicar",
        description: "Não foi possível publicar os banners.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-none">
      <CardHeader>
        <CardTitle className="text-white">Upload de Banners</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-sm text-white/60">Selecione o banner</label>
            <Select
              value={selectedBanner}
              onValueChange={setSelectedBanner}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Selecione o banner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Banner 1</SelectItem>
                <SelectItem value="2">Banner 2</SelectItem>
                <SelectItem value="3">Banner 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ImageUploader onUploadComplete={handleUploadComplete} />

          {Object.entries(bannerUrls).map(([number, url]) => (
            <div key={number} className="mt-4">
              <p className="text-sm text-white/60 mb-2">Banner {number}</p>
              <img 
                src={url} 
                alt={`Banner ${number}`} 
                className="rounded-lg max-h-48 w-full object-cover"
              />
            </div>
          ))}

          {Object.keys(bannerUrls).length > 0 && (
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isPublishing ? "Publicando..." : "Publicar Banners"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}