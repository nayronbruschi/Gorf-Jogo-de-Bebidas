import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { BannerUploader } from "@/components/BannerUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { auth } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface BannerTexts {
  title: string;
  description: string;
  linkUrl?: string;
  isClickable?: boolean;
}

export default function Admin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Get banner texts from the API
  const { data: initialBannerTexts } = useQuery({
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "nayronbruschi@gmail.com") {
      setIsAuthenticated(true);
      toast({
        title: "Login bem sucedido",
        description: "Bem-vindo à área administrativa",
      });
    } else {
      if (email === "nayronbruschi@gmail.com" && password === "#Nayron@1996!") {
        setIsAuthenticated(true);
        toast({
          title: "Login bem sucedido",
          description: "Bem-vindo à área administrativa",
        });
      } else {
        toast({
          title: "Erro no login",
          description: "Email ou senha incorretos",
          variant: "destructive",
        });
      }
    }
  };

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
              <CardTitle className="text-white">Login Administrativo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
                {email !== "nayronbruschi@gmail.com" && (
                  <Input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                )}
                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-8">
        <h1 className="text-2xl font-bold text-white mb-8">Administração</h1>

        <div className="grid grid-cols-1 gap-8">
          <Card className="bg-white/10 backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle className="text-white">Textos dos Banners</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      <div className="mt-2">
                        <Input
                          value={texts.linkUrl || ""}
                          onChange={(e) => setBannerTexts(prev => ({
                            ...prev,
                            [key]: { ...prev[key], linkUrl: e.target.value }
                          }))}
                          placeholder="URL de redirecionamento (ex: https://google.com)"
                          className="bg-white/10 border-white/20 text-white"
                        />
                        <p className="text-xs text-white/60 mt-1">
                          Digite uma URL completa com https:// para redirecionar para um site externo
                        </p>
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
            </CardContent>
          </Card>

          <BannerUploader />
        </div>
      </div>
    </AppLayout>
  );
}