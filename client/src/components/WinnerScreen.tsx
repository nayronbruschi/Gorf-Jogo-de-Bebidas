import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Trophy, Play } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface WinnerScreenProps {
  onPlayAgain: () => void;
}

export function WinnerScreen({ onPlayAgain }: WinnerScreenProps) {
  const [, navigate] = useLocation();

  const handleChooseNewGame = async () => {
    try {
      // Limpar localStorage
      localStorage.clear();

      // Limpar todos os jogadores
      await apiRequest("DELETE", "/api/players/all", {});

      // Invalidar queries para forçar recarregamento dos dados
      await queryClient.invalidateQueries();

      // Esperar um momento para garantir que tudo foi processado
      await new Promise(resolve => setTimeout(resolve, 100));

      // Usar navigate para transição suave
      navigate("/game-modes");
    } catch (error) {
      console.error('Erro ao limpar jogadores:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center z-50">
      {/* Animação de Confete */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            initial={{
              opacity: 0,
              x: Math.random() * window.innerWidth,
              y: -10,
              rotate: 0
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: window.innerHeight + 10,
              x: `${Math.random() * 200 - 100}vw`,
              rotate: Math.random() * 360
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            style={{
              backgroundColor: ['#FFD700', '#FF69B4', '#4CAF50', '#1E90FF'][Math.floor(Math.random() * 4)]
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center relative z-10"
      >
        <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-6" />

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Alguém deu gorf!
        </h2>

        <p className="text-gray-600 mb-6">
          E parece que bebeu muito!
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={onPlayAgain}
            className="bg-purple-700 hover:bg-purple-800 text-white hover:text-white flex items-center justify-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Jogar de novo
          </Button>
          <Button
            onClick={handleChooseNewGame}
            variant="outline"
            className="border-purple-700 text-purple-700 hover:bg-purple-50 hover:text-purple-700"
          >
            Escolher outro jogo
          </Button>
        </div>
      </motion.div>
    </div>
  );
}