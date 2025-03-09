import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { classicChallenges } from "@/lib/game-data";
import { useSound } from "@/hooks/use-sound";
import { Shuffle } from "lucide-react";

export default function ClassicMode() {
  const [currentChallenge, setCurrentChallenge] = useState("");
  const { play } = useSound();

  const generateChallenge = () => {
    play("click");
    const challenge = classicChallenges[Math.floor(Math.random() * classicChallenges.length)];
    setCurrentChallenge(challenge);
  };

  return (
    <GameLayout title="Modo Clássico">
      <div className="flex flex-col items-center gap-8">
        <AnimatePresence mode="wait">
          {currentChallenge && (
            <motion.div
              key={currentChallenge}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-3xl font-bold text-center"
            >
              {currentChallenge}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          size="lg"
          onClick={generateChallenge}
          className="bg-white/20 hover:bg-white/30 text-white text-xl px-8 py-6"
        >
          <Shuffle className="mr-2 h-6 w-6" />
          Gerar Desafio
        </Button>
      </div>
    </GameLayout>
  );
}
