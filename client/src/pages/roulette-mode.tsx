import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { PlayerList } from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/hooks/use-sound";
import { Beer, X, Award, Users, Activity, Cat, Mic2, Dumbbell, Flower2, Music, Drama, Trophy, Heart, PartyPopper } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

const punishmentChallenges = [
  { text: "Dançar 'I'm a Little Teapot' com gestos", icon: Activity },
  { text: "Imitar um animal por 30 segundos", icon: Cat },
  { text: "Cantar 'Parabéns pra Você' em ópera", icon: Mic2 },
  { text: "Fazer 10 polichinelos contando em alemão", icon: Dumbbell },
  { text: "Declarar seu amor para uma planta", icon: Flower2 },
  { text: "Inventar uma música sobre bebida", icon: Music },
  { text: "Fazer uma pose de balé por 30 segundos", icon: Drama },
  { text: "Imitar um jogador de futebol comemorando", icon: Trophy },
  { text: "Fazer uma declaração dramática", icon: Heart },
  { text: "Dançar como se estivesse nos anos 80", icon: PartyPopper }
];

export default function RouletteMode() {
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [numDrinks, setNumDrinks] = useState(0);
  const [showPunishment, setShowPunishment] = useState(false);
  const [currentPunishment, setCurrentPunishment] = useState<{text: string, icon: any} | null>(null);
  const [showPlayerList, setShowPlayerList] = useState(false);
  const [action, setAction] = useState<"drink" | "refuse" | null>(null);
  const { play } = useSound();

  const gameMode = localStorage.getItem("rouletteMode") || "goles";
  const drinkText = gameMode === "shots" ? "shot" : "gole";
  const drinkTextPlural = gameMode === "shots" ? "shots" : "goles";

  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const updateDrinks = useMutation({
    mutationFn: async ({ playerId, drinks }: { playerId: number; drinks: number }) => {
      await apiRequest("PATCH", `/api/players/${playerId}/drinks`, { drinks });
      await apiRequest("PATCH", `/api/players/${playerId}/points`, { type: "drink", points: drinks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
    }
  });

  const selectRandomPlayer = () => {
    setIsSelecting(true);
    setAction(null);
    play("spin");

    setTimeout(() => {
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      const minDrinks = gameMode === "shots" ? 1 : 2;
      const maxDrinks = gameMode === "shots" ? 5 : 15;
      const randomDrinks = Math.floor(Math.random() * (maxDrinks - minDrinks + 1)) + minDrinks;
      setSelectedPlayer(randomPlayer);
      setNumDrinks(randomDrinks);
      setIsSelecting(false);
      play("tada");
    }, 2000);
  };

  const handleDrink = async () => {
    if (!selectedPlayer) return;
    if (action === "drink") return; // Evita múltiplos cliques

    setAction("drink");
  };

  const handleRefusal = () => {
    if (action === "refuse") return; // Evita múltiplos cliques

    setAction("refuse");
    const randomPunishment = punishmentChallenges[Math.floor(Math.random() * punishmentChallenges.length)];
    setCurrentPunishment(randomPunishment);
    setShowPunishment(true);
  };

  const generateNewPunishment = async () => {
    if (!selectedPlayer) return;

    try {
      await updateDrinks.mutateAsync({
        playerId: selectedPlayer.id,
        drinks: 1
      });

      const randomPunishment = punishmentChallenges[Math.floor(Math.random() * punishmentChallenges.length)];
      setCurrentPunishment(randomPunishment);
    } catch (error) {
      console.error('Erro ao atualizar goles:', error);
    }
  };

  const handlePunishmentComplete = () => {
    setShowPunishment(false);
    selectRandomPlayer();
  };

  const handleNextPlayer = async () => {
    if (!selectedPlayer || !action) return;

    try {
      if (action === "drink") {
        await updateDrinks.mutateAsync({
          playerId: selectedPlayer.id,
          drinks: numDrinks
        });
      }
      selectRandomPlayer();
    } catch (error) {
      console.error('Erro ao atualizar goles:', error);
    }
  };

  // Ordenar jogadores por quantidade de goles
  const sortedPlayers = [...players].sort((a, b) => b.drinksCompleted - a.drinksCompleted);

  return (
    <GameLayout title="">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pb-24">
        {/* Área do Jogo */}
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
                    disabled={action === "refuse"}
                    className={cn(
                      "w-full sm:w-auto justify-center",
                      action === "drink"
                        ? "border-purple-700 text-purple-700 hover:bg-purple-50"
                        : "bg-purple-700 hover:bg-purple-800 text-white"
                    )}
                  >
                    <Beer className="mr-2 h-5 w-5" />
                    Bebeu
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleRefusal}
                    variant="outline"
                    disabled={action === "drink"}
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

        {/* Ranking */}
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
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className="bg-white/10 p-3 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white">{player.name}</span>
                  <div className="flex items-center gap-1 text-white/80">
                    <Beer className="h-4 w-4" />
                    <span>{player.drinksCompleted} {drinkTextPlural}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botão Sortear fixo no rodapé */}
      {selectedPlayer && action && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/10 backdrop-blur-sm">
          <div className="container max-w-4xl mx-auto">
            <Button
              size="lg"
              onClick={handleNextPlayer}
              disabled={isSelecting || !action}
              className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-6 text-xl w-full"
            >
              Sortear Próximo Jogador
            </Button>
          </div>
        </div>
      )}

      {/* Popup de Desafio */}
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
              Goles acumulados neste desafio: {selectedPlayer?.drinksCompleted || 0}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={handlePunishmentComplete}
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

      {/* Popup de Gerenciar Jogadores */}
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