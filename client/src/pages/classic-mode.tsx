import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { classicChallenges } from "@/lib/game-data";
import { useSound } from "@/hooks/use-sound";
import { Shuffle, User, Beer, Target, SkipForward } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ClassicMode() {
  const [currentChallenge, setCurrentChallenge] = useState("");
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

  const generateChallenge = () => {
    play("click");
    const challenge = classicChallenges[Math.floor(Math.random() * classicChallenges.length)];
    setCurrentChallenge(challenge);
  };

  return (
    <GameLayout title="Modo Clássico">
      <div className="flex flex-col items-center gap-8">
        {/* Jogador Atual */}
        <div className="flex items-center gap-4 text-white/80">
          <User className="h-6 w-6" />
          <span className="text-xl">
            {currentPlayer ? `Vez de ${currentPlayer.name}` : "Selecione os jogadores"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => nextPlayer.mutate()}
            className="text-white/80 hover:text-white"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
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

        {/* Botões de Ação */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Button
            size="lg"
            onClick={generateChallenge}
            className="bg-white/20 hover:bg-white/30 text-white text-xl"
          >
            <Shuffle className="mr-2 h-6 w-6" />
            Gerar Desafio
          </Button>

          {currentChallenge && currentPlayer && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => updatePoints.mutate({ playerId: currentPlayer.id, type: "challenge" })}
                className="bg-green-500/50 hover:bg-green-500/70 text-white"
                disabled={updatePoints.isPending}
              >
                <Target className="mr-2 h-5 w-5" />
                Completou Desafio
              </Button>
              <Button
                onClick={() => updatePoints.mutate({ playerId: currentPlayer.id, type: "drink" })}
                className="bg-purple-500/50 hover:bg-purple-500/70 text-white"
                disabled={updatePoints.isPending}
              >
                <Beer className="mr-2 h-5 w-5" />
                Bebeu
              </Button>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}