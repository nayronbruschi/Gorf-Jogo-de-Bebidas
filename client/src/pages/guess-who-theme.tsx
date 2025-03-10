import { useEffect } from "react";
import { useLocation } from "wouter";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { themes, type ThemeId } from "@/lib/guess-who-data";
import {
  Cat, UserSquare2, Clapperboard, Palmtree,
  Box, Users
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

  // Verificar se existem jogadores selecionados
  useEffect(() => {
    const players = localStorage.getItem("guessWhoPlayers");
    if (!players) {
      setLocation("/guess-who/players");
    }
  }, [setLocation]);

  const handleSelectTheme = (themeId: ThemeId) => {
    localStorage.setItem("guessWhoTheme", themeId);
    setLocation("/guess-who/play");
  };

  return (
    <GameLayout title="Quem Sou Eu?">
      <div className="flex flex-col items-center gap-8 p-4">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white mb-2">Escolha o Tema</h2>
          <p className="text-white/80">
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
                className="flex flex-col items-center gap-2 p-6 h-auto bg-purple-700/50 hover:bg-purple-700"
                variant="ghost"
              >
                <Icon className="w-12 h-12" />
                <span className="text-lg font-medium">{theme.name}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </GameLayout>
  );
}
