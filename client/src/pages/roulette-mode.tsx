import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/hooks/use-sound";
import { Beer, X, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const punishmentChallenges = [
  "Dance 'I'm a Little Teapot' com os gestos",
  "Imite um animal por 30 segundos",
  "Cante 'Parabéns pra Você' em ópera",
  "Faça 10 polichinelos enquanto conta em alemão",
  "Declare seu amor por uma planta",
  "Invente uma música sobre sua bebida favorita",
  "Faça uma pose de balé e mantenha por 30 segundos",
  "Imite seu jogador favorito de futebol comemorando um gol",
  "Faça uma declaração dramática para seu celular",
  "Dance como se estivesse em uma balada dos anos 80"
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

  return (
    <GameLayout title="">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <p className="text-white/80 mb-6">
            Adicione pelo menos 2 jogadores para começar!
          </p>
        </div>

        {players.length >= 2 && (
          <div className="space-y-8">
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={selectRandomPlayer}
                disabled={isSelecting}
                className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-6"
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
                  className="text-center text-white text-2xl font-bold"
                >
                  Sorteando...
                </motion.div>
              )}

              {selectedPlayer && !isSelecting && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                >
                  <h3 className="text-2xl font-bold text-white mb-4">
                    É a vez de {selectedPlayer.name}
                  </h3>
                  <p className="text-white/80 text-xl mb-6">
                    Beba {numDrinks} {numDrinks === 1 ? 'gole' : 'goles'}!
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button
                      size="lg"
                      onClick={() => setSelectedPlayer(null)}
                      className="bg-purple-700 hover:bg-purple-800 text-white"
                    >
                      <Beer className="mr-2 h-5 w-5" />
                      Bebeu
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleRefusal}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500/10"
                    >
                      <X className="mr-2 h-5 w-5" />
                      Se recusou a beber
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <Dialog open={showPunishment} onOpenChange={setShowPunishment}>
          <DialogContent className="bg-white rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-center flex items-center justify-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                Se recusando a beber {selectedPlayer?.name}?
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
      </div>
    </GameLayout>
  );
}