import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { classicChallenges } from "@/lib/game-data";
import { useSound } from "@/hooks/use-sound";
import { User, Beer, Target, ArrowRight, Play } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ClassicMode() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState("");
  const [completedChallenge, setCompletedChallenge] = useState(false);
  const [hasDrunk, setHasDrunk] = useState(false);
  const { play } = useSound();
  const { toast } = useToast();

  const { data: currentPlayer } = useQuery({
    queryKey: ["/api/players/current"],
  });

  const updatePoints = useMutation({
    mutationFn: async ({ playerId, type }: { playerId: number; type: "challenge" | "drink" }) => {
      await apiRequest("PATCH", `/api/players/${playerId}/points`, { type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      play("success");
      toast({
        title: "Pontos atualizados!",
        description: "Os pontos foram adicionados com sucesso.",
      });
    },
  });

  const nextPlayer = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/players/next", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players/current"] });
      play("click");
    },
  });

  const handleStart = () => {
    setIsGameStarted(true);
    generateChallenge();
  };

  const generateChallenge = () => {
    const challenge = classicChallenges[Math.floor(Math.random() * classicChallenges.length)];
    setCurrentChallenge(challenge);
  };

  const handleNextPlayer = async () => {
    // Contabilizar pontos do jogador atual
    if (currentPlayer) {
      if (completedChallenge) {
        await updatePoints.mutate({ playerId: currentPlayer.id, type: "challenge" });
      }
      if (hasDrunk) {
        await updatePoints.mutate({ playerId: currentPlayer.id, type: "drink" });
      }
    }

    // Resetar estados
    setCompletedChallenge(false);
    setHasDrunk(false);

    // Passar para o próximo jogador e gerar novo desafio
    await nextPlayer.mutate();
    generateChallenge();
  };

  if (!isGameStarted) {
    return (
      <GameLayout title="Modo Clássico">
        <div className="flex flex-col items-center gap-8">
          <p className="text-xl text-white/80 text-center">
            Prepare-se para desafios divertidos! Cada jogador terá sua vez de enfrentar um desafio ou beber.
          </p>
          <Button
            size="lg"
            onClick={handleStart}
            className="bg-white/20 hover:bg-white/30 text-white text-xl px-8 py-6"
          >
            <Play className="mr-2 h-6 w-6" />
            Iniciar Jogo
          </Button>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout title="Modo Clássico">
      <div className="flex flex-col items-center gap-8">
        {/* Jogador Atual */}
        <div className="flex items-center gap-4 text-white/80">
          <User className="h-6 w-6" />
          <span className="text-xl">
            {currentPlayer ? `Vez de ${currentPlayer.name}` : "Selecione os jogadores"}
          </span>
        </div>

        {/* Desafio Atual */}
        <AnimatePresence mode="wait">
          {currentChallenge && (
            <motion.div
              key={currentChallenge}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-3xl font-bold text-center text-white"
            >
              {currentChallenge}
              <div className="mt-4 text-lg font-normal text-white/80">
                Ou beba 3 goles
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Checkboxes e Botão Próximo */}
        <div className="flex flex-col gap-6 w-full max-w-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-lg">
              <Checkbox
                id="challenge"
                checked={completedChallenge}
                onCheckedChange={(checked) => setCompletedChallenge(checked as boolean)}
              />
              <label htmlFor="challenge" className="text-white cursor-pointer flex items-center gap-2">
                <Target className="h-5 w-5" />
                Completou o Desafio
              </label>
            </div>

            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-lg">
              <Checkbox
                id="drink"
                checked={hasDrunk}
                onCheckedChange={(checked) => setHasDrunk(checked as boolean)}
              />
              <label htmlFor="drink" className="text-white cursor-pointer flex items-center gap-2">
                <Beer className="h-5 w-5" />
                Bebeu
              </label>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleNextPlayer}
            className="bg-white/20 hover:bg-white/30 text-white text-xl"
            disabled={nextPlayer.isPending || updatePoints.isPending}
          >
            <ArrowRight className="mr-2 h-6 w-6" />
            Próximo Jogador
          </Button>
        </div>
      </div>
    </GameLayout>
  );
}