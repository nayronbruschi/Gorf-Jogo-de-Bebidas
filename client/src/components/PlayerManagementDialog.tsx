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
      toast({
        title: "Jogador adicionado",
        description: "Um novo jogador foi adicionado com sucesso.",
      });
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
      <DialogContent className="mx-auto max-w-md w-full h-[90vh] overflow-y-auto bg-white rounded-lg">
        {/* Botão de fechar já existe no DialogContent, não precisamos adicionar outro */}

        <div className="max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Jogadores e pontuação</h2>

          {/* Pontuação Máxima */}
          <div className="border border-gray-200 bg-gray-50 p-5 rounded-xl mb-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">Pontuação máxima</h3>
            <form onSubmit={onUpdateMaxPoints} className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="rounded-full w-8 h-8 flex items-center justify-center bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
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
                  className="text-center bg-white border border-gray-200 text-gray-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  {...maxPointsForm.register("maxPoints")}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="rounded-full w-8 h-8 flex items-center justify-center bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
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
                className="bg-[#326800] hover:bg-green-800 text-white"
              >
                Salvar
              </Button>
            </form>
          </div>

          {/* Lista de Jogadores */}
          <div className="border border-gray-200 bg-gray-50 p-5 rounded-xl mb-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">Jogadores</h3>
            <div className="space-y-3">
              <AnimatePresence>
                {sortedPlayers.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {hasPoints && index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                        <span className="text-gray-800 font-medium">{player.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePlayer.mutate(player.id)}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Award className="h-4 w-4 text-purple-600" />
                        <span>{player.points} pts</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Beer className="h-4 w-4 text-amber-500" />
                        <span>{player.drinksCompleted}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Target className="h-4 w-4 text-green-600" />
                        <span>{player.challengesCompleted}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Adicionar Jogador */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">Adicionar um novo jogador</h3>
            <form onSubmit={onSubmit} className="flex gap-2">
              <Input
                placeholder="Nome do jogador"
                {...form.register("name")}
                className="flex-1 bg-white border border-gray-300 text-gray-800 placeholder:text-gray-400 focus-visible:ring-purple-500"
              />
              <Button
                type="submit"
                size="icon"
                disabled={addPlayer.isPending}
                className="bg-[#326800] hover:bg-green-800 text-white"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <p className="text-sm text-gray-500 text-center mt-6">
            Caso um jogador seja removido a pontuação dele será distribuída igualmente para os jogadores restantes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}