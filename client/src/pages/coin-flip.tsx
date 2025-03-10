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
    // Definir o resultado antes da animação
    const newResult = Math.random() < 0.5 ? "cara" : "coroa";
    setResult(null);

    setTimeout(() => {
      setResult(newResult);
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
            className="w-full h-full [transform-style:preserve-3d]"
            animate={isFlipping ? {
              rotateX: [0, 720],
              y: [0, -200, 0],
            } : {
              rotateY: result === "coroa" ? 180 : 0
            }}
            transition={{
              duration: isFlipping ? 1.5 : 0.6,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
          >
            {/* Face da moeda (Cara) */}
            <div 
              className="absolute w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 
                         [backface-visibility:hidden] flex items-center justify-center border-4 border-yellow-300"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-yellow-300 flex items-center justify-center">
                  <div className="absolute w-3 h-3 rounded-full bg-yellow-700" style={{ top: '30%', left: '40%' }} />
                  <div className="absolute w-3 h-3 rounded-full bg-yellow-700" style={{ top: '30%', right: '40%' }} />
                  <div className="absolute w-8 h-4 rounded-full border-2 border-yellow-700" style={{ top: '60%', left: '50%', transform: 'translateX(-50%)' }} />
                </div>
              </div>
            </div>

            {/* Face da moeda (Coroa) */}
            <div 
              className="absolute w-full h-full rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 
                         [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center 
                         border-4 border-yellow-300"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-yellow-300 flex items-center justify-center">
                  <div className="w-12 h-12 relative">
                    <div className="absolute w-full h-2 bg-yellow-700 top-0 left-0" />
                    <div className="absolute w-2 h-8 bg-yellow-700 top-2 left-1" />
                    <div className="absolute w-2 h-8 bg-yellow-700 top-2 right-1" />
                    <div className="absolute w-2 h-8 bg-yellow-700 top-2 left-[calc(50%-1px)]" />
                    <div className="absolute w-8 h-2 bg-yellow-700 bottom-0 left-[calc(50%-16px)]" />
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