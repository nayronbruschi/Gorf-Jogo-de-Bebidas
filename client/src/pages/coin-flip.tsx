import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";

export default function CoinFlip() {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<"cara" | "coroa" | null>(null);

  const flipCoin = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setResult(null);

    setTimeout(() => {
      setResult(Math.random() < 0.5 ? "cara" : "coroa");
      setIsFlipping(false);
    }, 1500);
  };

  return (
    <GameLayout title="Cara ou Coroa">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center mb-4">
          <p className="text-white/80">
            Cara bebe, coroa passa!
          </p>
        </div>

        <div className="relative w-32 h-32">
          <motion.div
            className="w-full h-full"
            animate={isFlipping ? {
              rotateX: [0, 720 + (Math.random() < 0.5 ? 180 : 0)],
              y: [0, -150, 0],
              scale: [1, 1.1, 1]
            } : {}}
            transition={{
              duration: 1.5,
              times: [0, 0.5, 1],
              y: {
                type: "spring",
                stiffness: 200,
                damping: 15
              }
            }}
          >
            <div className="relative w-full h-full perspective-1000">
              <div className={`absolute w-full h-full rounded-full transition-transform duration-500 ${isFlipping ? "animate-flip" : ""}`}>
                {/* Cara */}
                <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center transform-style-3d backface-hidden border-4 border-yellow-300">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full bg-yellow-300 flex items-center justify-center">
                      <div className="absolute w-3 h-3 rounded-full bg-yellow-700" style={{ top: '30%', left: '40%' }} />
                      <div className="absolute w-3 h-3 rounded-full bg-yellow-700" style={{ top: '30%', right: '40%' }} />
                      <div className="absolute w-8 h-4 rounded-full border-2 border-yellow-700" style={{ top: '60%', left: '50%', transform: 'translateX(-50%)' }} />
                    </div>
                  </div>
                </div>
                {/* Coroa */}
                <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center transform rotateY-180 transform-style-3d backface-hidden border-4 border-yellow-300">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full bg-yellow-300 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-12 h-12 text-yellow-700" fill="currentColor">
                        <path d="M12 1L15.5 9L23 9L17 14L19.5 22L12 17.5L4.5 22L7 14L1 9L8.5 9L12 1Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {result && !isFlipping && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-white"
          >
            {result.toUpperCase()}!
          </motion.div>
        )}

        <Button
          size="lg"
          onClick={flipCoin}
          disabled={isFlipping}
          className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-6 text-xl"
        >
          <Coins className="mr-2 h-5 w-5" />
          {isFlipping ? "Jogando..." : "Jogar Moeda"}
        </Button>
      </div>
    </GameLayout>
  );
}