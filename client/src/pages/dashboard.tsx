import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GamepadIcon, Users, Clock } from "lucide-react";
import { PromotionalBanner } from "@/components/PromotionalBanner";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { games } from "@/lib/game-data";
import { getUserStats } from "@/lib/firebase";
import { useQuery } from "@tanstack/react-query";
import { auth, db, getRecentGames } from "@/lib/firebase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GameSession {
  name: string;
  date: string;
  players: number;
  winner: string;
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const userId = auth.currentUser?.uid;

  // Fetch user stats from Firebase
  const { data: userStats } = useQuery({
    queryKey: ['userStats', userId],
    queryFn: async () => {
      if (!userId) return null;
      return await getUserStats(userId);
    },
    enabled: !!userId
  });

  // Fetch recent games from Firebase
  const { data: recentGames } = useQuery<GameSession[]>({
    queryKey: ['recentGames', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await getRecentGames(userId);
    },
    enabled: !!userId
  });

  // Memoize stats to prevent unnecessary recalculations
  const stats = useMemo(() => [
    {
      title: "Jogos Jogados",
      value: userStats?.totalGamesPlayed?.toString() || "0",
      description: "Total de partidas",
      icon: GamepadIcon,
    },
    {
      title: "Jogadores",
      value: userStats?.uniquePlayers?.toString() || "0",
      description: "Participantes únicos",
      icon: Users,
    },
    {
      title: "Tempo Total",
      value: `${Math.floor(Number(userStats?.totalPlayTime || 0) / 60)}h`,
      description: "De diversão",
      icon: Clock,
    },
  ], [userStats]);

  // Memoize game path mapping
  const gamePathMap = useMemo(() => 
    games.reduce((acc, game) => ({
      ...acc,
      [game.name]: game.route
    }), {} as Record<string, string>),
    []
  );

  const getGamePath = (gameName: string): string => {
    return gamePathMap[gameName] || "/game-modes";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (!userId) {
    navigate("/auth");
    return null;
  }

  return (
    <AppLayout>
      <div className="min-h-screen w-full">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <section className="pb-2 overflow-hidden rounded-xl">
            <PromotionalBanner />
          </section>

          <section className="pb-2">
            <h2 className="text-white text-lg font-medium mb-2">Todos os Jogos</h2>
            <Carousel 
              className="w-full"
              opts={{
                align: "start",
                dragFree: true,
                skipSnaps: true,
                inViewThreshold: 0.5,
              }}
            >
              <CarouselContent className="-ml-4">
                {games.map((game) => (
                  <CarouselItem key={game.id} className="pl-4 basis-[22%]">
                    <div 
                      className="flex flex-col items-center gap-1 p-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(game.route)}
                    >
                      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                        <game.icon className="h-7 w-7 text-white" />
                      </div>
                      <span className="text-xs text-white text-center mt-1 px-12">{game.name}</span>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
            <Card className="bg-white/10 backdrop-blur-lg border-none">
              <CardHeader>
                <CardTitle className="text-white">Último Jogo</CardTitle>
                <CardDescription className="text-white/60">
                  Continue de onde parou
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {recentGames && recentGames.length > 0 ? (
                    <div className="p-4 rounded-lg bg-white/5">
                      <h3 className="text-lg font-medium text-white mb-2">{recentGames[0].name}</h3>
                      <p className="text-sm text-white/60 mb-4">{formatDate(recentGames[0].date)}</p>
                      <Button 
                        onClick={() => navigate(getGamePath(recentGames[0].name))}
                        className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                      >
                        Jogar Novamente
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white/60 mb-4">Você ainda não jogou nenhuma partida</p>
                      <Button
                        onClick={() => navigate("/game-modes")}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Jogar Agora
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-none">
              <CardHeader>
                <CardTitle className="text-white">Acesso Rápido</CardTitle>
                <CardDescription className="text-white/60">
                  Todos os jogos disponíveis
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
          </section>

          <Card className="bg-white/10 backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle className="text-white">Seus Dados</CardTitle>
              <CardDescription className="text-white/60">
                Estatísticas de jogo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <div key={stat.title} className="flex items-center gap-4 p-4 rounded-lg bg-white/5">
                    <stat.icon className="h-8 w-8 text-white/60" />
                    <div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-sm text-white/60">{stat.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle className="text-white">Jogos Recentes</CardTitle>
              <CardDescription className="text-white/60">
                Últimas partidas jogadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentGames && recentGames.length > 0 ? (
                <div className="space-y-4">
                  {recentGames.map((game, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5"
                    >
                      <div>
                        <p className="text-white font-medium">{game.name}</p>
                        <p className="text-sm text-white/60">{formatDate(game.date)}</p>
                        <p className="text-sm text-white/60">
                          {game.players} jogadores 
                        </p>
                      </div>
                      <Button
                        className="shrink-0 bg-purple-700 hover:bg-purple-800 text-white"
                        onClick={() => navigate(getGamePath(game.name))}
                      >
                        Jogar Novamente
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/60 mb-4">Você ainda não jogou nenhuma partida</p>
                  <Button
                    onClick={() => navigate("/game-modes")}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Jogar Agora
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}