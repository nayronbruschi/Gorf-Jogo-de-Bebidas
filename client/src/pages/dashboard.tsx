import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GamepadIcon, History, Trophy, Clock, Play, Sparkles } from "lucide-react";
import { PromotionalBanner } from "@/components/PromotionalBanner";
import { GoogleAdBlock } from "@/components/GoogleAdBlock";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { games } from "@/lib/game-data";
import { auth, getUserProfile } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GameRecommendationCard } from "@/components/GameRecommendation";

// Função para capitalizar primeira letra de cada palavra e adicionar quebras de linha
const formatGameName = (name: string) => {
  switch (name.toLowerCase()) {
    case "quem sou eu":
      return "Quem\nSou Eu";
    case "toque na sorte":
      return "Toque na\nSorte";
    default:
      return name.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
  }
};

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [userProfile, setUserProfile] = useState<any>(null);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const loadUserProfile = async () => {
      if (userId) {
        const profile = await getUserProfile(userId);
        console.log("[Dashboard] User profile loaded:", profile);
        setUserProfile(profile);
      }
    };

    loadUserProfile();
  }, [userId]);

  if (!userId) {
    navigate("/auth");
    return null;
  }

  const lastGame = userProfile?.gameStats?.recentGames?.[0];
  const recentGames = userProfile?.gameStats?.recentGames?.slice(0, 3) || [];

  // Função para encontrar a rota do jogo pelo nome
  const findGameRoute = (gameName: string) => {
    const game = games.find(g => g.name === gameName);
    return game?.route || "/game-modes";
  };

  return (
    <AppLayout>
      <div className="min-h-screen w-full bg-gray-50">
        <div className="container mx-auto px-4 py-6 space-y-8">
          {/* Banners com design moderno */}
          <section className="overflow-hidden rounded-2xl shadow-lg mb-6">
            <PromotionalBanner />
          </section>

          {/* Ad Banner - Bloco_Ad_Dashboard */}
          <section className="mb-8 flex justify-center">
            <GoogleAdBlock 
              slot="4976890273" 
              className="max-w-full overflow-hidden rounded-xl shadow-md"
            />
          </section>

          {/* Carrossel de Jogos em Destaque com estilo Apple */}
          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-purple-900 mb-5 ml-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Jogos em destaque
            </h2>
            <Carousel
              className="w-full"
              opts={{
                align: "start",
                dragFree: true,
                skipSnaps: true,
                inViewThreshold: 0.5,
              }}
            >
              <CarouselContent className="-ml-0">
                {games.map((game) => (
                  <CarouselItem key={game.id} className="pl-4 basis-[20%] md:basis-[20%]">
                    <div
                      className="flex flex-col items-center gap-2 cursor-pointer group transition-all mx-2"
                      onClick={() => navigate(game.route)}
                    >
                      <div className="relative w-16 h-16 md:w-20 md:h-20">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl opacity-90 group-hover:opacity-100 transition-all shadow-md group-hover:shadow-lg"></div>
                        <game.icon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 md:h-10 md:w-10 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-800 text-center mt-1 leading-tight h-8 whitespace-pre-line group-hover:text-purple-700 transition-colors">
                        {formatGameName(game.name)}
                      </span>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </section>

          {/* Card de boas-vindas com estilo Apple */}
          <Card className="bg-white shadow-lg border-none rounded-2xl overflow-hidden">
            <CardHeader className="bg-purple-900 text-white pb-6">
              <CardTitle className="text-2xl">Bem-vindo!</CardTitle>
              <CardDescription className="text-white/90 text-base">
                Escolha um jogo para começar a diversão
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button
                size="lg"
                onClick={() => navigate("/game-modes")}
                className="w-full bg-[#326800] hover:bg-[#285400] text-white py-6 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <GamepadIcon className="mr-2 h-5 w-5" />
                Ver Todos os Jogos
              </Button>
            </CardContent>
          </Card>

          {/* Recomendação de Jogo com estilo Apple */}
          <GameRecommendationCard className="bg-white shadow-lg border-none rounded-2xl overflow-hidden" />

          {/* Estatísticas com estilo Apple */}
          <div className="grid grid-cols-2 gap-5">
            <Card className="bg-white shadow-lg border-none rounded-2xl overflow-hidden">
              <CardHeader className="bg-[#326800] text-white pb-4 flex flex-col items-center">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <Trophy className="h-8 w-8" />
                </div>
                <CardTitle className="text-base text-center">
                  Total de Jogos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 pb-5 text-center">
                <p className="text-4xl font-bold text-[#326800]">
                  {userProfile?.gameStats?.totalGamesPlayed || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-none rounded-2xl overflow-hidden">
              <CardHeader className="bg-[#326800] text-white pb-4 flex flex-col items-center">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <Clock className="h-8 w-8" />
                </div>
                <CardTitle className="text-base text-center">
                  Tempo Total
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 pb-5 text-center">
                <p className="text-4xl font-bold text-[#326800]">
                  {Math.round((userProfile?.gameStats?.totalPlayTime || 0) / 60)}h
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Último Jogo com estilo Apple */}
          {lastGame && (
            <Card className="bg-white shadow-lg border-none rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-700 to-purple-600 text-white pb-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <History className="h-5 w-5" />
                  Último Jogo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 pb-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <GamepadIcon className="h-6 w-6 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{lastGame.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(lastGame.playedAt), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(findGameRoute(lastGame.name))}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-5 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Jogar Novamente
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Jogos Recentes com estilo Apple */}
          {recentGames.length > 0 && (
            <Card className="bg-white shadow-lg border-none rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-700 to-purple-600 text-white pb-6">
                <CardTitle className="text-xl">Jogos Recentes</CardTitle>
                <CardDescription className="text-white/90 text-base">
                  Seus últimos jogos
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 pb-4">
                <div className="space-y-4">
                  {recentGames.map((game: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(findGameRoute(game.name))}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <GamepadIcon className="h-5 w-5 text-purple-700" />
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">{game.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(game.playedAt), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 h-9 w-9"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}