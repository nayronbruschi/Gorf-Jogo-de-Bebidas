import { useState, useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { PlayerList } from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function RoulettePlayers() {
  const [, navigate] = useLocation();
  const gameMode = localStorage.getItem("rouletteMode") || "goles";
  const [maxPerRound, setMaxPerRound] = useState(gameMode === "shots" ? "3" : "10");
  const [maxToWin, setMaxToWin] = useState("100");

  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const handleStartGame = () => {
    // Salvar configurações no localStorage
    localStorage.setItem("maxPerRound", maxPerRound);
    localStorage.setItem("maxPoints", maxToWin);
    // Ir para a página do jogo
    navigate("/roulette/play");
  };

  return (
    <GameLayout title="">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Seção de Jogadores */}
        <section>
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Jogadores
          </h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <PlayerList />
          </div>
        </section>

        {/* Seção de Configurações */}
        <section>
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Configurações
          </h2>
          <Card className="bg-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Regras do Jogo</CardTitle>
              <CardDescription className="text-white/80">
                Define os limites para cada rodada e para vencer o jogo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">
                  Máximo por rodada
                </label>
                <Input
                  type="number"
                  value={maxPerRound}
                  onChange={(e) => setMaxPerRound(e.target.value)}
                  min={gameMode === "shots" ? "1" : "2"}
                  max={gameMode === "shots" ? "5" : "15"}
                  className="bg-white/20 text-white border-0"
                />
                <p className="text-white/60 text-xs mt-1">
                  {gameMode === "shots" 
                    ? "Número máximo de shots por rodada (1-5)"
                    : "Número máximo de goles por rodada (2-15)"}
                </p>
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">
                  Total para vencer
                </label>
                <Input
                  type="number"
                  value={maxToWin}
                  onChange={(e) => setMaxToWin(e.target.value)}
                  min="10"
                  max="200"
                  className="bg-white/20 text-white border-0"
                />
                <p className="text-white/60 text-xs mt-1">
                  Quantidade total de {gameMode === "shots" ? "shots" : "goles"} para vencer o jogo
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Botão de Iniciar */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleStartGame}
            disabled={players.length < 2}
            className={`px-8 py-6 flex items-center justify-center ${
              players.length >= 2 
                ? "bg-purple-700 hover:bg-purple-800 text-white"
                : "bg-white/20 hover:bg-white/30 text-white"
            }`}
          >
            <Play className="mr-2 h-6 w-6" />
            {players.length < 2 
              ? "Mínimo 2 jogadores"
              : "Vamos começar!"}
          </Button>
        </div>
      </div>
    </GameLayout>
  );
}
