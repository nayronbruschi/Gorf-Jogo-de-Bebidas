import { useState, useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Roulette } from "@/components/Roulette";
import { useSound } from "@/hooks/use-sound";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, Beer, Brain, Flame, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
      { text: "Beba 2 Goles", color: "#ef4444" },
      { text: "Escolha Alguém", color: "#3b82f6" },
      { text: "Passe a Vez", color: "#eab308" },
      { text: "Todos Bebem", color: "#84cc16" },
      { text: "Invente uma Regra", color: "#8b5cf6" },
      { text: "Beba 1 Gole", color: "#ec4899" }
    ]
  },
  hardcore: {
    name: "Modo Hardcore",
    description: "Desafios mais intensos e ousados!",
    icon: Flame,
    options: [
      { text: "Shot!", color: "#dc2626" },
      { text: "2 Shots!", color: "#9333ea" },
      { text: "Vire o Copo", color: "#ea580c" },
      { text: "Todos Tomam Shot", color: "#059669" },
      { text: "Desafio + Shot", color: "#2563eb" },
      { text: "Shot ou Desafio", color: "#db2777" }
    ]
  },
  noAlcohol: {
    name: "Sem Álcool",
    description: "Diversão sem bebida!",
    icon: Brain,
    options: [
      { text: "Dance 30s", color: "#f97316" },
      { text: "Conte uma Piada", color: "#84cc16" },
      { text: "Imite Alguém", color: "#06b6d4" },
      { text: "Faça 10 Flexões", color: "#8b5cf6" },
      { text: "Cante uma Música", color: "#ec4899" },
      { text: "Invente uma Dança", color: "#f43f5e" }
    ]
  },
  custom: {
    name: "Personalizado",
    description: "Crie seus próprios desafios!",
    icon: Settings2,
    options: [
      { text: "Desafio 1", color: "#ef4444" },
      { text: "Desafio 2", color: "#3b82f6" },
      { text: "Desafio 3", color: "#eab308" },
      { text: "Desafio 4", color: "#84cc16" },
      { text: "Desafio 5", color: "#8b5cf6" },
      { text: "Desafio 6", color: "#ec4899" }
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