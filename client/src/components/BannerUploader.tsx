import * as React from "react";
const { useState, useEffect } = React;
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
  const { data: existingBanners = {} } = useQuery<Record<string, string>>({
    queryKey: ["/api/banners"],
  });
  
  // Atualizar bannerUrls quando os dados forem carregados
  useEffect(() => {
    if (existingBanners && Object.keys(existingBanners).length > 0) {
      setBannerUrls(existingBanners);
    }
  }, [existingBanners]);

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
          <div className="p-4 bg-purple-800/20 rounded-lg border border-purple-700/20 mb-4">
            <h3 className="text-white font-semibold mb-2">⚠️ Importante</h3>
            <p className="text-white/80 text-sm">
              Os textos dos banners são exibidos em cor branca sobre a imagem. Para melhor visibilidade, 
              recomendamos usar imagens com fundo escuro ou com um gradiente. Evite banners com fundo totalmente branco.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <div className="flex-1 p-2 bg-gradient-to-r from-purple-900 to-blue-900 rounded text-white text-xs text-center">
                ✅ Fundo escuro (recomendado)
              </div>
              <div className="flex-1 p-2 bg-white rounded text-purple-900 border border-purple-300 text-xs text-center">
                ❌ Fundo branco (evitar)
              </div>
            </div>
          </div>
          
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
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-white/60">Banner {number}</p>
                <div className="text-xs px-2 py-0.5 rounded bg-purple-700/30 text-white/80">
                  {number === selectedBanner ? "Selecionado" : ""}
                </div>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-white/10">
                <img 
                  src={url} 
                  alt={`Banner ${number}`} 
                  className="max-h-48 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-2 text-white text-shadow font-medium">
                  Texto de exemplo para visualização
                </div>
              </div>
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