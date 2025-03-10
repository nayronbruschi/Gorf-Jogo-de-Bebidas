import { useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Beer, Home } from "lucide-react";

export default function RouletteWinner() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const playerId = params.get("playerId");
  const gameMode = localStorage.getItem("rouletteMode") || "goles";

  const { data: winner } = useQuery({
    queryKey: ["/api/players", playerId],
    enabled: !!playerId
  });

  if (!winner) return null;

  return (
    <GameLayout title="">
      <div className="relative min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className="max-w-lg w-full mx-auto text-center"
        >
          {/* Animação de Splash */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
          </motion.div>

          <div className="bg-white rounded-xl p-8 relative z-10 shadow-xl">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <h1 className="text-4xl font-bold text-purple-900">
                Parece que {winner.name} deu Gorf!
              </h1>

              <div className="flex items-center justify-center gap-2 text-2xl text-purple-700">
                <Beer className="h-8 w-8" />
                <span>
                  {winner.points} {gameMode === "shots" ? "shots" : "goles"}
                </span>
              </div>

              <div className="flex flex-col gap-4 mt-8">
                <Button
                  size="lg"
                  onClick={() => navigate("/roulette/play")}
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
    </GameLayout>
  );
}