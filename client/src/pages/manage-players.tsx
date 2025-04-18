import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlayerSchema } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Crown, Beer, Target, UserPlus, X, Plus, Minus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { auth } from "@/lib/firebase";
import * as z from 'zod';
import type { Player } from "@shared/schema";

export default function ManagePlayers() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Verificar se o usuário está autenticado
  if (!auth.currentUser) {
    navigate("/");
    toast({
      title: "Acesso negado",
      description: "Você precisa estar logado para gerenciar jogadores.",
      variant: "destructive"
    });
    return null;
  }

  // Adiciona tipagem explícita para players
  const { data: players = [], isError, error } = useQuery<Player[]>({
    queryKey: ["/api/players"],
    onError: (err) => {
      console.error("Erro ao carregar jogadores:", err);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os jogadores. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const form = useForm({
    resolver: zodResolver(insertPlayerSchema.extend({
      name: z.string().min(1, "Nome é obrigatório").max(30, "Nome muito longo"),
    })),
    defaultValues: {
      name: "",
    },
  });

  const maxPointsForm = useForm({
    defaultValues: {
      maxPoints: settings?.maxPoints || 100,
    },
  });

  const addPlayer = useMutation({
    mutationFn: async (name: string) => {
      console.log("Tentando adicionar jogador:", name);
      await apiRequest("POST", "/api/players", { name });
    },
    onSuccess: () => {
      console.log("Jogador adicionado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      form.reset();
      toast({
        title: "Jogador adicionado",
        description: "Um novo jogador foi adicionado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao adicionar jogador:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o jogador. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const updateMaxPoints = useMutation({
    mutationFn: async (maxPoints: number) => {
      await apiRequest("PATCH", "/api/settings", { maxPoints });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });

  const removePlayer = useMutation({
    mutationFn: async (id: string) => {
      console.log("Tentando remover jogador:", id);
      const player = players.find(p => p.id === id);
      if (!player) return;

      const remainingPlayers = players.filter(p => p.id !== id);
      if (remainingPlayers.length > 0 && player.points > 0) {
        const pointsPerPlayer = Math.floor(player.points / remainingPlayers.length);
        if (pointsPerPlayer > 0) {
          for (const p of remainingPlayers) {
            await apiRequest("PATCH", `/api/players/${p.id}/points`, {
              points: pointsPerPlayer,
              type: "challenge"
            });
          }
        }
      }

      await apiRequest("DELETE", `/api/players/${id}`);
    },
    onSuccess: () => {
      console.log("Jogador removido com sucesso");
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Jogador removido",
        description: "Os pontos foram distribuídos entre os jogadores restantes.",
      });
    },
    onError: (error) => {
      console.error("Erro ao remover jogador:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o jogador. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = form.handleSubmit((data) => {
    console.log("Submetendo formulário:", data);
    addPlayer.mutate(data.name);
  });

  const onUpdateMaxPoints = maxPointsForm.handleSubmit((data) => {
    updateMaxPoints.mutate(Number(data.maxPoints));
  });

  const handleBackToGame = () => {
    navigate("/classic/play");
  };

  if (isError) {
    console.error("Erro na query de jogadores:", error);
  }

  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
  const hasPoints = sortedPlayers.some(player => player.points > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-4 text-white hover:text-white/80"
        onClick={handleBackToGame}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Jogadores e pontuação</h2>

        <div className="bg-white/10 p-6 rounded-xl mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Pontuação máxima</h3>
          <form onSubmit={onUpdateMaxPoints} className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="rounded-full w-8 h-8 flex items-center justify-center bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => {
                  const current = maxPointsForm.getValues("maxPoints");
                  maxPointsForm.setValue("maxPoints", Math.max(10, Number(current) - 10));
                }}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="10"
                max="1000"
                className="text-center bg-white/10 border-white/20 text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                {...maxPointsForm.register("maxPoints")}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="rounded-full w-8 h-8 flex items-center justify-center bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => {
                  const current = maxPointsForm.getValues("maxPoints");
                  maxPointsForm.setValue("maxPoints", Math.min(1000, Number(current) + 10));
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="submit"
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              Salvar
            </Button>
          </form>
        </div>

        <div className="bg-white/10 p-6 rounded-xl mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Jogadores</h3>
          <div className="space-y-4">
            <AnimatePresence>
              {sortedPlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/10 p-3 rounded space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {hasPoints && index === 0 && <Crown className="h-4 w-4 text-yellow-400" />}
                      <span className="text-white">{player.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePlayer.mutate(player.id)}
                      className="text-white/50 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-white/80">
                      <Award className="h-4 w-4" />
                      <span>{player.points} pts</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/80">
                      <Beer className="h-4 w-4" />
                      <span>{player.drinksCompleted}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/80">
                      <Target className="h-4 w-4" />
                      <span>{player.challengesCompleted}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Adicionar um novo jogador</h3>
          <form onSubmit={onSubmit} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Nome do jogador"
                {...form.register("name")}
                className="w-full bg-white border-0 text-purple-700 placeholder:text-purple-400"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-200 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={addPlayer.isPending}
              className="bg-white/20 hover:bg-white/30"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="text-sm text-white/80 text-center">
          Caso um jogador seja removido a pontuação dele será distribuída igualmente para os jogadores restantes.
        </p>

        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={handleBackToGame}
            className="bg-purple-700 hover:bg-purple-800 text-white border-white/20"
          >
            Voltar ao Jogo
          </Button>
        </div>
      </div>
    </div>
  );
}