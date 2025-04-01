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
      <div className="min-h-screen w-full">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Banners */}
          <section className="overflow-hidden rounded-xl mb-4">
            <PromotionalBanner />
          </section>

          {/* Ad Banner - Bloco_Ad_Dashboard */}
          <section className="mb-6 flex justify-center">
            <GoogleAdBlock 
              slot="4976890273" 
              className="max-w-full overflow-hidden"
            />
          </section>

          {/* Carrossel de Jogos em Destaque */}
          <section className="mb-6">
            <h2 className="text-gorf-purple text-lg font-medium mb-5 mx-2">Jogos em destaque</h2>
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
                      <div className="w-14 h-14 rounded-full bg-gorf-purple flex items-center justify-center shadow-md">
                        <game.icon className="h-7 w-7 text-white" />
                      </div>
                      <span className="text-xs font-medium text-slate-800 text-center mt-1 leading-tight h-8 whitespace-pre-line">
                        {formatGameName(game.name)}
                      </span>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </section>

          {/* Bem-vindo ao Gorf */}
          <Card className="bg-white shadow-md border-slate-100">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-t-lg">
              <CardTitle>Bem-vindo ao Gorf!</CardTitle>
              <CardDescription className="text-white/90">
                Escolha um jogo para começar
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button
                size="lg"
                onClick={() => navigate("/game-modes")}
                className="w-full bg-gorf-green hover:bg-green-700 text-white"
              >
                <GamepadIcon className="mr-2 h-5 w-5" />
                Ver Todos os Jogos
              </Button>
            </CardContent>
          </Card>

          {/* Último Jogo */}
          {lastGame && (
            <Card className="bg-white shadow-md border-slate-100">
              <CardHeader className="bg-gradient-to-r from-purple-800 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Último Jogo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="text-slate-800">
                  <p className="text-lg font-semibold">{lastGame.name}</p>
                  <p className="text-sm text-slate-500">
                    {formatDistanceToNow(new Date(lastGame.playedAt), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                </div>
                <Button
                  onClick={() => navigate(findGameRoute(lastGame.name))}
                  className="w-full bg-gorf-purple hover:bg-purple-900 text-white"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Jogar Novamente
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recomendação de Jogo */}
          <GameRecommendationCard className="bg-white shadow-md border-slate-100" />

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white shadow-md border-slate-100">
              <CardHeader className="bg-green-600 text-white rounded-t-lg pb-3 flex flex-col items-center">
                <Trophy className="h-7 w-7 mb-1" />
                <CardTitle className="text-base text-center">
                  Total de Jogos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold text-gorf-green">
                  {userProfile?.gameStats?.totalGamesPlayed || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md border-slate-100">
              <CardHeader className="bg-green-600 text-white rounded-t-lg pb-3 flex flex-col items-center">
                <Clock className="h-7 w-7 mb-1" />
                <CardTitle className="text-base text-center">
                  Tempo Total
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold text-gorf-green">
                  {Math.round((userProfile?.gameStats?.totalPlayTime || 0) / 60)}h
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Jogos Recentes */}
          {recentGames.length > 0 && (
            <Card className="bg-white shadow-md border-slate-100">
              <CardHeader className="bg-gradient-to-r from-purple-800 to-purple-600 text-white rounded-t-lg">
                <CardTitle>Jogos Recentes</CardTitle>
                <CardDescription className="text-white/80">
                  Seus últimos jogos
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {recentGames.map((game: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-100 shadow-sm"
                    >
                      <div>
                        <p className="text-slate-800 font-medium">{game.name}</p>
                        <p className="text-sm text-slate-500">
                          {formatDistanceToNow(new Date(game.playedAt), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => navigate(findGameRoute(game.name))}
                        className="bg-gorf-purple hover:bg-purple-900 text-white"
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