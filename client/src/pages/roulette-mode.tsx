import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/hooks/use-sound";
import { Beer, X, Award, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const punishmentChallenges = [
  "Dançar 'I'm a Little Teapot' com gestos",
  "Imitar um animal por 30 segundos",
  "Cantar 'Parabéns pra Você' em ópera",
  "Fazer 10 polichinelos contando em alemão",
  "Declarar seu amor para uma planta",
  "Inventar uma música sobre bebida",
  "Fazer uma pose de balé por 30 segundos",
  "Imitar um jogador de futebol comemorando",
  "Fazer uma declaração dramática",
  "Dançar como se estivesse nos anos 80"
];

export default function RouletteMode() {
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [numDrinks, setNumDrinks] = useState(0);
  const [showPunishment, setShowPunishment] = useState(false);
  const [currentPunishment, setCurrentPunishment] = useState("");
  const { play } = useSound();

  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const selectRandomPlayer = () => {
    setIsSelecting(true);
    play("spin");

    setTimeout(() => {
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      const randomDrinks = Math.floor(Math.random() * 10) + 1;
      setSelectedPlayer(randomPlayer);
      setNumDrinks(randomDrinks);
      setIsSelecting(false);
      play("tada");
    }, 2000);
  };

  const handleRefusal = () => {
    const randomPunishment = punishmentChallenges[Math.floor(Math.random() * punishmentChallenges.length)];
    setCurrentPunishment(randomPunishment);
    setShowPunishment(true);
  };

  const generateNewPunishment = () => {
    const randomPunishment = punishmentChallenges[Math.floor(Math.random() * punishmentChallenges.length)];
    setCurrentPunishment(randomPunishment);
  };

  // Ordenar jogadores por pontuação
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <GameLayout title="">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Área do Jogo */}
        <div className="bg-white rounded-xl p-6 space-y-8">
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={selectRandomPlayer}
              disabled={isSelecting}
              className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-6 text-xl"
            >
              Sortear Jogador
            </Button>
          </div>

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
                <h3 className="text-2xl font-bold text-purple-900 mb-4">
                  É a vez de {selectedPlayer.name}
                </h3>
                <p className="text-purple-700 text-xl mb-6">
                  Beba {numDrinks} {numDrinks === 1 ? 'gole' : 'goles'}!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={() => setSelectedPlayer(null)}
                    className="bg-purple-700 hover:bg-purple-800 text-white w-full sm:w-auto"
                  >
                    <Beer className="mr-2 h-5 w-5" />
                    Bebeu
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleRefusal}
                    variant="outline"
                    className="border-purple-700 text-purple-700 hover:bg-purple-50 w-full sm:w-auto"
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
          <div className="flex items-center gap-2 mb-6">
            <Award className="h-5 w-5 text-white" />
            <h3 className="text-xl font-bold text-white">Ranking</h3>
          </div>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className="bg-white/10 p-3 rounded-lg flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white">{player.name}</span>
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

      <Dialog open={showPunishment} onOpenChange={setShowPunishment}>
        <DialogContent className="bg-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl text-purple-900">
              Se recusando a beber?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-center text-lg font-semibold text-purple-700">
              Que coisa feia!
            </p>
            <p className="text-center">
              Por isso você deve:
            </p>
            <div className="bg-purple-50 p-4 rounded-lg text-center text-purple-700 font-medium">
              {currentPunishment}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setShowPunishment(false)}
                className="bg-purple-700 hover:bg-purple-800 text-white"
              >
                Fez o desafio
              </Button>
              <Button
                variant="outline"
                onClick={generateNewPunishment}
                className="border-purple-700 text-purple-700 hover:bg-purple-50"
              >
                Beba mais um gole para gerar outro desafio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </GameLayout>
  );
}