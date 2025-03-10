import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { PlayerList } from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Play, Plus, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RoulettePlayers() {
  const [, navigate] = useLocation();
  const gameMode = localStorage.getItem("rouletteMode") || "goles";
  const [maxPerRound, setMaxPerRound] = useState(gameMode === "shots" ? "3" : "10");
  const [maxToWin, setMaxToWin] = useState("15");

  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const handleStartGame = () => {
    // Garantir valores numéricos válidos
    const maxPerRoundNumber = Math.max(
      gameMode === "shots" ? 1 : 2,
      Math.min(gameMode === "shots" ? 5 : 15, Number(maxPerRound))
    );
    const maxToWinNumber = Math.max(10, Math.min(200, Number(maxToWin)));

    // Salvar configurações no localStorage
    localStorage.setItem("maxPerRound", String(maxPerRoundNumber));
    localStorage.setItem("maxPoints", String(maxToWinNumber));

    console.log('Configurações do jogo:', {
      modo: gameMode,
      maximoPorRodada: maxPerRoundNumber,
      pontosParaVencer: maxToWinNumber
    });

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
              <CardTitle className="text-white text-2xl">Regras do Jogo</CardTitle>
              <CardDescription className="text-white/80 text-lg">
                Define os limites para cada rodada e para vencer o jogo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <label className="text-white text-lg mb-4 block">
                  Máximo por rodada
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="rounded-full w-10 h-10 flex items-center justify-center bg-white/10 border-0 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => {
                      const min = gameMode === "shots" ? 1 : 2;
                      setMaxPerRound(prev => Math.max(min, Number(prev) - 1).toString());
                    }}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <Input
                    type="number"
                    value={maxPerRound}
                    onChange={(e) => setMaxPerRound(e.target.value)}
                    min={gameMode === "shots" ? "1" : "2"}
                    max={gameMode === "shots" ? "5" : "15"}
                    className="bg-white/20 text-white border-0 text-center text-xl"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="rounded-full w-10 h-10 flex items-center justify-center bg-white/10 border-0 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => {
                      const max = gameMode === "shots" ? 5 : 15;
                      setMaxPerRound(prev => Math.min(max, Number(prev) + 1).toString());
                    }}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-white/60 text-base mt-2">
                  {gameMode === "shots" 
                    ? "Número máximo de shots por rodada (1-5)"
                    : "Número máximo de goles por rodada (2-15)"}
                </p>
              </div>

              <div>
                <label className="text-white text-lg mb-4 block">
                  Total para vencer
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="rounded-full w-10 h-10 flex items-center justify-center bg-white/10 border-0 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => setMaxToWin(prev => Math.max(10, Number(prev) - 5).toString())}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <Input
                    type="number"
                    value={maxToWin}
                    onChange={(e) => setMaxToWin(e.target.value)}
                    min="10"
                    max="200"
                    className="bg-white/20 text-white border-0 text-center text-xl"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="rounded-full w-10 h-10 flex items-center justify-center bg-white/10 border-0 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => setMaxToWin(prev => Math.min(200, Number(prev) + 5).toString())}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-white/60 text-base mt-2">
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