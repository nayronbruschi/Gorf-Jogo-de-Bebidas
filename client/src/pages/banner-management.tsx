import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BannerUploader } from "@/components/BannerUploader";
import { auth } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface BannerTexts {
  title: string;
  description: string;
  linkUrl?: string;
  isClickable?: boolean;
}

export default function BannerManagement() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Get banner texts from the API
  const { data: initialBannerTexts, isLoading } = useQuery({
    queryKey: ['/api/banner-texts'],
    queryFn: async () => {
      const response = await apiRequest("GET", '/api/banner-texts', undefined);
      const data = await response.json();
      return data as Record<string, BannerTexts>;
    }
  });

  const [bannerTexts, setBannerTexts] = useState<Record<string, BannerTexts>>({
    "1": { 
      title: "Bem-vindo ao Gorf", 
      description: "O melhor app para suas festas",
      linkUrl: "",
      isClickable: false
    },
    "2": { 
      title: "Diversão Garantida", 
      description: "Jogos para todos os momentos",
      linkUrl: "",
      isClickable: false
    }
  });

  // Update banner texts when data is loaded
  useEffect(() => {
    if (initialBannerTexts) {
      setBannerTexts(initialBannerTexts);
    }
  }, [initialBannerTexts]);

  useEffect(() => {
    // Verificar se o usuário é o admin
    const currentUser = auth.currentUser;
    if (currentUser?.email === "nayronbruschi@gmail.com") {
      setIsAuthenticated(true);
    }
  }, []);

  const updateTexts = useMutation({
    mutationFn: async (data: typeof bannerTexts) => {
      const response = await apiRequest("POST", '/api/banner-texts', data);
      if (!response.ok) {
        throw new Error('Failed to update banner texts');
      }
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch banner texts queries
      queryClient.invalidateQueries({ queryKey: ['/api/banner-texts'] });
      toast({
        title: "Sucesso",
        description: "Textos dos banners atualizados",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar textos:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar textos dos banners",
        variant: "destructive",
      });
    }
  });

  const handleUpdateBannerTexts = async () => {
    try {
      await updateTexts.mutateAsync(bannerTexts);
    } catch (error) {
      console.error('Erro ao atualizar textos:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4 max-w-md">
          <Card className="bg-white/10 backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle className="text-white">Acesso Restrito</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">
                Você precisa estar logado como administrador para acessar esta página.
              </p>
              <Button onClick={() => navigate("/admin")} className="w-full">
                Voltar para Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4">
          <Card className="bg-white/10 backdrop-blur-lg border-none">
            <CardContent className="p-8 flex items-center justify-center">
              <div className="text-white">Carregando configurações de banners...</div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Gerenciamento de Banners</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin")}
            className="text-white/80 border-white/20 hover:bg-white/10"
          >
            Voltar para Dashboard
          </Button>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-none">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Textos dos Banners
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-purple-800/20 rounded-lg border border-purple-700/20 mb-4">
              <h3 className="text-white font-semibold mb-2">🎮 Dica para banners</h3>
              <p className="text-white/80 text-sm">
                Para melhor visibilidade do texto, recomendamos usar banners com áreas escuras ou com gradientes. 
                Evite banners com fundo branco ou muito claro, pois o texto é exibido em branco.
              </p>
            </div>
            
            {Object.entries(bannerTexts).map(([key, texts]) => (
              <div key={key} className="space-y-4">
                <h3 className="text-lg font-medium text-white">Banner {key}</h3>
                <div className="space-y-2">
                  <Input
                    value={texts.title}
                    onChange={(e) => setBannerTexts(prev => ({
                      ...prev,
                      [key]: { ...prev[key], title: e.target.value }
                    }))}
                    placeholder="Título"
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Textarea
                    value={texts.description}
                    onChange={(e) => setBannerTexts(prev => ({
                      ...prev,
                      [key]: { ...prev[key], description: e.target.value }
                    }))}
                    placeholder="Descrição"
                    className="bg-white/10 border-white/20 text-white"
                  />
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <Switch
                      id={`clickable-${key}`}
                      checked={texts.isClickable || false}
                      onCheckedChange={(checked) => setBannerTexts(prev => ({
                        ...prev,
                        [key]: { ...prev[key], isClickable: checked }
                      }))}
                    />
                    <label 
                      htmlFor={`clickable-${key}`}
                      className="text-sm text-white/80"
                    >
                      Banner clicável
                    </label>
                  </div>
                  
                  {texts.isClickable && (
                    <div className="mt-2 space-y-4">
                      <div>
                        <Select
                          value={texts.linkUrl?.startsWith("http") ? "_none_" : (texts.linkUrl || "_none_")}
                          onValueChange={(value) => setBannerTexts(prev => ({
                            ...prev,
                            [key]: { ...prev[key], linkUrl: value === "_none_" ? "" : value }
                          }))}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Selecione uma página do aplicativo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_none_">Nenhuma (selecione)</SelectItem>
                            <SelectItem value="/dashboard">Dashboard</SelectItem>
                            <SelectItem value="/game-modes">Modos de Jogo</SelectItem>
                            <SelectItem value="/classic">Modo Clássico</SelectItem>
                            <SelectItem value="/truth-or-dare">Verdade ou Desafio</SelectItem>
                            <SelectItem value="/spin-bottle">Girar a Garrafa</SelectItem>
                            <SelectItem value="/touch-game">Toque na Sorte</SelectItem>
                            <SelectItem value="/coin-flip">Cara ou Coroa</SelectItem>
                            <SelectItem value="/cards">Jogo de Cartas</SelectItem>
                            <SelectItem value="/guess-who/theme">Quem Sou Eu</SelectItem>
                            <SelectItem value="/profile">Perfil</SelectItem>
                            <SelectItem value="/stats">Estatísticas</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-white/60 mt-1">
                          Selecione uma página do aplicativo ou insira uma URL personalizada abaixo
                        </p>
                      </div>
                      
                      <div>
                        <Input
                          value={texts.linkUrl?.startsWith("http") ? texts.linkUrl : ""}
                          onChange={(e) => setBannerTexts(prev => ({
                            ...prev,
                            [key]: { ...prev[key], linkUrl: e.target.value }
                          }))}
                          placeholder="Ou insira uma URL externa (ex: https://google.com)"
                          className="bg-white/10 border-white/20 text-white"
                        />
                        <p className="text-xs text-white/60 mt-1">
                          Para redirecionar para um site externo, digite a URL completa com https://
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <Button 
              onClick={handleUpdateBannerTexts}
              className="w-full mt-4"
              disabled={updateTexts.isPending}
            >
              {updateTexts.isPending ? "Salvando..." : "Salvar Textos"}
            </Button>
            
            <div className="mt-8 pt-8 border-t border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">Upload de Banners</h3>
              <BannerUploader />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}