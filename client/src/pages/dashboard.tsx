import { useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GamepadIcon, Trophy, Users, Clock } from "lucide-react";

export default function Dashboard() {
  const [, navigate] = useLocation();

  // Proteger rota
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/auth");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const stats = [
    {
      title: "Jogos Jogados",
      value: "24",
      description: "Total de partidas",
      icon: GamepadIcon,
    },
    {
      title: "Vitórias",
      value: "12",
      description: "Jogos vencidos",
      icon: Trophy,
    },
    {
      title: "Jogadores",
      value: "48",
      description: "Participantes únicos",
      icon: Users,
    },
    {
      title: "Tempo Total",
      value: "8h",
      description: "De diversão",
      icon: Clock,
    },
  ];

  const recentGames = [
    { name: "Roleta", date: "Hoje", players: 4, winner: "João" },
    { name: "Quem Sou Eu?", date: "Ontem", players: 3, winner: "Maria" },
    { name: "Verdade ou Desafio", date: "2 dias atrás", players: 5, winner: "-" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-white/10 backdrop-blur-lg border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-white text-lg font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-white/60" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-white/60 text-sm">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <div>
                      <p className="text-white font-medium">{game.name}</p>
                      <p className="text-sm text-white/60">{game.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/80">{game.players} jogadores</p>
                      <p className="text-sm text-white/60">
                        Vencedor: {game.winner}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle className="text-white">Jogar Agora</CardTitle>
              <CardDescription className="text-white/60">
                Escolha um dos nossos jogos divertidos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
      </div>
    </AppLayout>
  );
}
