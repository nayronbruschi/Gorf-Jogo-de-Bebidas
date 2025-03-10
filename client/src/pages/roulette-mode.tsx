import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/hooks/use-sound";
import { Beer, X, Award, Users } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { PlayerList } from "@/components/PlayerList";

// Desafios de punição para quem se recusa a beber
const punishmentChallenges = [
  { text: "Dançar 'I'm a Little Teapot' com gestos", icon: Beer },
  { text: "Imitar um animal por 30 segundos", icon: Beer },
  { text: "Cantar 'Parabéns pra Você' em ópera", icon: Beer },
  { text: "Fazer 10 polichinelos contando em alemão", icon: Beer },
  { text: "Declarar seu amor para uma planta", icon: Beer },
];

export default function RouletteMode() {
  // Estados do jogo
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [numDrinks, setNumDrinks] = useState(0);
  const [showPunishment, setShowPunishment] = useState(false);
  const [currentPunishment, setCurrentPunishment] = useState<{text: string, icon: any} | null>(null);
  const [showPlayerList, setShowPlayerList] = useState(false);
  const [action, setAction] = useState<"drink" | "refuse" | null>(null);
  const [punishmentDrinks, setPunishmentDrinks] = useState(0);

  // Hooks e configurações
  const [, navigate] = useLocation();
  const { play } = useSound();
  const gameMode = localStorage.getItem("rouletteMode") || "goles";
  const maxPoints = Number(localStorage.getItem("maxPoints"));
  const drinkText = gameMode === "shots" ? "shot" : "gole";
  const drinkTextPlural = gameMode === "shots" ? "shots" : "goles";

  // Queries e Mutations
  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  // Verificar vitória para todos os jogadores
  const checkAllPlayersForWin = async () => {
    const maxPoints = Number(localStorage.getItem("maxPoints"));
    console.log('Pontuação máxima:', maxPoints);

    if (!players || players.length === 0) return false;

    // Buscar dados atualizados dos jogadores
    const updatedPlayers = await apiRequest("GET", "/api/players");

    for (const player of updatedPlayers) {
      console.log('Verificando jogador:', {
        nome: player.name,
        pontos: player.points,
        maximoPontos: maxPoints
      });

      if (player.points >= maxPoints) {
        console.log('VITÓRIA ENCONTRADA! Redirecionando...');
        navigate(`/roulette/winner?playerId=${player.id}`);
        return true;
      }
    }
    return false;
  };

  // Mutation para atualizar pontos
  const updatePoints = useMutation({
    mutationFn: async (data: { playerId: number; points: number }) => {
      return await apiRequest("PATCH", `/api/players/${data.playerId}/points`, {
        type: "drink",
        points: data.points
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/players"] });
    }
  });

  // Selecionar jogador aleatório
  const selectRandomPlayer = () => {
    if (isSelecting) return;

    setIsSelecting(true);
    setAction(null);
    setPunishmentDrinks(0);
    play('spin');

    setTimeout(() => {
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      const minDrinks = gameMode === "shots" ? 1 : 2;
      const maxDrinks = Number(localStorage.getItem("maxPerRound")) || (gameMode === "shots" ? 5 : 15);
      const randomDrinks = Math.floor(Math.random() * (maxDrinks - minDrinks + 1)) + minDrinks;

      setSelectedPlayer(randomPlayer);
      setNumDrinks(randomDrinks);
      setIsSelecting(false);
      play('tada');
    }, 2000);
  };

  // Handlers
  const handleDrink = () => {
    if (!selectedPlayer) return;
    setAction("drink");
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

      // Atualizar pontos
      await updatePoints.mutateAsync({
        playerId: selectedPlayer.id,
        points: pointsToAdd
      });

      // Aguardar atualização do cache
      await queryClient.invalidateQueries({ queryKey: ["/api/players"] });

      // Verificar vitória imediatamente após a atualização
      const hasWinner = await checkAllPlayersForWin();

      // Só continuar se não houver vencedor
      if (!hasWinner) {
        setAction(null);
        setShowPunishment(false);
        selectRandomPlayer();
      }
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

  // Ordenar jogadores por pontos
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <GameLayout title="">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pb-24">
        <div className="bg-white rounded-xl p-6 space-y-8">
          {!selectedPlayer && !isSelecting && (
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={selectRandomPlayer}
                className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-6 text-xl"
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
                      ? "border-purple-700 text-purple-700 hover:bg-purple-50 w-full sm:w-auto justify-center"
                      : "bg-purple-700 hover:bg-purple-800 text-white w-full sm:w-auto justify-center"}
                  >
                    <Beer className="mr-2 h-5 w-5" />
                    Bebeu
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleRefusal}
                    variant="outline"
                    className="bg-white border-purple-700 text-purple-700 hover:bg-purple-50 w-full sm:w-auto justify-center"
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
              className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-6 text-xl w-full"
            >
              Sortear Próximo Jogador
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showPunishment} onOpenChange={setShowPunishment}>
        <DialogContent className="bg-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl text-purple-900">
              Se recusando a beber, {selectedPlayer?.name}?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-center text-2xl font-bold text-purple-700">
              Que coisa feia!
            </p>
            <p className="text-center text-xl text-purple-900">
              Por isso você deve:
            </p>
            {currentPunishment && (
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <currentPunishment.icon className="h-12 w-12 mx-auto mb-4 text-purple-700" />
                <p className="text-purple-700 text-2xl font-bold">
                  {currentPunishment.text}
                </p>
              </div>
            )}
            <div className="text-center text-sm text-purple-600">
              {drinkTextPlural} acumulados neste desafio: {punishmentDrinks}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleNextPlayer}
                className="bg-purple-700 hover:bg-purple-800 text-white text-xl py-6"
              >
                Fez o desafio
              </Button>
              <Button
                variant="outline"
                onClick={generateNewPunishment}
                className="border-purple-700 text-purple-700 hover:bg-purple-50"
              >
                Beba mais um {drinkText} para gerar outro desafio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPlayerList} onOpenChange={setShowPlayerList}>
        <DialogContent className="bg-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-purple-900">Gerenciar Jogadores</DialogTitle>
          </DialogHeader>
          <PlayerList />
        </DialogContent>
      </Dialog>
    </GameLayout>
  );
}