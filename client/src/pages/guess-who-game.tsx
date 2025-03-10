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
  const [showItem, setShowItem] = useState(true);
  const [guess, setGuess] = useState("");
  const [eliminated, setEliminated] = useState<string[]>([]);

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
  }, [setLocation]);

  // Temporizador
  useEffect(() => {
    if (timeLeft > 0 && showItem) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0 && showItem) {
      setShowItem(false);
    }
  }, [timeLeft, showItem]);

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
    setTimeLeft(30);
    setShowItem(true);
    setGuess("");
  }, [currentPlayerIndex, players, eliminated, items, setLocation]);

  const handleGuess = () => {
    if (guess.toLowerCase().trim() === currentItem.toLowerCase().trim()) {
      // Jogador venceu
      alert(`Parabéns ${players[currentPlayerIndex]}! Você acertou!`);
      setLocation("/game-modes");
    } else {
      // Jogador eliminado
      setEliminated([...eliminated, players[currentPlayerIndex]]);
      if (eliminated.length + 1 >= players.length - 1) {
        // Jogo acabou, todos eliminados
        alert("Fim de jogo! Ninguém acertou!");
        setLocation("/game-modes");
      } else {
        handleNextPlayer();
      }
    }
  };

  // Força o modo paisagem e tela cheia
  useEffect(() => {
    const setLandscape = async () => {
      try {
        // Força rotação para paisagem via CSS
        document.documentElement.style.setProperty('--vh', '100vh');

        // Solicita tela cheia
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        }

        // Tenta travar orientação
        if (window.screen.orientation) {
          await window.screen.orientation.lock("landscape");
        }
      } catch (error) {
        console.error("Não foi possível travar a orientação:", error);
      }
    };

    setLandscape();
    return () => {
      // Remove CSS customizado
      document.documentElement.style.removeProperty('--vh');

      // Sai da tela cheia
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }

      // Libera orientação
      if (window.screen.orientation) {
        window.screen.orientation.unlock();
      }
    };
  }, []);

  if (players.length === 0) return null;

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
              {players[currentPlayerIndex]}
            </span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Timer className="w-6 h-6" />
            <span className="text-xl font-medium">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Área Principal */}
      <div className="absolute inset-0 mt-16 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {showItem ? (
              <motion.div
                key="item"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-4xl font-bold text-white text-center"
              >
                {currentItem}
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