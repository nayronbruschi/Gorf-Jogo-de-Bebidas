import { useState, useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { decks } from "@/lib/game-data";
import { useSound } from "@/hooks/use-sound";
import { User, Beer, Target, ArrowRight, Award, Crown, Plus, Minus, Home, Settings } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WinnerScreen } from "@/components/WinnerScreen";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlayerManagementDialog } from "@/components/PlayerManagementDialog";
import { useForm } from "react-hook-form";
import { createElement } from "react";
import { useLocation } from "wouter";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { useGameTimer } from "@/lib/stats";
import { auth } from "@/lib/firebase";

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
  const [showPlayerList, setShowPlayerList] = useState(false);
  const { play } = useSound();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const maxPointsForm = useForm({
    defaultValues: { maxPoints: 100 },
  });

  const { data: currentPlayer } = useQuery({
    queryKey: ["/api/players/current"],
  });

  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"]
  });

  const updatePoints = useMutation({
    mutationFn: async ({ playerId, type, points }: { playerId: number; type: "challenge" | "drink"; points: number }) => {
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

  const generateChallenge = () => {
    const selectedDeckIds = JSON.parse(localStorage.getItem("selectedDecks") || '["classic"]');
    const availableChallenges = decks
      .filter(deck => selectedDeckIds.includes(deck.id))
      .flatMap(deck => deck.challenges);
    const challenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
    const points = Math.floor(Math.random() * 9) + 2;

    setCurrentChallenge(challenge.text);
    setCurrentIcon(challenge.icon);
    setRoundPoints(points);
  };

  const handlePlayAgain = async () => {
    try {
      await apiRequest("POST", "/api/players/reset", {});
      setCompletedChallenge(false);
      setHasDrunk(false);
      setCurrentChallenge("");
      setCurrentIcon(null);
      setRoundPoints(0);
      await queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/players/current"] });
      generateChallenge();
    } catch (error) {
      console.error('Erro ao reiniciar o jogo:', error);
    }
  };

  const handleCloseTutorial = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setShowTutorial(false);
  };

  if (!currentChallenge) {
    generateChallenge();
  }

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
          await updatePoints.mutateAsync({
            playerId: currentPlayer.id,
            type: "challenge",
            points: roundPoints
          });
        }
        if (hasDrunk) {
          await updatePoints.mutateAsync({
            playerId: currentPlayer.id,
            type: "drink",
            points: roundPoints
          });
        }
      }
      await nextPlayer.mutateAsync();
      await queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/players/current"] });
      setCompletedChallenge(false);
      setHasDrunk(false);
      generateChallenge();
      play("click");
    } catch (error) {
      console.error('Erro ao processar a rodada:', error);
    }
  };

  const winner = players.find(player => player.points >= (settings?.maxPoints || 100));
  const topDrinker = [...players].sort((a, b) => b.drinksCompleted - a.drinksCompleted)[0];

  const gameStartTime2 = Date.now();

  if (winner && topDrinker) {
    return (
      <WinnerScreen
        winner={{ name: winner.name, points: winner.points }}
        topDrinker={{ name: topDrinker.name, drinks: topDrinker.drinksCompleted }}
        maxPoints={settings?.maxPoints || 100}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  const handleBackToGame = () => {
    navigate("/manage-players");
  };

  const handleHome = async () => {
    try {
      await apiRequest("DELETE", "/api/players/all", {});
      await queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/players/current"] });
      navigate("/game-modes");
    } catch (error) {
      console.error('Erro ao limpar jogadores:', error);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showTutorial && (
          <TutorialOverlay onClose={handleCloseTutorial} />
        )}
      </AnimatePresence>

      <PlayerManagementDialog
        open={showPlayerList}
        onOpenChange={setShowPlayerList}
      />

      <GameLayout title="">
        {/* Header com título e botão home */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-50">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all shadow-sm"
            onClick={handleHome}
          >
            <Home className="h-5 w-5" />
          </Button>

        </div>

        {/* Container principal com design moderno */}
        <div className="pt-12 pb-8 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Área principal de jogo (3/5 da largura) */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
                  {/* Cabeçalho com jogador atual */}
                  <div className="bg-gradient-to-r from-purple-800 to-purple-700 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-600 bg-opacity-50 rounded-full p-2">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        {currentPlayer ? (
                          <>
                            Vez de <span className="font-bold">{currentPlayer.name}</span>
                          </>
                        ) : "Selecione os jogadores"}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Conteúdo principal */}
                  <div className="p-6 space-y-6">
                    {/* Desafio atual com animação */}
                    <AnimatePresence mode="wait">
                      {currentChallenge && (
                        <motion.div
                          key={currentChallenge}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ type: "spring", stiffness: 100, damping: 15 }}
                          className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-100 shadow-sm"
                        >
                          {currentIcon && (
                            <div className="mb-4">
                              <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                                {createElement(currentIcon, {
                                  className: "h-10 w-10 text-purple-700"
                                })}
                              </div>
                            </div>
                          )}
                          <h4 className="text-2xl font-bold text-center text-purple-900 mb-4">
                            {currentChallenge}
                          </h4>
                          <div className="text-center text-md font-medium text-purple-700 bg-purple-50 rounded-full py-2 px-4 inline-block mx-auto">
                            Ou beba {roundPoints} goles
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Opções de escolha */}
                    <div className="space-y-4 mt-6">
                      <button
                        onClick={() => setCompletedChallenge(!completedChallenge)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer select-none text-left transition-all duration-200 ${
                          completedChallenge
                            ? 'bg-[#326800] text-white shadow-md'
                            : 'bg-white hover:bg-gray-50 hover:shadow-sm border border-gray-200'
                        }`}
                      >
                        <div className={`rounded-full p-2 ${
                          completedChallenge ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Target className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <span className={`font-medium ${
                            completedChallenge ? 'text-white' : 'text-gray-800'
                          }`}>
                            Completou o desafio
                          </span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          completedChallenge ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          +{roundPoints}pts
                        </div>
                      </button>

                      <button
                        onClick={() => setHasDrunk(!hasDrunk)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer select-none text-left transition-all duration-200 ${
                          hasDrunk
                            ? 'bg-purple-700 text-white shadow-md'
                            : 'bg-white hover:bg-gray-50 hover:shadow-sm border border-gray-200'
                        }`}
                      >
                        <div className={`rounded-full p-2 ${
                          hasDrunk ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Beer className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <span className={`font-medium ${
                            hasDrunk ? 'text-white' : 'text-gray-800'
                          }`}>
                            Bebeu {roundPoints} goles
                          </span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          hasDrunk ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          +{roundPoints}pts
                        </div>
                      </button>
                    </div>

                    {/* Dica e botão de próxima rodada */}
                    <div className="pt-4">
                      <p className="text-sm text-gray-500 text-center mb-4">
                        Você pode fazer o desafio e beber para ganhar o dobro de pontos
                      </p>
                      
                      <Button
                        size="lg"
                        onClick={handleNextPlayer}
                        disabled={nextPlayer.isPending || updatePoints.isPending || (!completedChallenge && !hasDrunk)}
                        className={`bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 rounded-full shadow-lg hover:shadow-xl transition-all w-full ${
                          (!completedChallenge && !hasDrunk) ? 'opacity-50' : 'hover:scale-[1.02]'
                        }`}
                      >
                        {nextPlayer.isPending || updatePoints.isPending ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processando...
                          </div>
                        ) : (
                          <>
                            <ArrowRight className="mr-2 h-5 w-5" />
                            Próxima Rodada
                          </>
                        )}
                      </Button>

                      {/* Objetivo do jogo */}
                      <div className="mt-4 flex items-center justify-center gap-1 text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Objetivo: {settings?.maxPoints || 100} pontos{" "}
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                          <DialogTrigger className="text-purple-600 font-medium hover:text-purple-800 ml-1 underline">
                            alterar
                          </DialogTrigger>
                          <DialogContent className="bg-white rounded-xl">
                            <DialogHeader>
                              <DialogTitle className="text-purple-900">Alterar Pontuação Máxima</DialogTitle>
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
                              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
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
                </div>
              </div>

              {/* Sidebar com ranking (2/5 da largura) */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
                  <div className="bg-gradient-to-r from-purple-800 to-purple-700 px-6 py-5 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Ranking
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPlayerList(true)}
                      className="text-white hover:bg-white/10 rounded-full w-8 h-8 p-0"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="p-5">
                    {sortedPlayers.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {sortedPlayers.map((player, index) => (
                          <div
                            key={player.id}
                            className="py-3 flex flex-col"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                  index === 0 
                                    ? "bg-yellow-100 text-yellow-800" 
                                    : index === 1 
                                      ? "bg-gray-100 text-gray-800"
                                      : index === 2 
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-purple-100 text-purple-800"
                                }`}>
                                  {index + 1}
                                </div>
                                <div className="flex items-center gap-2">
                                  {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                                  <span className="text-purple-900 font-medium">{player.name}</span>
                                </div>
                              </div>
                              <div className="text-purple-900 font-bold bg-purple-50 px-3 py-1 rounded-full">
                                {player.points} pts
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 ml-11 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Beer className="h-4 w-4 text-purple-500" />
                                <span>{player.drinksCompleted} bebidas</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4 text-green-500" />
                                <span>{player.challengesCompleted} desafios</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 px-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-gray-700 font-medium mb-1">Nenhum jogador</h3>
                        <p className="text-gray-500 text-sm">
                          Adicione jogadores para começar
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GameLayout>
    </>
  );
}