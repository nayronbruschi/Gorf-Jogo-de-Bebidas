import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Beer, Home } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function RouletteWinner() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const playerId = params.get("playerId");
  const gameMode = localStorage.getItem("rouletteMode") || "goles";

  const handlePlayAgain = async () => {
    try {
      // Resetar apenas os pontos dos jogadores
      await apiRequest("POST", "/api/players/reset", {});
      await queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      navigate("/roulette/play");
    } catch (error) {
      console.error('Erro ao reiniciar jogo:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden">
      <motion.div
        initial={{ y: -1000 }}
        animate={{ y: 0 }}
        transition={{
          duration: 2,
          ease: [0.87, 0, 0.13, 1],
        }}
        className="absolute inset-x-0 top-0 h-[200%]"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full fill-purple-800/30 backdrop-blur-sm"
          preserveAspectRatio="none"
        >
          <motion.path
            initial={{ d: "M0,0 L100,0 L100,20 Q50,40 0,20 Z" }}
            animate={{
              d: [
                "M0,0 L100,0 L100,20 Q50,40 0,20 Z",
                "M0,0 L100,0 L100,30 Q75,60 50,45 Q25,30 0,30 Z",
                "M0,0 L100,0 L100,40 Q80,70 60,55 Q40,40 20,55 Q0,70 0,40 Z",
                "M0,0 L100,0 L100,50 Q90,80 70,65 Q50,50 30,65 Q10,80 0,50 Z",
                "M0,0 L100,0 L100,20 Q50,40 0,20 Z"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut"
            }}
          />
        </svg>
      </motion.div>

      <div className="relative min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 1
          }}
          className="max-w-lg w-full mx-auto text-center px-4"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 relative shadow-xl">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="space-y-6"
            >
              <h1 className="text-4xl font-bold text-purple-900">
                Alguém deu Gorf!
              </h1>

              <div className="flex items-center justify-center gap-2 text-2xl text-purple-700">
                <Beer className="h-8 w-8" />
                <span>
                  Parabéns ao vencedor!
                </span>
              </div>

              <div className="flex flex-col gap-4 mt-8">
                <Button
                  size="lg"
                  onClick={handlePlayAgain}
                  className="bg-purple-700 hover:bg-purple-800 text-white text-xl py-6"
                >
                  Jogar de novo
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/game-modes")}
                  className="border-purple-700 text-purple-700 hover:bg-purple-50 text-xl py-6"
                >
                  <Home className="mr-2 h-6 w-6" />
                  Escolher outro jogo
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}