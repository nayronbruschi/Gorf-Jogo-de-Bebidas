import { useEffect, useRef, useState } from "react";
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
import { GamepadIcon, Trophy, Users, Clock, ArrowDown } from "lucide-react";
import { PromotionalBanner } from "@/components/PromotionalBanner";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { games } from "@/lib/game-data";
import { getUserStats } from "@/lib/stats";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const isRefreshing = useRef(false);
  const startY = useRef(0);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  // Fetch user stats from Firebase
  const { data: userStats, refetch: refetchStats } = useQuery({
    queryKey: ['userStats'],
    queryFn: getUserStats
  });

  // Fetch recent games from Firebase
  const { data: recentGames, refetch: refetchGames } = useQuery({
    queryKey: ['recentGames'],
    queryFn: async () => {
      if (!auth.currentUser) return [];
      const recentGamesRef = doc(db, 'recentGames', auth.currentUser.uid);
      const recentGamesDoc = await getDoc(recentGamesRef);
      return recentGamesDoc.exists() ? recentGamesDoc.data().games : [];
    }
  });

  // Pull to refresh logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].pageY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = async (e: TouchEvent) => {
      if (container.scrollTop === 0 && !isRefreshing.current && isPulling) {
        const currentY = e.touches[0].pageY;
        const diff = currentY - startY.current;
        setPullDistance(Math.max(0, Math.min(diff, 80)));

        if (diff > 50) {
          isRefreshing.current = true;
          // Refresh all queries
          await Promise.all([
            refetchStats(),
            refetchGames(),
            queryClient.invalidateQueries({ queryKey: ["/api/banners"] })
          ]);
          isRefreshing.current = false;
          setIsPulling(false);
          setPullDistance(0);
        }
      }
    };

    const handleTouchEnd = () => {
      setIsPulling(false);
      setPullDistance(0);
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [queryClient, refetchStats, refetchGames, isPulling]);

  const stats = [
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
      value: `${Math.floor((userStats?.totalPlayTime || 0) / 60)}h`,
      description: "De diversão",
      icon: Clock,
    },
  ];

  const getGamePath = (gameName: string): string => {
    const gameMap: Record<string, string> = games.reduce((acc, game) => ({
      ...acc,
      [game.name]: game.route
    }), {});
    return gameMap[gameName] || "/game-modes";
  };

  return (
    <AppLayout>
      <div 
        ref={containerRef}
        className="relative h-screen overflow-auto"
      >
        {/* Pull to refresh indicator */}
        <AnimatePresence>
          {isPulling && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: 1, 
                y: pullDistance - 20,
                rotate: pullDistance > 50 ? 180 : 0
              }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 z-50 text-white flex items-center gap-2"
            >
              <ArrowDown className="h-6 w-6" />
              <span className="text-sm">
                {pullDistance > 50 ? "Solte para atualizar" : "Puxe para atualizar"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="container mx-auto p-4 space-y-4 min-h-screen bg-gray-900/80">
          <section className="pb-2">
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
                      <span className="text-xs text-white text-center mt-1">{game.name}</span>
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
                      <p className="text-sm text-white/60 mb-4">{recentGames[0].date}</p>
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
                  {recentGames.map((game: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5"
                    >
                      <div>
                        <p className="text-white font-medium">{game.name}</p>
                        <p className="text-sm text-white/60">{game.date}</p>
                        <p className="text-sm text-white/60">
                          {game.players} jogadores 
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        className="shrink-0 text-white hover:bg-white/10"
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