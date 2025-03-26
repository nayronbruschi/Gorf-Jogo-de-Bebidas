import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { games } from "@/lib/game-data";

// Interface para as tags de destaque
interface FeaturedGameTags {
  [gameId: string]: {
    isFeatured: boolean;
    tagText?: string;
  };
}

export default function FeaturedTags() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Buscar as tags de destaque da API
  const { data: initialFeaturedTags, isLoading } = useQuery<FeaturedGameTags>({
    queryKey: ['/api/featured-tags']
  });

  // Estado local para as tags de destaque
  const [featuredTags, setFeaturedTags] = useState<FeaturedGameTags>({});

  // Atualizar estado local quando os dados são carregados
  useEffect(() => {
    if (initialFeaturedTags) {
      setFeaturedTags(initialFeaturedTags);
    } else {
      // Inicializar com todos os jogos não destacados por padrão
      const defaultTags: FeaturedGameTags = {};
      games.forEach(game => {
        defaultTags[game.id] = {
          isFeatured: false,
          tagText: "Destaque"
        };
      });
      setFeaturedTags(defaultTags);
    }
  }, [initialFeaturedTags]);

  useEffect(() => {
    // Em ambiente de desenvolvimento, permitir acesso sem autenticação
    if (process.env.NODE_ENV === 'development') {
      setIsAuthenticated(true);
      return;
    }
    
    // Verificar se o usuário é o admin em produção
    const currentUser = auth.currentUser;
    if (currentUser?.email === "nayronbruschi@gmail.com") {
      setIsAuthenticated(true);
    }
  }, []);

  // Mutação para atualizar as tags de destaque
  const updateFeaturedTags = useMutation({
    mutationFn: async (data: FeaturedGameTags) => {
      const response = await apiRequest("POST", '/api/featured-tags', data);
      if (!response.ok) {
        throw new Error('Falha ao atualizar tags de destaque');
      }
      return response;
    },
    onSuccess: () => {
      // Invalidar e refetch consultas
      queryClient.invalidateQueries({ queryKey: ['/api/featured-tags'] });
      toast({
        title: "Sucesso",
        description: "Tags de destaque atualizadas",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar tags:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar tags de destaque",
        variant: "destructive",
      });
    }
  });

  const handleUpdateFeaturedTags = async () => {
    try {
      await updateFeaturedTags.mutateAsync(featuredTags);
    } catch (error) {
      console.error('Erro ao atualizar tags:', error);
    }
  };

  // Toggle para destacar/remover destaque de um jogo
  const toggleFeatured = (gameId: string) => {
    setFeaturedTags(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        isFeatured: !prev[gameId]?.isFeatured
      }
    }));
  };

  // Atualizar o texto da tag de um jogo
  const updateTagText = (gameId: string, text: string) => {
    setFeaturedTags(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        tagText: text
      }
    }));
  };

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4 max-w-md">
          <Card className="bg-white shadow border border-gray-100">
            <CardHeader>
              <CardTitle className="text-purple-900">Acesso Restrito</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Você precisa estar logado como administrador para acessar esta página.
              </p>
              <Button onClick={() => navigate("/admin")} className="w-full bg-purple-600">
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
          <Card className="bg-white shadow border border-gray-100">
            <CardContent className="p-8 flex items-center justify-center">
              <div className="text-purple-700">Carregando configurações de tags...</div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-purple-900">Gerenciamento de Tags de Destaque</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin")}
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            Voltar para Dashboard
          </Button>
        </div>

        <Card className="bg-white shadow border border-gray-100">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-purple-900 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Configurar Tags de Destaque
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 mb-4">
              <h3 className="text-purple-900 font-semibold mb-2">🎯 Dica para tags de destaque</h3>
              <p className="text-purple-800 text-sm">
                As tags de destaque aparecem no canto superior direito dos cards de jogos na página principal. 
                Ative o switch para destacar um jogo e personalize o texto da tag conforme necessário.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {games.map((game) => (
                <Card key={game.id} className="overflow-hidden border border-purple-100">
                  <div className="p-4 flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 p-2 rounded-md">
                        <game.icon className="h-6 w-6 text-purple-700" />
                      </div>
                      <div>
                        <h3 className="font-medium text-purple-900">{game.name}</h3>
                        <p className="text-xs text-purple-600 mt-1">{game.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={featuredTags[game.id]?.isFeatured || false}
                      onCheckedChange={() => toggleFeatured(game.id)}
                      className="data-[state=checked]:bg-purple-700"
                    />
                  </div>
                  
                  {featuredTags[game.id]?.isFeatured && (
                    <div className="p-4 pt-0">
                      <Input
                        value={featuredTags[game.id]?.tagText || "Destaque"}
                        onChange={(e) => updateTagText(game.id, e.target.value)}
                        placeholder="Texto da tag (ex: Destaque, Novo, Hot)"
                        className="border-purple-200 text-purple-900 bg-purple-50/50 focus-visible:ring-purple-400"
                      />
                      <p className="text-xs text-purple-600 mt-1">
                        Texto que será exibido na tag de destaque
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
            
            <Button 
              onClick={handleUpdateFeaturedTags}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
              disabled={updateFeaturedTags.isPending}
            >
              {updateFeaturedTags.isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}