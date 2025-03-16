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
const punishmentChallenges = [
  { text: "Dançar 'I'm a Little Teapot' com gestos", icon: Beer },
  { text: "Imitar um animal por 30 segundos", icon: Beer },
  { text: "Cantar 'Parabéns pra Você' em ópera", icon: Beer },
  { text: "Fazer 10 polichinelos contando em alemão", icon: Beer },
  { text: "Declarar seu amor para uma planta", icon: Beer },
  { text: "Fazer uma dança do TikTok escolhida pelo grupo", icon: Beer },
  { text: "Imitar um personagem de desenho animado", icon: Beer },
  { text: "Fazer uma pose de yoga por 30 segundos", icon: Beer },
  { text: "Contar uma história engraçada em outro idioma", icon: Beer },
  { text: "Fazer uma mímica de um filme famoso", icon: Beer },
  { text: "Cantar o hino nacional fazendo careta", icon: Beer },
  { text: "Dançar balé improvisado", icon: Beer },
  { text: "Imitar um locutor de futebol narrando o jogo", icon: Beer },
  { text: "Fazer uma propaganda de venda do objeto mais próximo", icon: Beer },
  { text: "Criar um rap sobre o jogador à sua direita", icon: Beer },
  { text: "Imitar um político famoso", icon: Beer },
  { text: "Dançar como se estivesse em uma balada dos anos 80", icon: Beer },
  { text: "Fazer uma declaração dramática para o teto", icon: Beer },
  { text: "Criar um jingle para o grupo", icon: Beer },
  { text: "Imitar um bebê fazendo birra", icon: Beer },
  { text: "Fazer uma pose de super-herói por 30 segundos", icon: Beer },
  { text: "Cantar uma música infantil com voz de heavy metal", icon: Beer },
  { text: "Imitar um youtuber fazendo unboxing", icon: Beer },
  { text: "Fazer uma dança do robô por 30 segundos", icon: Beer },
  { text: "Contar uma história de terror com voz de criança", icon: Beer },
  { text: "Imitar uma celebridade dando entrevista", icon: Beer },
  { text: "Fazer uma propaganda de pasta de dente", icon: Beer },
  { text: "Dançar valsa sozinho", icon: Beer },
  { text: "Imitar um vendedor de feira", icon: Beer },
  { text: "Cantar uma música romântica para um objeto", icon: Beer },
  { text: "Fazer uma pose de estátua por 1 minuto", icon: Beer },
  { text: "Imitar um animal em câmera lenta", icon: Beer },
  { text: "Dançar como se estivesse em uma batalha de break", icon: Beer },
  { text: "Fazer uma declaração de amor para si mesmo no espelho", icon: Beer },
  { text: "Imitar um professor bravo", icon: Beer },
  { text: "Cantar ópera com letra improvisada", icon: Beer },
  { text: "Fazer uma propaganda de shampoo dramática", icon: Beer },
  { text: "Imitar um repórter do tempo", icon: Beer },
  { text: "Dançar funk com cara de sério", icon: Beer },
  { text: "Fazer uma pose de modelo de revista", icon: Beer }
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
    if (!selectedPlayer) return;
    setPunishmentDrinks(prev => prev + 1);
    const randomPunishment = punishmentChallenges[Math.floor(Math.random() * punishmentChallenges.length)];
    setCurrentPunishment(randomPunishment);
  };

  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <GameLayout title="">
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4 text-white hover:bg-white/20"
          onClick={handleHome}
        >
          <Home className="h-6 w-6" />
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-16 pb-24">
          <div className="bg-white rounded-xl p-6 space-y-8">
            {!selectedPlayer && !isSelecting && (
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={selectRandomPlayer}
                  className="bg-purple-900 hover:bg-purple-950 text-white px-8 py-6 text-xl"
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
                  className="text-center text-purple-900 text-2xl font-bold"
                >
                  Sorteando...
                </motion.div>
              )}

              {selectedPlayer && !isSelecting && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <p className="text-purple-900 text-xl mb-2">
                    É a vez de
                  </p>
                  <h3 className="text-2xl font-bold text-purple-900 mb-6">
                    {selectedPlayer.name}
                  </h3>
                  <div className="bg-purple-50 rounded-lg p-6 mb-6">
                    <p className="text-purple-700 text-4xl font-bold">
                      {gameMode === "shots" ? (
                        <>Tome {numDrinks} {numDrinks === 1 ? drinkText : drinkTextPlural}!</>
                      ) : (
                        <>Beba {numDrinks} {numDrinks === 1 ? drinkText : drinkTextPlural}!</>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      onClick={handleDrink}
                      variant={action === "drink" ? "outline" : "default"}
                      className={action === "drink"
                        ? "bg-purple-900 text-white hover:bg-purple-950 hover:text-white w-full sm:w-auto justify-center"
                        : "bg-purple-900 hover:bg-purple-950 text-white hover:text-white w-full sm:w-auto justify-center"}
                    >
                      <Beer className="mr-2 h-5 w-5" />
                      Bebeu
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleRefusal}
                      variant="outline"
                      className="bg-white border-purple-700 text-purple-700 hover:bg-purple-50 hover:text-purple-700 w-full sm:w-auto justify-center"
                    >
                      <X className="mr-2 h-5 w-5" />
                      Se recusou a beber
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-white" />
                <h3 className="text-xl font-bold text-white">Ranking</h3>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowPlayerList(true)}
                className="text-white hover:text-white/80"
              >
                <Users className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-3">
              {sortedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="bg-white/10 p-3 rounded-lg flex items-center justify-between"
                >
                  <span className="text-white">{player.name}</span>
                  <div className="flex items-center gap-1 text-white/80">
                    <Beer className="h-4 w-4" />
                    <span>{player.points} {drinkTextPlural}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedPlayer && action && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/10 backdrop-blur-sm">
            <div className="container max-w-4xl mx-auto">
              <Button
                size="lg"
                onClick={handleNextPlayer}
                disabled={updatePoints.isPending}
                className="bg-purple-900 hover:bg-purple-950 text-white hover:text-white px-8 py-6 text-xl w-full"
              >
                Sortear Próximo Jogador
              </Button>
            </div>
          </div>
        )}

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
      </div>
    </GameLayout>
  );
}