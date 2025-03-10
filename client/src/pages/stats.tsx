import { useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { auth } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Stats() {
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

  const gameStats = [
    {
      game: "Roleta",
      played: 10,
      wins: 5,
      totalPlayers: 20,
      avgTime: "15min",
    },
    {
      game: "Quem Sou Eu?",
      played: 8,
      wins: 3,
      totalPlayers: 16,
      avgTime: "20min",
    },
    {
      game: "Verdade ou Desafio",
      played: 6,
      wins: 4,
      totalPlayers: 12,
      avgTime: "30min",
    },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-8">
        <Card className="bg-white/10 backdrop-blur-lg border-none">
          <CardHeader>
            <CardTitle className="text-white">Estatísticas por Jogo</CardTitle>
            <CardDescription className="text-white/60">
              Seu desempenho em cada modalidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gameStats.map((stat) => (
                <div
                  key={stat.game}
                  className="bg-white/5 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">
                      {stat.game}
                    </h3>
                    <span className="text-white/60 text-sm">
                      Média: {stat.avgTime}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-white/60">Partidas</p>
                      <p className="text-xl font-bold text-white">
                        {stat.played}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Vitórias</p>
                      <p className="text-xl font-bold text-white">{stat.wins}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Jogadores</p>
                      <p className="text-xl font-bold text-white">
                        {stat.totalPlayers}
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${(stat.wins / stat.played) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
