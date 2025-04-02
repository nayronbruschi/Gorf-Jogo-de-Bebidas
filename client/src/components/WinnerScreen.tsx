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
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Fundo moderno em gradiente com blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 backdrop-blur-sm"></div>
      
      {/* Efeitos de design - círculos decorativos */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-green-300 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-400 rounded-full filter blur-3xl opacity-20"></div>
      
      {/* Animação de Confete estilo Apple */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            initial={{
              opacity: 0,
              x: Math.random() * window.innerWidth,
              y: -20,
              scale: Math.random() * 0.5 + 0.5,
              rotate: 0
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: window.innerHeight + 20,
              x: `${Math.random() * 300 - 150}vw`,
              rotate: Math.random() * 720 - 360,
              scale: Math.random() * 0.8 + 0.2
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
            style={{
              width: `${Math.random() * 12 + 5}px`,
              height: `${Math.random() * 12 + 5}px`,
              backgroundColor: [
                '#FFD700', // Gold
                '#FF69B4', // Hot Pink
                '#4CAF50', // Green
                '#1E90FF', // Dodger Blue
                '#FFA500', // Orange
                '#9C27B0', // Purple
                '#00BCD4', // Cyan
                '#FFEB3B'  // Yellow
              ][Math.floor(Math.random() * 8)]
            }}
          />
        ))}
      </div>

      {/* Card central estilo Apple */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="bg-white/90 backdrop-blur-lg rounded-3xl p-10 max-w-md w-full mx-4 text-center relative z-10 shadow-2xl"
      >
        {/* Círculo com gradiente e troféu */}
        <div className="relative mx-auto mb-8 w-28 h-28">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full"></div>
          <div className="absolute -inset-1 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full opacity-50 blur-sm"></div>
          <div className="relative h-full w-full flex items-center justify-center">
            <Trophy className="h-14 w-14 text-white" />
          </div>
        </div>

        {/* Título com estilo chamativo */}
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-900 mb-2">
          Temos um vencedor!
        </h2>

        <p className="text-gray-600 text-lg mb-8">
          E parece que bebeu muito!
        </p>

        {/* Botões com estilo moderno */}
        <div className="space-y-4">
          <Button
            onClick={onPlayAgain}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg py-6 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full flex items-center justify-center"
          >
            <Play className="h-5 w-5 mr-2" />
            Jogar Novamente
          </Button>
          
          <Button
            onClick={handleChooseNewGame}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-lg py-6 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full"
          >
            Escolher Outro Jogo
          </Button>
        </div>
      </motion.div>
    </div>
  );
}