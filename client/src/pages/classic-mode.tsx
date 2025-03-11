import { useState, useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { decks } from "@/lib/game-data";
import { useSound } from "@/hooks/use-sound";
import { User, Beer, Target, ArrowRight, Award, Crown, Plus, Minus, Users, ArrowLeft, ChevronLeft } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WinnerScreen } from "@/components/WinnerScreen";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { createElement } from "react";
import { useLocation } from "wouter";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { updateGameStats } from "@/lib/stats";
import { auth, updateRecentGames } from "@/lib/firebase";

function generateChallenge(
  setCurrentChallenge: (challenge: string) => void,
  setCurrentIcon: (icon: any) => void,
  setRoundPoints: (points: number) => void
) {
  const selectedDeckIds = JSON.parse(localStorage.getItem("selectedDecks") || '["classic"]');
  const availableChallenges = decks
    .filter(deck => selectedDeckIds.includes(deck.id))
    .flatMap(deck => deck.challenges);
  const challenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
  const points = Math.floor(Math.random() * 9) + 2;

  setCurrentChallenge(challenge.text);
  setCurrentIcon(challenge.icon);
  setRoundPoints(points);
}

export default function ClassicMode() {
  const [currentChallenge, setCurrentChallenge] = useState("");
  const [currentIcon, setCurrentIcon] = useState<any>();
  const [completedChallenge, setCompletedChallenge] = useState(false);
  const [hasDrunk, setHasDrunk] = useState(false);
  const [roundPoints, setRoundPoints] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => {
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    return !hasSeenTutorial;
  });
  const [hasUpdatedStats, setHasUpdatedStats] = useState(false);
  const [hasStartedGame, setHasStartedGame] = useState(false);
  const [startTime] = useState(() => Date.now());

  const { play } = useSound();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const maxPointsForm = useForm({
    defaultValues: {
      maxPoints: 100,
    },
  });

  const { data: currentPlayer } = useQuery({
    queryKey: ["/api/players/current"],
  });

  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Effect to handle game start statistics
  useEffect(() => {
    const initializeGame = async () => {
      if (!hasStartedGame && auth.currentUser && players.length > 0) {
        try {
          const playerNames = players.map(player => player.name);
          await updateGameStats({
            gameType: "classic",
            playTimeInSeconds: 0,
            playerNames,
            isInitializing: true
          });
          setHasStartedGame(true);
        } catch (error) {
          console.error('Error initializing game stats:', error);
        }
      }
    };

    initializeGame();
  }, [hasStartedGame, players, auth.currentUser]);

  useEffect(() => {
    if (!currentChallenge) {
      generateChallenge(setCurrentChallenge, setCurrentIcon, setRoundPoints);
    }
  }, [currentChallenge]);

  const handlePlayAgain = async () => {
    try {
      await apiRequest("POST", "/api/players/reset", {});
      setCompletedChallenge(false);
      setHasDrunk(false);
      setCurrentChallenge("");
      setCurrentIcon(null);
      setRoundPoints(0);
      setHasUpdatedStats(false);
      setHasStartedGame(false);
      await queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/players/current"] });
      generateChallenge(setCurrentChallenge, setCurrentIcon, setRoundPoints);
    } catch (error) {
      console.error('Erro ao reiniciar o jogo:', error);
    }
  };

  const handleCloseTutorial = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setShowTutorial(false);
  };

  const handleNextPlayer = async () => {
    if (!completedChallenge && !hasDrunk) {
      toast({
        title: "Ação necessária",
        description: "Selecione se o jogador completou o desafio ou bebeu antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentPlayer) {
        if (completedChallenge) {
          await updatePoints.mutate({
            playerId: currentPlayer.id,
            type: "challenge",
            points: roundPoints
          });
        }
        if (hasDrunk) {
          await updatePoints.mutate({
            playerId: currentPlayer.id,
            type: "drink",
            points: roundPoints
          });
        }
      }
      await nextPlayer.mutate();
      await queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/players/current"] });
      setCompletedChallenge(false);
      setHasDrunk(false);
      generateChallenge(setCurrentChallenge, setCurrentIcon, setRoundPoints);
      play("click");
    } catch (error) {
      console.error('Erro ao processar a rodada:', error);
    }
  };

  const maxPoints = settings?.maxPoints || 100;
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
  const winner = sortedPlayers.find(player => player.points >= maxPoints);
  const topDrinker = sortedPlayers[0];

  const updateGameStatistics = async (winner?: string) => {
    if (!auth.currentUser || hasUpdatedStats) return;

    try {
      const playerNames = players.map(player => player.name);
      const playTimeInSeconds = Math.floor((Date.now() - startTime) / 1000);

      await updateGameStats({
        gameType: "classic",
        playTimeInSeconds,
        playerNames
      });

      await updateRecentGames(auth.currentUser.uid, {
        name: "Modo Clássico",
        date: new Date().toISOString(),
        players: players.length,
        winner: winner || "-"
      });

      setHasUpdatedStats(true);
    } catch (error) {
      console.error('Error updating game statistics:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (!hasUpdatedStats) {
        updateGameStatistics();
      }
    };
  }, [hasUpdatedStats]);

  // Show winner screen if game is complete
  if (winner && topDrinker && !hasUpdatedStats) {
    updateGameStatistics(winner.name);
    return (
      <WinnerScreen
        winner={{ name: winner.name, points: winner.points }}
        topDrinker={{ name: topDrinker.name, drinks: topDrinker.drinksCompleted }}
        maxPoints={maxPoints}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  const updatePoints = useMutation({
    mutationFn: async ({ playerId, type, points }: { playerId: string; type: "challenge" | "drink"; points: number }) => {
      await apiRequest("PATCH", `/api/players/${playerId}/points`, { type, points });
    },
  });

  const nextPlayer = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/players/next", {});
    },
  });

  const updateMaxPoints = useMutation({
    mutationFn: async (maxPoints: number) => {
      await apiRequest("PATCH", "/api/settings", { maxPoints });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setDialogOpen(false);
    },
  });

  const handleBackToGame = () => {
    navigate("/manage-players");
  };

  return (
    <>
      <AnimatePresence>
        {showTutorial && (
          <TutorialOverlay onClose={handleCloseTutorial} />
        )}
      </AnimatePresence>
      <GameLayout title="">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/80 rounded-xl p-6 space-y-8">
            <div className="flex items-center gap-4 text-purple-900">
              <User className="h-6 w-6" />
              <span className="text-xl">
                {currentPlayer ? (
                  <>
                    Vez de <span className="font-bold">{currentPlayer.name}</span>
                  </>
                ) : "Selecione os jogadores"}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {currentChallenge && (
                <motion.div
                  key={currentChallenge}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-3xl font-bold text-center text-purple-900"
                >
                  {currentIcon && (
                    <div className="mb-4">
                      {createElement(currentIcon, {
                        className: "h-12 w-12 mx-auto text-purple-700"
                      })}
                    </div>
                  )}
                  {currentChallenge}
                  <div className="mt-4 text-lg font-normal text-purple-700">
                    Ou beba {roundPoints} goles
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <button
                onClick={() => setCompletedChallenge(!completedChallenge)}
                className={`w-full flex items-center gap-3 p-4 rounded-lg cursor-pointer select-none text-left transition-colors
                ${completedChallenge
                  ? 'bg-purple-50 border-2 border-purple-700'
                  : 'bg-purple-50 border-2 border-transparent hover:border-purple-200'}`}
              >
                <Target className="h-5 w-5 text-purple-900" />
                <span className="flex-1 text-purple-900">Completou o desafio</span>
                <span className="text-sm text-purple-700">+{roundPoints}pts</span>
              </button>

              <button
                onClick={() => setHasDrunk(!hasDrunk)}
                className={`w-full flex items-center gap-3 p-4 rounded-lg cursor-pointer select-none text-left transition-colors
                ${hasDrunk
                  ? 'bg-purple-50 border-2 border-purple-700'
                  : 'bg-purple-50 border-2 border-transparent hover:border-purple-200'}`}
              >
                <Beer className="h-5 w-5 text-purple-900" />
                <span className="flex-1 text-purple-900">Bebeu {roundPoints} goles</span>
                <span className="text-sm text-purple-700">+{roundPoints}pts</span>
              </button>
            </div>

            <div className="space-y-4">
              <Button
                size="lg"
                onClick={handleNextPlayer}
                className="bg-purple-700 hover:bg-purple-800 text-white text-xl w-full"
                disabled={nextPlayer.isPending || updatePoints.isPending || (!completedChallenge && !hasDrunk)}
              >
                <ArrowRight className="mr-2 h-6 w-6" />
                Próxima rodada
              </Button>

              <div className="text-sm text-purple-900 text-center">
                Objetivo: {maxPoints} pontos{" "}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger className="text-purple-700 underline hover:text-purple-800 ml-1">
                    alterar &gt;
                  </DialogTrigger>
                  <DialogContent className="bg-white rounded-xl">
                    <DialogHeader>
                      <DialogTitle>Alterar Pontuação Máxima</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="rounded-full w-8 h-8 flex items-center justify-center"
                        onClick={() => {
                          const current = maxPointsForm.getValues("maxPoints");
                          maxPointsForm.setValue("maxPoints", Math.max(10, Number(current) - 10));
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="10"
                        max="1000"
                        className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        {...maxPointsForm.register("maxPoints")}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="rounded-full w-8 h-8 flex items-center justify-center"
                        onClick={() => {
                          const current = maxPointsForm.getValues("maxPoints");
                          maxPointsForm.setValue("maxPoints", Math.min(1000, Number(current) + 10));
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      className="w-full mt-4 bg-purple-700 hover:bg-purple-800 text-white"
                      onClick={() => {
                        const newMaxPoints = maxPointsForm.getValues("maxPoints");
                        updateMaxPoints.mutate(Number(newMaxPoints));
                      }}
                    >
                      Salvar
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-white" />
                <h3 className="text-xl font-bold text-white">Ranking</h3>
              </div>
              <Button
                variant="ghost"
                onClick={handleBackToGame}
                className="text-white hover:text-white/80"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-3">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className="bg-white/10 p-3 rounded-lg flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Crown className="h-4 w-4 text-yellow-400" />}
                      <span className="text-white">{player.name}</span>
                    </div>
                    <span className="text-white font-bold">{player.points} pts</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/80">
                    <div className="flex items-center gap-1">
                      <Beer className="h-4 w-4" />
                      <span>{player.drinksCompleted}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{player.challengesCompleted}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GameLayout>
    </>
  );
}