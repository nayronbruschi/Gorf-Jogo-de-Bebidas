import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { truthQuestions, dares } from "@/lib/game-data";
import { useSound } from "@/hooks/use-sound";

type Mode = "truth" | "dare" | null;

export default function TruthOrDare() {
  const [mode, setMode] = useState<Mode>(null);
  const [challenge, setChallenge] = useState("");
  const { play } = useSound();

  const generateChallenge = (selectedMode: Mode) => {
    if (!selectedMode) return;
    
    play("click");
    const list = selectedMode === "truth" ? truthQuestions : dares;
    const newChallenge = list[Math.floor(Math.random() * list.length)];
    setMode(selectedMode);
    setChallenge(newChallenge);
  };

  return (
    <GameLayout title="Verdade ou Desafio">
      <div className="flex flex-col items-center gap-8">
        <div className="flex gap-4">
          <Button
            size="lg"
            onClick={() => generateChallenge("truth")}
            className="bg-blue-500/50 hover:bg-blue-500/70 text-white px-8"
          >
            Verdade
          </Button>
          <Button
            size="lg"
            onClick={() => generateChallenge("dare")}
            className="bg-red-500/50 hover:bg-red-500/70 text-white px-8"
          >
            Desafio
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {challenge && (
            <motion.div
              key={challenge}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="mb-4 text-xl font-bold">
                {mode === "truth" ? "Verdade" : "Desafio"}
              </div>
              <div className="text-2xl">{challenge}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
}
