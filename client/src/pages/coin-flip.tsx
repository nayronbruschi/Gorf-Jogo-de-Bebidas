import { useState, useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Crown, SmilePlus } from "lucide-react";
import { auth, updateGameStats } from "@/lib/firebase";

export default function CoinFlip() {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<"cara" | "coroa" | null>(null);

  // Registrar o jogo assim que entrar na página
  useEffect(() => {
    const trackGameOpen = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          await updateGameStats(userId, "Cara ou Coroa");
        }
      } catch (error) {
        console.error("[CoinFlip] Error tracking game:", error);
      }
    };

    trackGameOpen();
  }, []);

  const flipCoin = () => {
    if (isFlipping) return;

    // Fazer o sorteio imediatamente, mas não mostrar ainda
    const newResult = Math.random() < 0.5 ? "cara" : "coroa";
    
    // Ocultar o resultado anterior e iniciar a animação
    setIsFlipping(true);
    setResult(null); // Limpar o resultado anterior para não mostrar ícones durante o giro
    
    // Definir o resultado para que a animação termine mostrando a face correta
    // Mas ainda não mostrar o texto nem o ícone
    setTimeout(() => {
      // Definimos o resultado antes de terminar a animação
      // para garantir que mostrará a face correta
      setResult(newResult);
    }, 1400);

    // Finalizar a animação e mostrar tudo
    setTimeout(() => {
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

        <div className="relative w-[85vw] h-[85vw] max-w-[500px] max-h-[500px]">
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
                         [backface-visibility:hidden] flex items-center justify-center border-[12px] border-yellow-300
                         shadow-xl"
            >
              <div className="relative w-2/3 h-2/3">
                <div className="absolute inset-0 rounded-full bg-yellow-300 flex items-center justify-center">
                  {!isFlipping && result === "cara" && (
                    <SmilePlus className="w-2/3 h-2/3 text-yellow-700" />
                  )}
                </div>
              </div>
            </div>

            {/* Face da moeda (Coroa) */}
            <div 
              className="absolute w-full h-full rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 
                         [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center 
                         border-[12px] border-yellow-300 shadow-xl"
            >
              <div className="relative w-2/3 h-2/3">
                <div className="absolute inset-0 rounded-full bg-yellow-300 flex items-center justify-center">
                  {!isFlipping && result === "coroa" && (
                    <Crown className="w-2/3 h-2/3 text-yellow-700" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {!isFlipping && result && (
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
          className="bg-purple-900 hover:bg-purple-950 text-white px-8 py-6 text-xl"
        >
          {isFlipping ? "Jogando..." : "Jogar Moeda"}
        </Button>
      </div>
    </GameLayout>
  );
}