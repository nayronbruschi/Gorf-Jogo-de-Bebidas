import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSound } from "@/hooks/use-sound";
import { useQuery } from "@tanstack/react-query";

const rouletteActions = [
  { text: "Beba 2 Goles", color: "from-red-500 to-red-600" },
  { text: "Escolha Alguém para Beber", color: "from-blue-500 to-blue-600" },
  { text: "Todos Bebem!", color: "from-green-500 to-green-600" },
  { text: "Passe a Vez", color: "from-yellow-500 to-yellow-600" },
  { text: "Beba 1 Gole", color: "from-purple-500 to-purple-600" },
  { text: "História Engraçada ou Beba", color: "from-pink-500 to-pink-600" },
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
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              rotate: rotation,
              transition: spinning ? "all 3s cubic-bezier(0.2, 0.8, 0.2, 1)" : undefined,
            }}
          >
            {rouletteActions.map((action, i) => (
              <div
                key={i}
                className="absolute top-0 left-0 w-full h-full origin-bottom-right"
                style={{
                  rotate: `${i * segmentAngle}deg`,
                  clipPath: `polygon(0 0, 100% 0, 50% 50%)`,
                }}
              >
                <div className={`w-full h-full bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                  <span
                    className="text-white font-bold text-sm transform -rotate-90 whitespace-nowrap"
                    style={{
                      marginLeft: "25%",
                    }}
                  >
                    {action.text}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
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