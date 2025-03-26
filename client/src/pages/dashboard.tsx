import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GamepadIcon, History, Trophy, Clock, Play, Sparkles } from "lucide-react";
import { PromotionalBanner } from "@/components/PromotionalBanner";
import { AdBanner } from "@/components/AdBanner";
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
      <div className="min-h-screen w-full">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Banners */}
          <section className="pb-4 overflow-hidden rounded-xl">
            <PromotionalBanner />
          </section>

          {/* Ad Banner */}
          <section className="pb-4">
            <AdBanner />
          </section>

          {/* Carrossel de Jogos em Destaque */}
          <section className="pt-0 pb-4">
            <h2 className="text-white text-lg font-medium mb-3 ml-1">Jogos em destaque</h2>
            <Carousel
              className="w-full"
              opts={{
                align: "start",
                dragFree: true,
                skipSnaps: true,
                inViewThreshold: 0.5,
              }}
            >
              <CarouselContent className="-ml-2">
                {games.map((game) => (
                  <CarouselItem key={game.id} className="pl-2 basis-[28%] sm:basis-[22%]">
                    <div
                      className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(game.route)}
                    >
                      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                        <game.icon className="h-7 w-7 text-white" />
                      </div>
                      <span className="text-xs text-white text-center mt-1 leading-tight h-8 whitespace-pre-line">
                        {formatGameName(game.name)}
                      </span>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </section>

          {/* Bem-vindo ao Gorf */}
          <Card className="bg-white/10 backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle className="text-white">Bem-vindo ao Gorf!</CardTitle>
              <CardDescription className="text-white/60">
                Escolha um jogo para começar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                onClick={() => navigate("/game-modes")}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white"
              >
                <GamepadIcon className="mr-2 h-5 w-5" />
                Ver Todos os Jogos
              </Button>
            </CardContent>
          </Card>

          {/* Último Jogo */}
          {lastGame && (
            <Card className="bg-white/10 backdrop-blur-lg border-none">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Último Jogo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-white/90">
                  <p className="text-lg font-semibold">{lastGame.name}</p>
                  <p className="text-sm text-white/60">
                    {formatDistanceToNow(new Date(lastGame.playedAt), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                </div>
                <Button
                  onClick={() => navigate(findGameRoute(lastGame.name))}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Jogar Novamente
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recomendação de Jogo */}
          <GameRecommendationCard className="bg-white border-gray-200 shadow-md" />

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white/10 backdrop-blur-lg border-none">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Total de Jogos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  {userProfile?.gameStats?.totalGamesPlayed || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-none">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tempo Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  {Math.round((userProfile?.gameStats?.totalPlayTime || 0) / 60)}h
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Jogos Recentes */}
          {recentGames.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-lg border-none">
              <CardHeader>
                <CardTitle className="text-white">Jogos Recentes</CardTitle>
                <CardDescription className="text-white/60">
                  Seus últimos jogos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentGames.map((game: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    >
                      <div>
                        <p className="text-white font-medium">{game.name}</p>
                        <p className="text-sm text-white/60">
                          {formatDistanceToNow(new Date(game.playedAt), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => navigate(findGameRoute(game.name))}
                        className="bg-purple-700 hover:bg-purple-800 text-white"
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