import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Roulette } from "@/components/Roulette";
import { useSound } from "@/hooks/use-sound";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, Beer, Brain, Flame, Sparkles } from "lucide-react";

type GameMode = "classic" | "hardcore" | "custom" | "noAlcohol";

interface RouletteOption {
  text: string;
  color: string;
}

const modes: Record<GameMode, {
  name: string;
  description: string;
  icon: any;
  options: RouletteOption[];
}> = {
  classic: {
    name: "Modo Clássico",
    description: "Desafios clássicos e divertidos!",
    icon: Sparkles,
    options: [
      { text: "Beba 2 Goles", color: "#7e22ce" },
      { text: "Escolha Alguém", color: "#9333ea" },
      { text: "Passe a Vez", color: "#a855f7" },
      { text: "Todos Bebem", color: "#c084fc" },
      { text: "Invente uma Regra", color: "#d946ef" },
      { text: "Beba 1 Gole", color: "#e879f9" }
    ]
  },
  hardcore: {
    name: "Modo Hardcore",
    description: "Desafios mais intensos e ousados!",
    icon: Flame,
    options: [
      { text: "Shot!", color: "#7e22ce" },
      { text: "2 Shots!", color: "#9333ea" },
      { text: "Vire o Copo", color: "#a855f7" },
      { text: "Todos Tomam Shot", color: "#c084fc" },
      { text: "Desafio + Shot", color: "#d946ef" },
      { text: "Shot ou Desafio", color: "#e879f9" }
    ]
  },
  noAlcohol: {
    name: "Sem Álcool",
    description: "Diversão sem bebida!",
    icon: Brain,
    options: [
      { text: "Dance 30s", color: "#7e22ce" },
      { text: "Conte uma Piada", color: "#9333ea" },
      { text: "Imite Alguém", color: "#a855f7" },
      { text: "Faça 10 Flexões", color: "#c084fc" },
      { text: "Cante uma Música", color: "#d946ef" },
      { text: "Invente uma Dança", color: "#e879f9" }
    ]
  },
  custom: {
    name: "Personalizado",
    description: "Crie seus próprios desafios!",
    icon: Settings2,
    options: [
      { text: "Desafio 1", color: "#7e22ce" },
      { text: "Desafio 2", color: "#9333ea" },
      { text: "Desafio 3", color: "#a855f7" },
      { text: "Desafio 4", color: "#c084fc" },
      { text: "Desafio 5", color: "#d946ef" },
      { text: "Desafio 6", color: "#e879f9" }
    ]
  }
};

export default function RouletteMode() {
  const [currentMode, setCurrentMode] = useState<GameMode>("classic");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { play } = useSound();

  const handleSpinEnd = (index: number) => {
    setSelectedOption(index);
    play("tada");
  };

  return (
    <GameLayout title="">
      <div className="flex flex-col items-center gap-8">
        {/* Seleção de Modo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          {(Object.entries(modes) as [GameMode, typeof modes[GameMode]][]).map(([key, mode]) => (
            <button
              key={key}
              onClick={() => setCurrentMode(key)}
              className={`p-4 rounded-xl transition-all ${
                currentMode === key
                  ? "bg-white text-purple-700 shadow-lg scale-105"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <mode.icon className="h-6 w-6" />
                <span className="font-semibold">{mode.name}</span>
                <span className="text-sm opacity-80">{mode.description}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Roleta */}
        <div className="w-full max-w-xl">
          <Roulette
            options={modes[currentMode].options}
            onSpinEnd={handleSpinEnd}
          />
        </div>

        {/* Resultado */}
        <AnimatePresence mode="wait">
          {selectedOption !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 w-full max-w-xl text-center"
            >
              <h3 className="text-2xl font-bold text-white mb-2">
                {modes[currentMode].options[selectedOption].text}
              </h3>
              <p className="text-white/80">
                Completou o desafio? Próximo jogador!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
}