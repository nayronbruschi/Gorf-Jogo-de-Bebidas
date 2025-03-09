import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Trophy, Play } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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
      // Limpar todos os jogadores antes de redirecionar
      await apiRequest("DELETE", "/api/players/all", {});
      // Redirecionar para a página de modos de jogo
      navigate("/game-modes");
    } catch (error) {
      console.error('Erro ao limpar jogadores:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center"
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
            className="bg-purple-500 hover:bg-purple-600"
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