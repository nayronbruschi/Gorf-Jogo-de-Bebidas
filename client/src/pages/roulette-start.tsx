import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { PlayerList } from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Beer, Flame } from "lucide-react";

type GameMode = "goles" | "shots";

const modes: Record<GameMode, {
  name: string;
  description: string;
  icon: any;
}> = {
  goles: {
    name: "Goles",
    description: "Se você vai jogar bebendo um drink, uma cerveja ou algo mais tranquilo essa é a opção para você.",
    icon: Beer,
  },
  shots: {
    name: "Shots!",
    description: "Se você é hardcore e vai jogar com shots (vodka, tequila, entre outros), essa é a opção a se escolher.",
    icon: Flame,
  }
};

export default function RouletteStart() {
  const [, navigate] = useLocation();
  const [selectedMode, setSelectedMode] = useState<GameMode>("goles");

  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const handleStartGame = () => {
    // Salvar o modo selecionado no localStorage
    localStorage.setItem("rouletteMode", selectedMode);
    // Ir para a página de configuração de jogadores
    navigate("/roulette/players");
  };

  return (
    <GameLayout title="">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Seção de Jogadores */}
        <section>
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Jogadores
          </h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <PlayerList />
          </div>
        </section>

        {/* Seção de Modos de Jogo */}
        <section>
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Modo de Jogo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.entries(modes) as [GameMode, typeof modes[GameMode]][]).map(([key, mode]) => (
              <button
                key={key}
                onClick={() => setSelectedMode(key)}
                className={`p-6 rounded-xl transition-all ${
                  selectedMode === key
                    ? "bg-white text-purple-700 shadow-lg scale-105"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <mode.icon className="h-8 w-8" />
                  <span className="text-lg font-semibold">{mode.name}</span>
                  <span className="text-sm opacity-80 text-center">{mode.description}</span>
                </div>
              </button>
            ))}
          </div>
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