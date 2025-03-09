import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { classicChallenges } from "@/lib/game-data";
import { useSound } from "@/hooks/use-sound";
import { User, Beer, Target, ArrowRight, Award, Crown } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WinnerScreen } from "@/components/WinnerScreen";

export default function ClassicMode() {
  const [currentChallenge, setCurrentChallenge] = useState("");
  const [completedChallenge, setCompletedChallenge] = useState(false);
  const [hasDrunk, setHasDrunk] = useState(false);
  const [roundPoints, setRoundPoints] = useState(0);
  const { play } = useSound();
  const { toast } = useToast();

  const { data: currentPlayer } = useQuery({
    queryKey: ["/api/players/current"],
  });

  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
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

  const generateChallenge = () => {
    const challenge = classicChallenges[Math.floor(Math.random() * classicChallenges.length)];
    const points = Math.floor(Math.random() * 9) + 2; // 2-10 pontos
    setCurrentChallenge(challenge);
    setRoundPoints(points);
  };

  // Gerar desafio inicial se ainda não existe
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
      // Contabilizar pontos do jogador atual
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

      // Passar para o próximo jogador
      await nextPlayer.mutateAsync();

      // Atualizar a lista de jogadores
      await queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/players/current"] });

      // Resetar estados e gerar novo desafio
      setCompletedChallenge(false);
      setHasDrunk(false);
      generateChallenge();
      play("click");
    } catch (error) {
      console.error('Erro ao processar a rodada:', error);
    }
  };

  // Verificar se alguém ganhou
  const winner = players.find(player => player.points >= (settings?.maxPoints || 100));
  const topDrinker = [...players].sort((a, b) => b.drinksCompleted - a.drinksCompleted)[0];

  if (winner) {
    return (
      <WinnerScreen
        winner={{ name: winner.name, points: winner.points }}
        topDrinker={{ name: topDrinker.name, drinks: topDrinker.drinksCompleted }}
        maxPoints={settings?.maxPoints || 100}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  const handlePlayAgain = async () => {
    try {
      // Resetar pontuações mantendo os jogadores
      await apiRequest("POST", "/api/players/reset", {});

      // Atualizar o estado local
      setCompletedChallenge(false);
      setHasDrunk(false);
      setCurrentChallenge("");
      setRoundPoints(0);

      // Atualizar os dados
      await queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/players/current"] });

      generateChallenge();
    } catch (error) {
      console.error('Erro ao reiniciar o jogo:', error);
    }
  };

  // Ordenar jogadores por pontuação para o ranking
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

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
                Ou beba {roundPoints} goles
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Checkboxes e Botão Próximo */}
        <div className="flex flex-col gap-6 w-full max-w-sm">
          <div className="space-y-4">
            <div 
              className="flex items-center gap-3 bg-white/10 p-4 rounded-lg cursor-pointer w-full select-none" 
              onClick={() => setCompletedChallenge(!completedChallenge)}
            >
              <Checkbox
                id="challenge"
                checked={completedChallenge}
                onCheckedChange={(checked) => setCompletedChallenge(checked as boolean)}
                className="data-[state=checked]:bg-white data-[state=checked]:text-purple-500 border-white"
              />
              <label htmlFor="challenge" className="text-white cursor-pointer flex items-center gap-2 flex-1 w-full">
                <Target className="h-5 w-5" />
                <span className="flex-1">Completou o Desafio</span>
                <span className="text-sm text-white/80">+{roundPoints}pts</span>
              </label>
            </div>

            <div 
              className="flex items-center gap-3 bg-white/10 p-4 rounded-lg cursor-pointer w-full select-none"
              onClick={() => setHasDrunk(!hasDrunk)}
            >
              <Checkbox
                id="drink"
                checked={hasDrunk}
                onCheckedChange={(checked) => setHasDrunk(checked as boolean)}
                className="data-[state=checked]:bg-white data-[state=checked]:text-purple-500 border-white"
              />
              <label htmlFor="drink" className="text-white cursor-pointer flex items-center gap-2 flex-1 w-full">
                <Beer className="h-5 w-5" />
                <span className="flex-1">Bebeu {roundPoints} goles</span>
                <span className="text-sm text-white/80">+{roundPoints}pts</span>
              </label>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleNextPlayer}
            className="bg-white/20 hover:bg-white/30 text-white text-xl"
            disabled={nextPlayer.isPending || updatePoints.isPending || (!completedChallenge && !hasDrunk)}
          >
            <ArrowRight className="mr-2 h-6 w-6" />
            Próximo Jogador
          </Button>
        </div>

        {/* Ranking */}
        <div className="w-full max-w-sm mt-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Ranking
          </h3>
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
  );
}