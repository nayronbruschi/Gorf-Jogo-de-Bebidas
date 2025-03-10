import { useEffect } from "react";
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
import { GamepadIcon, Trophy, Users, Clock } from "lucide-react";
import { PromotionalBanner } from "@/components/PromotionalBanner";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { games } from "@/lib/game-data";
import { getUserStats } from "@/lib/stats";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const [, navigate] = useLocation();

  // Buscar estatísticas do usuário
  const { data: userStats } = useQuery({
    queryKey: ['userStats'],
    queryFn: getUserStats
  });

  const stats = [
    {
      title: "Jogos Jogados",
      value: userStats?.totalGamesPlayed.toString() || "0",
      description: "Total de partidas",
      icon: GamepadIcon,
    },
    {
      title: "Vitórias",
      value: userStats?.totalVictories.toString() || "0",
      description: "Jogos vencidos",
      icon: Trophy,
    },
    {
      title: "Jogadores",
      value: userStats?.uniquePlayers.toString() || "0",
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

  const recentGames = [
    { name: "Roleta", date: "Hoje", players: 4, winner: "João" },
    { name: "Quem Sou Eu?", date: "Ontem", players: 3, winner: "Maria" },
    { name: "Verdade ou Desafio", date: "2 dias atrás", players: 5, winner: "-" },
  ];

  const getGamePath = (gameName: string) => {
    const gameMap = games.reduce((acc, game) => ({
      ...acc,
      [game.name]: game.route
    }), {});
    return gameMap[gameName] || "/game-modes";
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-8 min-h-screen bg-gray-900/80">
        <section className="pb-4">
          <PromotionalBanner />
        </section>

        <section className="pb-4">
          <h2 className="text-white text-lg font-medium mb-4">Todos os Jogos</h2>
          <Carousel 
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-4">
              {games.map((game) => (
                <CarouselItem key={game.id} className="pl-4 basis-[22%] md:basis-[22%] lg:basis-[22%]">
                  <div 
                    className="flex flex-col items-center gap-2 p-4 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(game.route)}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                      <game.icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="text-sm text-white text-center">{game.name}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-white/10 backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle className="text-white">Último Jogo</CardTitle>
              <CardDescription className="text-white/60">
                Continue de onde parou
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-lg bg-white/5">
                  <h3 className="text-lg font-medium text-white mb-2">Roleta</h3>
                  <p className="text-sm text-white/60 mb-4">Jogado há 2 horas</p>
                  <Button 
                    onClick={() => navigate("/roulette")}
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                  >
                    Jogar Novamente
                  </Button>
                </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="space-y-4">
              {recentGames.map((game, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5"
                >
                  <div>
                    <p className="text-white font-medium">{game.name}</p>
                    <p className="text-sm text-white/60">{game.date}</p>
                    <p className="text-sm text-white/60">
                      {game.players} jogadores • Vencedor: {game.winner}
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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}