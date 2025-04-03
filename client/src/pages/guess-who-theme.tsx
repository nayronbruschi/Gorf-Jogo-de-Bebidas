import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { themes, type ThemeId } from "@/lib/guess-who-data";
import {
  Cat, UserSquare2, Clapperboard, Palmtree,
  Box, Users, Play, ArrowLeft
} from "lucide-react";

const themeIcons = {
  animals: Cat,
  characters: UserSquare2,
  movies: Clapperboard,
  places: Palmtree,
  objects: Box,
  famous: Users,
} as const;

export default function GuessWhoTheme() {
  const [, setLocation] = useLocation();
  const [selectedTheme, setSelectedTheme] = useState<ThemeId | null>(null);

  useEffect(() => {
    try {
      const storedPlayers = localStorage.getItem("guessWhoPlayers");
      if (!storedPlayers) {
        setLocation("/guess-who/players");
        return;
      }

      const players = JSON.parse(storedPlayers);
      if (!Array.isArray(players) || players.length < 2) {
        setLocation("/guess-who/players");
      }
    } catch (error) {
      console.error("Erro ao verificar jogadores:", error);
      setLocation("/guess-who/players");
    }
  }, [setLocation]);

  const handleSelectTheme = (themeId: ThemeId) => {
    setSelectedTheme(themeId);
  };

  const handleStartGame = () => {
    if (!selectedTheme) return;

    try {
      const storedPlayers = localStorage.getItem("guessWhoPlayers");
      if (!storedPlayers) {
        setLocation("/guess-who/players");
        return;
      }

      localStorage.setItem("guessWhoTheme", selectedTheme);
      setLocation("/guess-who/play");
    } catch (error) {
      console.error("Erro ao selecionar tema:", error);
      setLocation("/guess-who/players");
    }
  };

  const handleBack = () => {
    setLocation("/guess-who/players");
  };

  return (
    <GameLayout title="Quem Sou Eu?">
      <div className="relative flex flex-col items-center gap-8 p-4">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4 text-white hover:text-white/80"
          onClick={handleBack}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white mb-2 bg-purple-950/60 px-6 py-2 rounded-lg inline-block">Escolha o Tema</h2>
          <p className="text-white bg-purple-950/60 px-6 py-2 rounded-lg mt-2 inline-block">
            Selecione um tema para começar o jogo
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {themes.map((theme) => {
            const Icon = themeIcons[theme.id];
            return (
              <Button
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`flex flex-col items-center gap-2 p-6 h-auto ${
                  selectedTheme === theme.id
                    ? 'bg-gorf-green hover:bg-gorf-green text-white border-4 border-purple-700'
                    : 'bg-white hover:bg-purple-50 text-purple-900 hover:text-purple-900 border-2 border-purple-300'
                }`}
                variant="ghost"
              >
                <Icon className="w-12 h-12" />
                <span className="text-lg font-medium">{theme.name}</span>
              </Button>
            );
          })}
        </div>

        <Button
          size="lg"
          onClick={handleStartGame}
          disabled={!selectedTheme}
          className="bg-gorf-green hover:bg-green-700 text-white px-8 py-6 mt-4"
        >
          <Play className="mr-2 h-6 w-6" />
          Iniciar Jogo
        </Button>
      </div>
    </GameLayout>
  );
}