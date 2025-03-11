import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ImageUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function BannerUploader() {
  const { toast } = useToast();
  const [selectedBanner, setSelectedBanner] = useState<string>("1");
  const [bannerUrls, setBannerUrls] = useState<Record<string, string>>({});
  const [isPublishing, setIsPublishing] = useState(false);

  const handleUploadComplete = (url: string) => {
    setBannerUrls(prev => ({
      ...prev,
      [selectedBanner]: url
    }));
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await fetch('/api/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          banners: bannerUrls
        })
      });

      toast({
        title: "Banners publicados",
        description: "Os banners foram atualizados com sucesso!",
      });
    } catch (error) {
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