import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getItemsByTheme, type ThemeId } from "@/lib/guess-who-data";
import { ChevronLeft, Timer, User2, RotateCcw, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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

interface PlayerItem {
  [playerId: string]: string;
}

export default function GuessWhoGame() {
  const [, setLocation] = useLocation();
  const [players, setPlayers] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [items, setItems] = useState<string[]>([]);
  const [playerItems, setPlayerItems] = useState<PlayerItem>({});
  const [timeLeft, setTimeLeft] = useState(30);
  const [showItem, setShowItem] = useState(false);
  const [guess, setGuess] = useState("");
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [setupTime, setSetupTime] = useState(5);
  const [isSetup, setIsSetup] = useState(true);
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [winner, setWinner] = useState("");

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

    // Inicializa os itens para cada jogador
    const initialPlayerItems: PlayerItem = {};
    playerList.forEach((playerId: string) => {
      const randomItem = themeItems[Math.floor(Math.random() * themeItems.length)].name;
      initialPlayerItems[playerId] = randomItem;
    });
    setPlayerItems(initialPlayerItems);
    setCurrentItem(initialPlayerItems[playerList[0]]);

    setLandscapeMode();

    return () => {
      resetOrientation();
    };
  }, [setLocation]);

  const setLandscapeMode = () => {
    document.documentElement.style.setProperty('transform', 'rotate(-90deg)');
    document.documentElement.style.setProperty('transform-origin', 'left top');
    document.documentElement.style.setProperty('width', '100vh');
    document.documentElement.style.setProperty('height', '100vw');
    document.documentElement.style.setProperty('overflow', 'hidden');
    document.documentElement.style.setProperty('position', 'absolute');
    document.documentElement.style.setProperty('top', '100%');
    document.documentElement.style.setProperty('left', '0');
  };

  const setPortraitMode = () => {
    resetOrientation();
  };

  const resetOrientation = () => {
    document.documentElement.style.removeProperty('transform');
    document.documentElement.style.removeProperty('transform-origin');
    document.documentElement.style.removeProperty('width');
    document.documentElement.style.removeProperty('height');
    document.documentElement.style.removeProperty('overflow');
    document.documentElement.style.removeProperty('position');
    document.documentElement.style.removeProperty('top');
    document.documentElement.style.removeProperty('left');
  };

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
      setPortraitMode();
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
    const nextPlayerId = players[nextIndex];
    setCurrentItem(playerItems[nextPlayerId]);
    setSetupTime(5);
    setIsSetup(true);
    setShowItem(false);
    setGuess("");
    setLandscapeMode();
  }, [currentPlayerIndex, players, eliminated, playerItems, setLocation]);

  const handleGuess = () => {
    const currentPlayerId = players[currentPlayerIndex];
    if (guess.toLowerCase().trim() === playerItems[currentPlayerId].toLowerCase().trim()) {
      // Jogador venceu
      setWinner(currentPlayerId);
      setShowWinScreen(true);
    } else {
      // Jogador eliminado
      setEliminated([...eliminated, currentPlayerId]);
      if (eliminated.length + 1 >= players.length - 1) {
        // Jogo acabou, todos eliminados
        setLocation("/game-modes");
      } else {
        handleNextPlayer();
      }
    }
  };

  if (players.length === 0) return null;

  const currentPlayerId = players[currentPlayerIndex];
  const currentItem = playerItems[currentPlayerId];

  // Buscar os nomes dos jogadores - Assumindo useQuery está configurado corretamente
  const { data: playersData = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const getPlayerName = (playerId: string) => {
    const player = playersData.find((p: any) => p.id === Number(playerId));
    return player ? player.name : playerId;
  };

  const currentPlayerName = getPlayerName(currentPlayerId);
  const winnerName = winner ? getPlayerName(winner) : "";

  if (showWinScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-purple-800 flex items-center justify-center">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold text-white mb-8">
            🎉 Parabéns {winnerName}! 🎉
          </h1>
          <p className="text-2xl text-white/80 mb-12">
            Você acertou!
          </p>
          <div className="space-y-4">
            <Button
              size="lg"
              onClick={handleNextPlayer}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Continuar Jogando
            </Button>
            <Button
              size="lg"
              onClick={() => setLocation("/game-modes")}
              className="w-full bg-white/20 hover:bg-white/30 text-white"
            >
              <Home className="mr-2 h-5 w-5" />
              Voltar ao Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              {currentPlayerName}
            </span>
          </div>
        </div>
      </div>

      {/* Área Principal */}
      <div className="absolute inset-0 mt-16 flex items-center justify-center">
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
                É a vez de {currentPlayerName}
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
              <div className="text-8xl font-bold text-white mb-8">
                {currentItem}
              </div>
              <div className="text-4xl font-bold text-white">
                {timeLeft}s
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
                className="text-lg p-6 w-full max-w-md mb-4"
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
          <p>Eliminados: {eliminated.map(id => getPlayerName(id)).join(", ")}</p>
        </div>
      )}
    </div>
  );
}