import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { BannerUploader } from "@/components/BannerUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";

interface BannerTexts {
  title: string;
  description: string;
}

export default function Admin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
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
    "1": { title: "Bem-vindo ao Gorf", description: "O melhor app para suas festas" },
    "2": { title: "Diversão Garantida", description: "Jogos para todos os momentos" }
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
    mutationFn: async () => {
      await apiRequest("POST", '/api/banner-texts', bannerTexts);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Textos dos banners atualizados",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar textos dos banners",
        variant: "destructive",
      });
    }
  });

  const handleUpdateBannerTexts = async () => {
    try {
      await updateTexts.mutateAsync();
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