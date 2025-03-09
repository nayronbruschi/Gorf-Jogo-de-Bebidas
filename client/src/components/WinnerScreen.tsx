import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Trophy, Play } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface WinnerScreenProps {
  winner: {
    name: string;
    points: number;
  };
  topDrinker: {
    name: string;
    drinks: number;
  };
  maxPoints: number;
  onPlayAgain: () => void;
}

export function WinnerScreen({ winner, topDrinker, maxPoints, onPlayAgain }: WinnerScreenProps) {
  const [, navigate] = useLocation();

  const handleChooseNewGame = async () => {
    try {
      // Limpar localStorage
      localStorage.clear();

      // Limpar todos os jogadores
      await apiRequest("DELETE", "/api/players/all", {});

      // Resetar configurações do jogo
      await apiRequest("PATCH", "/api/settings", { maxPoints: 100 });

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
          Essa rodada acabou :(
        </h2>

        <p className="text-gray-600 mb-4">
          O jogador(a) <span className="font-bold text-purple-600">{winner.name}</span> atingiu {maxPoints} pontos primeiro!
        </p>

        <p className="text-gray-600 mb-6">
          Mas isso não significa que foi quem mais bebeu, o jogador que mais bebeu foi{" "}
          <span className="font-bold text-purple-600">{topDrinker.name}</span> dando{" "}
          <span className="font-bold text-purple-600">{topDrinker.drinks} goles</span>!
        </p>

        <p className="text-xl font-bold text-gray-900 mb-6">
          Bora jogar de novo?
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={onPlayAgain}
            className="bg-purple-500 hover:bg-purple-600 flex items-center justify-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Jogar de novo
          </Button>
          <Button
            onClick={handleChooseNewGame}
            variant="outline"
          >
            Escolher outro jogo
          </Button>
        </div>
      </motion.div>
    </div>
  );
}