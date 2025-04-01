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
      <div className="max-w-4xl mx-auto space-y-10 px-4">
        {/* Cabeçalho estilo Apple */}
        <header className="text-center">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-purple-600">
            GORF
          </h1>
          <p className="text-gray-500 text-sm mt-2 tracking-wide">
            Configure sua partida
          </p>
        </header>

        {/* Layout moderno em grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna dos jogadores */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-800 to-purple-700 py-4 px-5">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-users">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
                  </svg>
                  Jogadores
                </h2>
              </div>
              <div className="p-5">
                <div className="shadow-sm rounded-xl overflow-hidden border border-gray-100">
                  <PlayerList />
                </div>
              </div>
            </div>
          </div>

          {/* Configurações do jogo */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-800 to-purple-700 py-4 px-5">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Configurações
                </h2>
              </div>
              <div className="p-5">
                <div className="space-y-8 px-3">
                  {/* Máximo por rodada */}
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 11V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v7"></path>
                          <path d="M3 15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path>
                          <path d="M10 2v10"></path>
                          <path d="M14 2v10"></path>
                          <path d="M8 21l4-4 4 4"></path>
                          <path d="M12 17v4"></path>
                        </svg>
                      </div>
                      <label className="text-purple-900 text-lg font-medium">
                        {gameMode === "shots" ? "Shots por rodada" : "Goles por rodada"}
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="rounded-full w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-purple-700"
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
                        className="bg-white text-purple-900 border border-gray-200 text-center text-xl flex-1"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="rounded-full w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-purple-700"
                        onClick={() => {
                          const max = gameMode === "shots" ? 5 : 15;
                          setMaxPerRound(prev => Math.min(max, Number(prev) + 1).toString());
                        }}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-gray-500 text-sm mt-3">
                      {gameMode === "shots"
                        ? "Número máximo de shots por rodada (1-5)"
                        : "Número máximo de goles por rodada (2-15)"}
                    </p>
                  </div>

                  {/* Total para vencer */}
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-100 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                          <path d="M4 22h16"></path>
                          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                        </svg>
                      </div>
                      <label className="text-purple-900 text-lg font-medium">
                        Total para vencer
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="rounded-full w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-purple-700"
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
                        className="bg-white text-purple-900 border border-gray-200 text-center text-xl flex-1"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="rounded-full w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-purple-700"
                        onClick={() => setMaxToWin(prev => Math.min(200, Number(prev) + 5).toString())}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-gray-500 text-sm mt-3">
                      Quantidade total de {gameMode === "shots" ? "shots" : "goles"} para vencer o jogo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Iniciar estilo Apple */}
        <div className="flex justify-center mt-10">
          <Button
            size="lg"
            onClick={handleStartGame}
            disabled={players.length < 2}
            className={`px-10 py-6 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
              players.length >= 2
                ? "bg-gradient-to-br from-gorf-green to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:shadow-xl hover:scale-[1.02]"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
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