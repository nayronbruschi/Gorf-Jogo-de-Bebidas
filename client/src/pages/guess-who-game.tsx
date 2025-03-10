import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getItemsByTheme, type ThemeId } from "@/lib/guess-who-data";
import { ChevronLeft, Timer, User2 } from "lucide-react";

interface ScreenOrientation {
  lock(orientation: OrientationLockType): Promise<void>;
  unlock(): void;
  type: OrientationType;
  angle: number;
}

interface Screen extends Screen {
  orientation?: ScreenOrientation;
}

declare global {
  interface Window {
    screen: Screen;
  }
}

export default function GuessWhoGame() {
  const [, setLocation] = useLocation();
  const [players, setPlayers] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [items, setItems] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [showItem, setShowItem] = useState(false);
  const [guess, setGuess] = useState("");
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [setupTime, setSetupTime] = useState(5);
  const [isSetup, setIsSetup] = useState(true);

  // Inicialização do jogo
  useEffect(() => {
    const storedPlayers = localStorage.getItem("guessWhoPlayers");
    const theme = localStorage.getItem("guessWhoTheme") as ThemeId;

    if (!storedPlayers || !theme) {
      setLocation("/guess-who/players");
      return;
    }

    const playerList = JSON.parse(storedPlayers);
    setPlayers(playerList);

    const themeItems = getItemsByTheme(theme);
    setItems(themeItems.map(item => item.name));
    setCurrentItem(themeItems[0].name);

    // Força rotação para paisagem via CSS
    document.documentElement.style.setProperty('transform', 'rotate(-90deg)');
    document.documentElement.style.setProperty('transform-origin', 'left top');
    document.documentElement.style.setProperty('width', '100vh');
    document.documentElement.style.setProperty('height', '100vw');
    document.documentElement.style.setProperty('overflow', 'hidden');
    document.documentElement.style.setProperty('position', 'absolute');
    document.documentElement.style.setProperty('top', '100%');
    document.documentElement.style.setProperty('left', '0');

    return () => {
      // Remove CSS de rotação
      document.documentElement.style.removeProperty('transform');
      document.documentElement.style.removeProperty('transform-origin');
      document.documentElement.style.removeProperty('width');
      document.documentElement.style.removeProperty('height');
      document.documentElement.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('position');
      document.documentElement.style.removeProperty('top');
      document.documentElement.style.removeProperty('left');
    };
  }, [setLocation]);

  // Timer de preparação
  useEffect(() => {
    if (isSetup && setupTime > 0) {
      const timer = setInterval(() => {
        setSetupTime(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (isSetup && setupTime === 0) {
      setIsSetup(false);
      setShowItem(true);
      setTimeLeft(30);
    }
  }, [setupTime, isSetup]);

  // Timer principal
  useEffect(() => {
    if (!isSetup && timeLeft > 0 && showItem) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (!isSetup && timeLeft === 0 && showItem) {
      setShowItem(false);
    }
  }, [timeLeft, showItem, isSetup]);

  const handleNextPlayer = useCallback(() => {
    let nextIndex = currentPlayerIndex;
    do {
      nextIndex = (nextIndex + 1) % players.length;
    } while (eliminated.includes(players[nextIndex]));

    if (nextIndex === currentPlayerIndex) {
      // Todos os jogadores foram eliminados
      setLocation("/game-modes");
      return;
    }

    setCurrentPlayerIndex(nextIndex);
    const randomItem = items[Math.floor(Math.random() * items.length)];
    setCurrentItem(randomItem);
    setSetupTime(5);
    setIsSetup(true);
    setShowItem(false);
    setGuess("");
  }, [currentPlayerIndex, players, eliminated, items, setLocation]);

  const handleGuess = () => {
    if (guess.toLowerCase().trim() === currentItem.toLowerCase().trim()) {
      // Jogador venceu
      setLocation("/game-modes");
    } else {
      // Jogador eliminado
      setEliminated([...eliminated, players[currentPlayerIndex]]);
      if (eliminated.length + 1 >= players.length - 1) {
        // Jogo acabou, todos eliminados
        setLocation("/game-modes");
      } else {
        handleNextPlayer();
      }
    }
  };

  if (players.length === 0) return null;

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-purple-800 overflow-hidden">
      {/* Barra Superior */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/20"
          onClick={() => setLocation("/game-modes")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <User2 className="w-6 h-6" />
            <span className="text-xl font-medium">
              {currentPlayer}
            </span>
          </div>
        </div>
      </div>

      {/* Área Principal */}
      <div className="absolute inset-0 mt-16 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {isSetup ? (
            <motion.div
              key="setup"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center space-y-6"
            >
              <h2 className="text-4xl font-bold text-white">
                É a vez de {currentPlayer}
              </h2>
              <p className="text-xl text-white/80">
                Coloque o celular de lado na testa
              </p>
              <div className="text-8xl font-bold text-white">
                {setupTime}
              </div>
            </motion.div>
          ) : showItem ? (
            <motion.div
              key="item"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center space-y-8"
            >
              <div className="text-4xl font-bold text-white">
                {currentItem}
              </div>
              <div className="text-8xl font-bold text-white">
                {timeLeft}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="guess"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <Input
                type="text"
                placeholder="Quem você acha que é?"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                className="text-lg p-6 w-full max-w-md"
              />
              <div className="flex gap-4">
                <Button
                  onClick={handleGuess}
                  className="bg-purple-700 hover:bg-purple-800 text-white"
                  size="lg"
                >
                  Chutar
                </Button>
                <Button
                  onClick={handleNextPlayer}
                  variant="outline"
                  size="lg"
                  className="text-white border-white hover:bg-white/20"
                >
                  Próximo Jogador
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lista de Eliminados */}
      {eliminated.length > 0 && (
        <div className="absolute bottom-4 left-0 right-0 text-white/60 text-center">
          <p>Eliminados: {eliminated.join(", ")}</p>
        </div>
      )}
    </div>
  );
}