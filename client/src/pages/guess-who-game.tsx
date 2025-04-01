import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getItemsByTheme, type ThemeId } from "@/lib/guess-who-data";
import { Home, RotateCcw, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Player {
  id: number;
  name: string;
}

export default function GuessWhoGame() {
  const [, setLocation] = useLocation();
  const { data: playersData = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const { data: currentPlayer } = useQuery({
    queryKey: ["/api/players/current"],
  });

  const [players, setPlayers] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [items, setItems] = useState<string[]>([]);
  const [playerItems, setPlayerItems] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(30);
  const [showItem, setShowItem] = useState(false);
  const [guess, setGuess] = useState("");
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [setupTime, setSetupTime] = useState(5);
  const [isSetup, setIsSetup] = useState(true);
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [showLoseScreen, setShowLoseScreen] = useState(false);
  const [winner, setWinner] = useState("");
  const [readyToStart, setReadyToStart] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const lockScreenOrientation = async () => {
      try {
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock("landscape");
        }
      } catch (error) {
        console.error("[GuessWhoGame] Error locking screen orientation:", error);
      }
    };

    const unlockScreenOrientation = () => {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    };

    const storedPlayers = localStorage.getItem("guessWhoPlayers");
    const theme = localStorage.getItem("guessWhoTheme") as ThemeId;

    if (!storedPlayers || !theme) {
      setLocation("/guess-who/players");
      return () => unlockScreenOrientation();
    }

    try {
      const playerIds = JSON.parse(storedPlayers);
      if (!Array.isArray(playerIds) || playerIds.length < 2) {
        setLocation("/guess-who/players");
        return () => unlockScreenOrientation();
      }
      setPlayers(playerIds);

      const themeItems = getItemsByTheme(theme);
      setItems(themeItems.map(item => item.name));

      const initialPlayerItems: { [key: string]: string } = {};
      playerIds.forEach((playerId: string) => {
        const randomItem = themeItems[Math.floor(Math.random() * themeItems.length)].name;
        initialPlayerItems[playerId] = randomItem;
      });
      setPlayerItems(initialPlayerItems);

      setLandscapeMode();
      lockScreenOrientation();
    } catch (error) {
      console.error('Erro ao inicializar o jogo:', error);
      setLocation("/guess-who/players");
      return () => unlockScreenOrientation();
    }
  }, [setLocation]);

  const handleBack = () => {
    if (timer) clearInterval(timer);
    setPortraitMode();
    setLocation("/game-modes");
  };

  // Lógica para obter o nome do jogador atual
  const getCurrentPlayerName = () => {
    if (!currentPlayer) return "";
    return currentPlayer.name;
  };

  const currentPlayerName = getCurrentPlayerName();

  const checkForWinner = useCallback((remainingPlayers: string[]) => {
    if (remainingPlayers.length === 1) {
      setWinner(remainingPlayers[0]);
      setShowWinScreen(true);
      setPortraitMode();
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (!isSetup || !readyToStart || setupTime <= 0) return;

    const timer = setInterval(() => {
      setSetupTime(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          setIsSetup(false);
          setShowItem(true);
          setTimeLeft(30);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    setTimer(timer);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSetup, readyToStart]);

  useEffect(() => {
    if (!showItem || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          setShowItem(false);
          setPortraitMode();
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);

    setTimer(timer);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showItem]);

  const handleNextPlayer = useCallback(() => {
    const remainingPlayers = winner
      ? players.filter(id => id !== winner)
      : players;

    let nextIndex = currentPlayerIndex;
    do {
      nextIndex = (nextIndex + 1) % remainingPlayers.length;
    } while (eliminated.includes(remainingPlayers[nextIndex]));

    if (nextIndex === currentPlayerIndex) {
      setLocation("/game-modes");
      return;
    }

    if (winner) {
      setPlayers(remainingPlayers);
    }

    setCurrentPlayerIndex(nextIndex);
    setSetupTime(5);
    setIsSetup(true);
    setShowItem(false);
    setGuess("");
    setLandscapeMode();
    setWinner("");
    setShowWinScreen(false);
    setReadyToStart(false);
  }, [currentPlayerIndex, players, eliminated, setLocation, winner]);

  const handleEliminatePlayer = () => {
    const newEliminated = [...eliminated, players[currentPlayerIndex]];
    setEliminated(newEliminated);

    const remainingPlayers = players.filter(id => !newEliminated.includes(id));

    if (remainingPlayers.length === 1) {
      setWinner(remainingPlayers[0]);
      setShowWinScreen(true);
      setPortraitMode();
      return;
    }

    setShowLoseScreen(false);
    let nextIndex = currentPlayerIndex;
    do {
      nextIndex = (nextIndex + 1) % players.length;
    } while (newEliminated.includes(players[nextIndex]));

    setCurrentPlayerIndex(nextIndex);
    setSetupTime(5);
    setIsSetup(true);
    setShowItem(false);
    setGuess("");
    setLandscapeMode();
    setReadyToStart(false);
  };

  const handleGuess = () => {
    const currentPlayerId = players[currentPlayerIndex];
    const currentItem = playerItems[currentPlayerId];

    // Normaliza as strings removendo hífens e espaços extras
    const normalizedGuess = guess.toLowerCase().trim().replace(/-/g, '');
    const normalizedItem = currentItem?.toLowerCase().trim().replace(/-/g, '');

    if (normalizedGuess === normalizedItem) {
      setWinner(currentPlayerId);
      setShowWinScreen(true);
      setPortraitMode();
    } else {
      setShowLoseScreen(true);
      setPortraitMode();
    }
  };

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const setLandscapeMode = () => {
    if (isMobileDevice()) {
      document.documentElement.style.setProperty('transform', 'rotate(-90deg)');
      document.documentElement.style.setProperty('transform-origin', 'left top');
      document.documentElement.style.setProperty('width', '100vh');
      document.documentElement.style.setProperty('height', '100vw');
      document.documentElement.style.setProperty('overflow', 'hidden');
      document.documentElement.style.setProperty('position', 'absolute');
      document.documentElement.style.setProperty('top', '100%');
      document.documentElement.style.setProperty('left', '0');
      // Adicionar bloqueio de orientação via CSS
      document.body.style.setProperty('overflow', 'hidden');
      document.body.style.setProperty('position', 'fixed');
      document.body.style.setProperty('width', '100%');
      document.body.style.setProperty('height', '100%');
    }
  };

  const setPortraitMode = () => {
    resetOrientation();
  };

  const resetOrientation = () => {
    if (isMobileDevice()) {
      document.documentElement.style.removeProperty('transform');
      document.documentElement.style.removeProperty('transform-origin');
      document.documentElement.style.removeProperty('width');
      document.documentElement.style.removeProperty('height');
      document.documentElement.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('position');
      document.documentElement.style.removeProperty('top');
      document.documentElement.style.removeProperty('left');
      // Remover bloqueio de orientação
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('position');
      document.body.style.removeProperty('width');
      document.body.style.removeProperty('height');
    }
  };


  // Função auxiliar para obter nomes de jogadores (usado em outras partes do componente)
  const getPlayerName = (playerId: string) => {
    if (!playersData) return "";
    const player = playersData.find(p => p.id === Number(playerId));
    return player ? player.name : "";
  };

  if (players.length === 0) return null;

  const currentItem = playerItems[players[currentPlayerIndex]];
  const winnerName = winner ? getPlayerName(winner) : "";

  const canContinueGame = players.length > 2;

  if (showLoseScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-purple-800 flex items-center justify-center">
        <div className="text-center space-y-8 p-4">
          <h1 className="text-4xl font-bold text-white mb-8">
            Você errou!
          </h1>
          <p className="text-2xl text-white/80 mb-12">
            Você pode tomar 5 goles e continuar jogando ou sair do jogo
          </p>
          <div className="flex flex-col gap-4 max-w-xs mx-auto">
            <Button
              size="lg"
              onClick={() => {
                setShowLoseScreen(false);
                handleNextPlayer();
              }}
              className="bg-gorf-green hover:bg-green-700 text-white" // Changed button color
            >
              Tomar 5 goles e continuar
            </Button>
            <Button
              size="lg"
              onClick={handleEliminatePlayer}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              Sair do Jogo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showWinScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-purple-800 flex items-center justify-center">
        <div className="text-center space-y-8 p-4">
          <h1 className="text-3xl font-bold text-white mb-8">
            🎉 Parabéns {winnerName}! 🎉
          </h1>
          <p className="text-2xl text-white/80 mb-12">
            Você acertou!
          </p>
          <div className="flex flex-col gap-4 max-w-xs mx-auto">
            {canContinueGame && (
              <Button
                size="lg"
                onClick={handleNextPlayer}
                className="bg-gorf-green hover:bg-green-700 text-white" // Changed button color
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Continuar Jogando
              </Button>
            )}
            <Button
              size="lg"
              onClick={() => setLocation("/guess-who/theme")}
              className="bg-gorf-green hover:bg-green-700 text-white" // Changed button color
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Escolher Outra Categoria
            </Button>
            <Button
              size="lg"
              onClick={() => setLocation("/game-modes")}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              <Home className="mr-2 h-5 w-5" />
              Escolher Outro Jogo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-purple-800 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-50">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleBack}
        >
          <Home className="h-6 w-6" />
        </Button>

        <div className="flex items-center gap-4">
          <span className="text-xl font-medium text-white">
            {currentPlayerName}
          </span>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
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
                É a vez de:
              </h2>
              <p className="text-3xl text-white mb-8">
                {currentPlayerName}
              </p>
              <p className="text-xl text-white/80">
                Coloque o celular de lado na testa
              </p>
              {!readyToStart ? (
                <Button
                  size="lg"
                  onClick={() => setReadyToStart(true)}
                  className="bg-purple-900 hover:bg-purple-950 text-white px-8 py-6"
                >
                  <Play className="mr-2 h-6 w-6" />
                  Estou Pronto!
                </Button>
              ) : (
                <div className="text-8xl font-bold text-white">
                  {setupTime}
                </div>
              )}
            </motion.div>
          ) : showItem ? (
            <motion.div
              key="item"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              <div className="text-6xl font-bold text-white text-center mb-12">
                {playerItems[players[currentPlayerIndex]]}
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
              className="flex flex-col items-center gap-4 p-4"
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                Quem você acha que é?
              </h3>
              <Input
                type="text"
                placeholder="Escreva aqui seu chute"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                className="text-lg p-6 w-full max-w-md mb-4"
              />
              <div className="flex gap-4">
                <Button
                  onClick={handleGuess}
                  className="bg-gorf-green hover:bg-green-700 text-white px-8"
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
                  Não sei
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showWinScreen && (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-purple-800 flex items-center justify-center">
          <div className="text-center space-y-8 p-4">
            <h1 className="text-3xl font-bold text-white mb-8">
              🎉 Parabéns {winnerName}! 🎉
            </h1>
            <p className="text-2xl text-white/80 mb-12">
              Você acertou!
            </p>
            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              {canContinueGame && (
                <Button
                  size="lg"
                  onClick={handleNextPlayer}
                  className="bg-gorf-green hover:bg-green-700 text-white"
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Continuar Jogando
                </Button>
              )}
              <Button
                size="lg"
                onClick={() => setLocation("/guess-who/theme")}
                className="bg-gorf-green hover:bg-green-700 text-white" // Changed button color
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Escolher Outra Categoria
              </Button>
              <Button
                size="lg"
                onClick={() => setLocation("/game-modes")}
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                <Home className="mr-2 h-5 w-5" />
                Escolher Outro Jogo
              </Button>
            </div>
          </div>
        </div>
      )}

      {showLoseScreen && (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-purple-800 flex items-center justify-center">
          <div className="text-center space-y-8 p-4">
            <h1 className="text-4xl font-bold text-white mb-8">
              Você errou!
            </h1>
            <p className="text-2xl text-white/80 mb-12">
              Você pode tomar 5 goles e continuar jogando ou sair do jogo
            </p>
            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <Button
                size="lg"
                onClick={() => {
                  setShowLoseScreen(false);
                  handleNextPlayer();
                }}
                className="bg-gorf-green hover:bg-green-700 text-white" // Changed button color
              >
                Tomar 5 goles e continuar
              </Button>
              <Button
                size="lg"
                onClick={handleEliminatePlayer}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                Sair do Jogo
              </Button>
            </div>
          </div>
        </div>
      )}

      {eliminated.length > 0 && (
        <div className="absolute bottom-4 left-0 right-0 text-white/60 text-center">
          <p>Eliminados: {eliminated.map(id => getPlayerName(id)).join(", ")}</p>
        </div>
      )}
    </div>
  );
}