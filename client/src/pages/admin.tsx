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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  // Dados estatísticos (simulados, mas em produção viriam do Firebase)
  const userStats = {
    totalUsers: 248,
    activeToday: 42,
    topGame: "Verdade ou Desafio",
    topGamePlays: 156,
    userLocations: [
      { city: "São Paulo", count: 89 },
      { city: "Rio de Janeiro", count: 47 },
      { city: "Belo Horizonte", count: 32 },
      { city: "Salvador", count: 24 },
      { city: "Outros", count: 56 }
    ]
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
          <div className="text-sm text-white/60">
            Último acesso: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        {/* Estatísticas no topo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-900/60 to-purple-700/60 backdrop-blur-lg border-none">
            <CardContent className="p-6">
              <div className="text-white/80 text-sm">Usuários Registrados</div>
              <div className="text-white text-3xl font-bold mt-2">{userStats.totalUsers}</div>
              <div className="text-green-400 text-xs mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +12 na última semana
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-900/60 to-purple-700/60 backdrop-blur-lg border-none">
            <CardContent className="p-6">
              <div className="text-white/80 text-sm">Ativos Hoje</div>
              <div className="text-white text-3xl font-bold mt-2">{userStats.activeToday}</div>
              <div className="text-white/50 text-xs mt-2">
                {Math.round((userStats.activeToday / userStats.totalUsers) * 100)}% do total de usuários
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-900/60 to-purple-700/60 backdrop-blur-lg border-none">
            <CardContent className="p-6">
              <div className="text-white/80 text-sm">Jogo Mais Jogado</div>
              <div className="text-white text-2xl font-bold mt-2">{userStats.topGame}</div>
              <div className="text-white/50 text-xs mt-2">
                {userStats.topGamePlays} partidas
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-900/60 to-purple-700/60 backdrop-blur-lg border-none">
            <CardContent className="p-6">
              <div className="text-white/80 text-sm">Principais Localizações</div>
              <div className="text-white text-lg font-bold mt-2">{userStats.userLocations[0].city}</div>
              <div className="text-white/50 text-xs mt-2">
                {userStats.userLocations[0].count} usuários ({Math.round((userStats.userLocations[0].count / userStats.totalUsers) * 100)}%)
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 3 Boxes principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Gerenciamento de Banners
              </CardTitle>
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
              
              <BannerUploader />
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Módulo em Desenvolvimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-white text-lg font-medium mb-2">Funcionalidade em Desenvolvimento</h3>
                <p className="text-white/60 text-sm">
                  Este módulo está sendo desenvolvido e estará disponível em breve.
                </p>
                <Button disabled className="mt-6">
                  Em breve
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Módulo em Desenvolvimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-white text-lg font-medium mb-2">Funcionalidade em Desenvolvimento</h3>
                <p className="text-white/60 text-sm">
                  Este módulo está sendo desenvolvido e estará disponível em breve.
                </p>
                <Button disabled className="mt-6">
                  Em breve
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}