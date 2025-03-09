import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { classicChallenges } from "@/lib/game-data";
import { useSound } from "@/hooks/use-sound";
import { User, Beer, Target, ArrowRight, Award, Crown, Plus, Minus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WinnerScreen } from "@/components/WinnerScreen";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ClassicMode() {
  const [currentChallenge, setCurrentChallenge] = useState("");
  const [completedChallenge, setCompletedChallenge] = useState(false);
  const [hasDrunk, setHasDrunk] = useState(false);
  const [roundPoints, setRoundPoints] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [maxPoints, setMaxPoints] = useState(100);
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
    onSuccess: () => {
      setMaxPoints(settings?.maxPoints || 100);
    }
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
    mutationFn: async (points: number) => {
      await apiRequest("PATCH", "/api/settings", { maxPoints: points });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setDialogOpen(false);
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
  const winner = players.find(player => player.points >= maxPoints);
  const topDrinker = [...players].sort((a, b) => b.drinksCompleted - a.drinksCompleted)[0];

  if (winner) {
    return (
      <WinnerScreen
        winner={{ name: winner.name, points: winner.points }}
        topDrinker={{ name: topDrinker.name, drinks: topDrinker.drinksCompleted }}
        maxPoints={maxPoints}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Box do Jogo */}
        <div className="bg-white rounded-xl p-6 space-y-8">
          {/* Jogador Atual */}
          <div className="flex items-center gap-4 text-purple-900">
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
                className="text-3xl font-bold text-center text-purple-900"
              >
                {currentChallenge}
                <div className="mt-4 text-lg font-normal text-purple-700">
                  Ou beba {roundPoints} goles
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botões de Ação */}
          <div className="space-y-4">
            <button
              onClick={() => setCompletedChallenge(!completedChallenge)}
              className={`w-full flex items-center gap-3 p-4 rounded-lg cursor-pointer select-none text-left transition-colors
                ${completedChallenge
                  ? 'bg-purple-50 border-2 border-purple-700'
                  : 'bg-purple-50 border-2 border-transparent hover:border-purple-200'}`}
            >
              <Target className="h-5 w-5 text-purple-900" />
              <span className="flex-1 text-purple-900">Completou o desafio</span>
              <span className="text-sm text-purple-700">+{roundPoints}pts</span>
            </button>

            <button
              onClick={() => setHasDrunk(!hasDrunk)}
              className={`w-full flex items-center gap-3 p-4 rounded-lg cursor-pointer select-none text-left transition-colors
                ${hasDrunk
                  ? 'bg-purple-50 border-2 border-purple-700'
                  : 'bg-purple-50 border-2 border-transparent hover:border-purple-200'}`}
            >
              <Beer className="h-5 w-5 text-purple-900" />
              <span className="flex-1 text-purple-900">Bebeu {roundPoints} goles</span>
              <span className="text-sm text-purple-700">+{roundPoints}pts</span>
            </button>
          </div>

          {/* Botão Próximo */}
          <div className="space-y-4">
            <Button
              size="lg"
              onClick={handleNextPlayer}
              className="bg-purple-700 hover:bg-purple-800 text-white text-xl w-full"
              disabled={nextPlayer.isPending || updatePoints.isPending || (!completedChallenge && !hasDrunk)}
            >
              <ArrowRight className="mr-2 h-6 w-6" />
              Próxima rodada
            </Button>

            <div className="text-sm text-purple-900 text-center">
              Objetivo: {maxPoints} pontos{" "}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger className="text-purple-700 underline hover:text-purple-800 ml-1">
                  alterar &gt;
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Alterar Pontuação Máxima</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="rounded-full w-8 h-8"
                      onClick={() => setMaxPoints(Math.max(10, maxPoints - 10))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={maxPoints}
                      onChange={(e) => setMaxPoints(Number(e.target.value))}
                      className="text-center"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="rounded-full w-8 h-8"
                      onClick={() => setMaxPoints(Math.min(1000, maxPoints + 10))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => updateMaxPoints.mutate(maxPoints)}
                  >
                    Salvar
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Box do Ranking */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
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