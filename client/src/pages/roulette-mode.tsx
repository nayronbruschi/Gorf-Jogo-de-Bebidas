import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSound } from "@/hooks/use-sound";
import { useQuery } from "@tanstack/react-query";

const rouletteActions = [
  { text: "Beba 2 Goles", color: "bg-red-500" },
  { text: "Escolha Alguém", color: "bg-blue-500" },
  { text: "Beba 1 Gole", color: "bg-green-500" },
  { text: "Passe a Vez", color: "bg-yellow-500" },
];

export default function RouletteMode() {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const { play } = useSound();

  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const spinWheel = () => {
    if (spinning) return;

    play("click");
    setSpinning(true);

    const newRotation = rotation + 1800 + Math.random() * 360;
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      play("tada");
    }, 3000);
  };

  const segments = rouletteActions.length;
  const segmentAngle = 360 / segments;

  return (
    <GameLayout title="Roleta">
      <div className="flex flex-col items-center gap-8">
        <div className="relative w-64 h-64 md:w-96 md:h-96">
          {/* Círculo base */}
          <div className="absolute inset-0 rounded-full bg-white/10" />

          {/* Roleta */}
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500"
            style={{
              rotate: rotation,
              transition: spinning ? "all 3s cubic-bezier(0.2, 0.8, 0.2, 1)" : undefined,
            }}
          >
            {rouletteActions.map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 h-full w-[2px] bg-white/20 origin-top"
                style={{
                  rotate: `${i * segmentAngle}deg`,
                }}
              />
            ))}
          </motion.div>

          {/* Ponteiro */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-x-[15px] border-x-transparent border-b-[30px] border-b-white" />
        </div>

        <Button
          size="lg"
          onClick={spinWheel}
          disabled={spinning}
          className="bg-white/20 hover:bg-white/30 text-white text-xl px-8 py-6"
        >
          Girar Roleta
        </Button>
      </div>
    </GameLayout>
  );
}