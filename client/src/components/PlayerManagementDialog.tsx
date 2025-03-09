import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlayerSchema } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Crown, Beer, Target, UserPlus, X, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlayerManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlayerManagementDialog({ open, onOpenChange }: PlayerManagementDialogProps) {
  const { toast } = useToast();
  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const form = useForm({
    resolver: zodResolver(insertPlayerSchema),
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
      await apiRequest("POST", "/api/players", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      form.reset();
    },
  });

  const updateMaxPoints = useMutation({
    mutationFn: async (maxPoints: number) => {
      await apiRequest("PATCH", "/api/settings", { maxPoints });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Pontuação máxima atualizada",
        description: "A nova pontuação máxima foi salva com sucesso.",
      });
    },
  });

  const removePlayer = useMutation({
    mutationFn: async (id: number) => {
      const player = players.find(p => p.id === id);
      if (!player) return;

      // Distribuir pontos entre os jogadores restantes
      const remainingPlayers = players.filter(p => p.id !== id);
      if (remainingPlayers.length > 0 && player.points > 0) {
        const pointsPerPlayer = Math.floor(player.points / remainingPlayers.length);
        if (pointsPerPlayer > 0) {
          // Atualizar pontos dos jogadores restantes
          for (const p of remainingPlayers) {
            await apiRequest("PATCH", `/api/players/${p.id}/points`, {
              points: pointsPerPlayer,
              type: "challenge"
            });
          }
        }
      }

      // Remover o jogador
      await apiRequest("DELETE", `/api/players/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Jogador removido",
        description: "Os pontos foram distribuídos entre os jogadores restantes.",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    addPlayer.mutate(data.name);
  });

  const onUpdateMaxPoints = maxPointsForm.handleSubmit((data) => {
    updateMaxPoints.mutate(Number(data.maxPoints));
  });

  // Ordenar jogadores por pontuação
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
  const hasPoints = sortedPlayers.some(player => player.points > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-full h-full m-0 overflow-y-auto bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="absolute right-4 top-4">
          <DialogClose className="h-10 w-10 text-white hover:text-white/80">
            <X className="h-6 w-6" />
          </DialogClose>
        </div>

        <div className="max-w-3xl mx-auto p-8">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Jogadores e pontuação</h2>

          {/* Pontuação Máxima */}
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

          {/* Lista de Jogadores */}
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

          {/* Adicionar Jogador */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Adicionar um novo jogador</h3>
            <form onSubmit={onSubmit} className="flex gap-2">
              <Input
                placeholder="Nome do jogador"
                {...form.register("name")}
                className="flex-1 bg-white border-0 text-purple-700 placeholder:text-purple-400"
              />
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

          <div className="mt-8">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Voltar ao Jogo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}