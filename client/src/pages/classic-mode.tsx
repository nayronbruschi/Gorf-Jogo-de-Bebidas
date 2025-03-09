import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { classicChallenges } from "@/lib/game-data";
import { useSound } from "@/hooks/use-sound";
import { User, Beer, Target, ArrowRight, Minus, Plus, Award } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WinnerScreen } from "@/components/WinnerScreen";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";


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

      // Reiniciar o jogo -  this line is redundant as the component rerenders with a new challenge
      //setIsGameStarted(true);
      generateChallenge();
    } catch (error) {
      console.error('Erro ao reiniciar o jogo:', error);
    }
  };

  const maxPointsForm = useForm({
    defaultValues: { maxPoints: settings?.maxPoints || 100 },
  });

  const onUpdateMaxPoints = async (data: any) => {
    await apiRequest("PATCH", "/api/settings", { maxPoints: data.maxPoints });
    queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
  };


  return (
    <GameLayout title="Modo Clássico">
      <div className="flex flex-col items-center gap-8">
        {/* Lista de Jogadores e Pontuação Máxima */}
        <div className="w-full max-w-lg mx-auto bg-purple-100 rounded-lg p-4 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Jogadores</h3>
            <div className="text-sm flex items-center gap-2">
              Meta: {settings?.maxPoints || 100} pontos
              <Dialog>
                <DialogTrigger className="text-purple-500 underline hover:text-purple-600">
                  alterar
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Alterar Pontuação Máxima</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={maxPointsForm.handleSubmit(onUpdateMaxPoints)} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const current = maxPointsForm.getValues("maxPoints");
                          maxPointsForm.setValue("maxPoints", Math.max(10, Number(current) - 10));
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        className="text-center w-20"
                        {...maxPointsForm.register("maxPoints")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const current = maxPointsForm.getValues("maxPoints");
                          maxPointsForm.setValue("maxPoints", Math.min(1000, Number(current) + 10));
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button type="submit" className="w-full">Salvar</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-2">
            {players.map((player) => (
              <div key={player.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{player.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span>{player.points} pts</span>
                  </div>
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

        {/* Jogador Atual */}
        <div className="flex items-center gap-4 text-purple-500">
          <User className="h-6 w-6" />
          <span className="text-xl text-center">
            Vez de <span className="font-bold">{currentPlayer?.name}</span>
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
              className="text-3xl font-bold text-center text-purple-500"
            >
              {currentChallenge}
              <div className="mt-4 text-lg font-normal text-purple-500/80">
                Ou beba {roundPoints} goles
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Checkboxes e Botão Próximo */}
        <div className="flex flex-col gap-6 w-full max-w-sm">
          <div className="space-y-4">
            <div
              className="flex items-center gap-3 bg-purple-100 p-4 rounded-lg cursor-pointer w-full select-none"
              onClick={() => setCompletedChallenge(!completedChallenge)}
            >
              <Checkbox
                id="challenge"
                checked={completedChallenge}
                onCheckedChange={(checked) => setCompletedChallenge(checked as boolean)}
                className="data-[state=checked]:bg-purple-500 border-purple-500"
              />
              <label htmlFor="challenge" className="cursor-pointer flex items-center gap-2 flex-1 w-full">
                <Target className="h-5 w-5" />
                <span className="flex-1">Completou o Desafio</span>
                <span className="text-sm">+{roundPoints}pts</span>
              </label>
            </div>

            <div
              className="flex items-center gap-3 bg-purple-100 p-4 rounded-lg cursor-pointer w-full select-none"
              onClick={() => setHasDrunk(!hasDrunk)}
            >
              <Checkbox
                id="drink"
                checked={hasDrunk}
                onCheckedChange={(checked) => setHasDrunk(checked as boolean)}
                className="data-[state=checked]:bg-purple-500 border-purple-500"
              />
              <label htmlFor="drink" className="cursor-pointer flex items-center gap-2 flex-1 w-full">
                <Beer className="h-5 w-5" />
                <span className="flex-1">Bebeu {roundPoints} goles</span>
                <span className="text-sm">+{roundPoints}pts</span>
              </label>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleNextPlayer}
            className="bg-purple-500 hover:bg-purple-600 text-white text-xl"
            disabled={nextPlayer.isPending || updatePoints.isPending || (!completedChallenge && !hasDrunk)}
          >
            <ArrowRight className="mr-2 h-6 w-6" />
            Próximo Jogador
          </Button>
        </div>
      </div>
    </GameLayout>
  );
}