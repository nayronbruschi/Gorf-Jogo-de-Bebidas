import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Beer, X, Award, Users, Home } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouletteGame } from "@/hooks/use-roulette-game";
import { PlayerList } from "@/components/PlayerList";
import { PunishmentDialog } from "@/components/PunishmentDialog";
import { WinnerScreen } from "@/components/WinnerScreen";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Desafios de punição para quem se recusa a beber
export const punishmentChallenges = [
  { text: "Dançar 'I'm a Little Teapot' com gestos", icon: Beer },
  { text: "Imitar um animal por 30 segundos", icon: Beer },
  { text: "Cantar 'Parabéns pra Você' em ópera", icon: Beer },
  { text: "Fazer 10 polichinelos contando em alemão", icon: Beer },
  { text: "Declarar seu amor para uma planta", icon: Beer },
  // ... outros desafios ...
];

export default function RouletteMode() {
  const {
    gameState: {
      selectedPlayer,
      isSelecting,
      numDrinks,
      showPunishment,
      currentPunishment,
      action,
      punishmentDrinks,
      gameMode,
      players,
      showWinner
    },
    actions: {
      setShowPunishment,
      setCurrentPunishment,
      setAction,
      setPunishmentDrinks,
      selectRandomPlayer,
      updatePoints,
      resetGame
    }
  } = useRouletteGame();

  const [showPlayerList, setShowPlayerList] = useState(false);
  const drinkText = gameMode === "shots" ? "shot" : "Gole";
  const drinkTextPlural = gameMode === "shots" ? "shots" : "Goles";
  const [, navigate] = useLocation();

  const handleDrink = () => {
    if (!selectedPlayer) return;
    setAction("drink");
  };

  const handleHome = async () => {
    try {
      await apiRequest("DELETE", "/api/players/all", {});
      navigate("/game-modes");
    } catch (error) {
      console.error('Erro ao limpar jogadores:', error);
      navigate("/game-modes");
    }
  };

  const handleRefusal = () => {
    setAction("refuse");
    const randomPunishment = punishmentChallenges[Math.floor(Math.random() * punishmentChallenges.length)];
    setCurrentPunishment(randomPunishment);
    setPunishmentDrinks(1);
    setShowPunishment(true);
  };

  const handleNextPlayer = async () => {
    if (!selectedPlayer || !action) return;

    try {
      const pointsToAdd = action === "drink" ? numDrinks : punishmentDrinks;
      await updatePoints.mutateAsync({
        playerId: selectedPlayer.id,
        points: pointsToAdd
      });

      setShowPunishment(false);
      setAction(null);
      selectRandomPlayer();
    } catch (error) {
      console.error('Erro ao processar a rodada:', error);
    }
  };

  const generateNewPunishment = () => {
    setPunishmentDrinks(prev => prev + 1);
    const randomPunishment = punishmentChallenges[Math.floor(Math.random() * punishmentChallenges.length)];
    setCurrentPunishment(randomPunishment);
  };

  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <GameLayout title="">
      {/* Header só com botão home */}
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
      <div className="pt-16 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Área principal de jogo (3/5 da largura) */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
                {!selectedPlayer && !isSelecting && (
                  <div className="flex flex-col items-center justify-center h-full p-10 text-center space-y-6">
                    <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-purple-900 mb-2">Iniciar Jogo</h2>
                      <p className="text-gray-500 mb-6">Sorteie o primeiro jogador para começar</p>
                    </div>
                    <Button
                      size="lg"
                      onClick={selectRandomPlayer}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-10 py-6 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      Sortear Jogador
                    </Button>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {isSelecting && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex flex-col items-center justify-center h-64 p-6"
                    >
                      <div className="w-16 h-16 relative mb-6">
                        <div className="absolute top-0 left-0 right-0 bottom-0 animate-spin">
                          <div className="h-16 w-16 rounded-full border-4 border-t-purple-600 border-r-purple-200 border-b-purple-200 border-l-purple-200"></div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-600">
                          <Beer className="h-6 w-6" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-purple-900 mb-2">Sorteando jogador</h3>
                      <p className="text-gray-500">Quem será o próximo?</p>
                    </motion.div>
                  )}

                  {selectedPlayer && !isSelecting && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="p-8"
                    >
                      {/* Nome do jogador em destaque */}
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Jogador da vez
                        </div>
                        <h2 className="text-3xl font-bold text-purple-900">
                          {selectedPlayer.name}
                        </h2>
                      </div>

                      {/* Quantidade a beber em destaque */}
                      <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border border-purple-100 shadow-sm mb-8">
                        <div className="flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-gray-500 mb-2">Quantidade</div>
                            <div className="text-5xl font-bold text-purple-800 mb-2">{numDrinks}</div>
                            <div className="text-purple-600 font-medium">
                              {numDrinks === 1 ? drinkText : drinkTextPlural}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Botões de ação */}
                      {!action ? (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Button
                            size="lg" 
                            onClick={handleDrink}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 text-lg rounded-full shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
                          >
                            <Beer className="mr-2 h-5 w-5" />
                            Bebeu
                          </Button>
                          <Button
                            size="lg"
                            onClick={handleRefusal}
                            className="bg-white border border-gray-200 text-purple-900 hover:bg-gray-50 px-8 py-4 text-lg rounded-full shadow-sm hover:shadow-md transition-all w-full sm:w-auto"
                          >
                            <X className="mr-2 h-5 w-5" />
                            Recusou
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-8 text-center">
                          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                            action === "drink" ? 
                              "bg-green-100 text-green-800" : 
                              "bg-red-100 text-red-800"
                          } mb-6`}>
                            {action === "drink"
                              ? `Bebeu ${numDrinks} ${numDrinks === 1 ? drinkText : drinkTextPlural}`
                              : "Se recusou a beber"}
                          </div>
                          
                          <Button
                            size="lg"
                            onClick={handleNextPlayer}
                            disabled={updatePoints.isPending}
                            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                          >
                            {updatePoints.isPending ? (
                              <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processando...
                              </div>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Próximo Jogador
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
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
                    <Users className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="p-5">
                  {sortedPlayers.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {sortedPlayers.map((player, index) => (
                        <div
                          key={player.id}
                          className="py-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              index === 0 
                                ? "bg-yellow-100 text-yellow-800" 
                                : index === 1 
                                  ? "bg-gray-100 text-gray-800"
                                  : index === 2 
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-purple-100 text-purple-900"
                            }`}>
                              {index + 1}
                            </div>
                            <span className="text-purple-900 font-medium">{player.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-700 bg-gray-50 px-3 py-1 rounded-full text-sm">
                            <Beer className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">{player.points}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-gray-700 font-medium mb-1">Ranking vazio</h3>
                      <p className="text-gray-500 text-sm">
                        Nenhum jogador bebeu ainda
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <PunishmentDialog
        open={showPunishment}
        onOpenChange={setShowPunishment}
        playerName={selectedPlayer?.name || ""}
        punishment={currentPunishment}
        punishmentDrinks={punishmentDrinks}
        drinkText={drinkText}
        drinkTextPlural={drinkTextPlural}
        onAcceptPunishment={handleNextPlayer}
        onGenerateNewPunishment={generateNewPunishment}
      />

      <Dialog open={showPlayerList} onOpenChange={setShowPlayerList}>
        <DialogContent className="bg-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-purple-900">Gerenciar Jogadores</DialogTitle>
          </DialogHeader>
          <PlayerList />
        </DialogContent>
      </Dialog>

      {showWinner && (
        <WinnerScreen
          onPlayAgain={resetGame}
        />
      )}
    </GameLayout>
  );
}