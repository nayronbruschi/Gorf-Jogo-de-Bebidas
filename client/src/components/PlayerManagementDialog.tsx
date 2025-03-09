import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlayerSchema } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Crown, Beer, Target, UserPlus, X } from "lucide-react";
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

  const form = useForm({
    resolver: zodResolver(insertPlayerSchema),
    defaultValues: {
      name: "",
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

  // Ordenar jogadores por pontuação
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
  const hasPoints = sortedPlayers.some(player => player.points > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-full h-full m-0 p-8 bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white mb-8">
              Gerenciar Jogadores
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mb-8">
            <AnimatePresence>
              {sortedPlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/10 p-3 rounded space-y-2 w-[80%] mx-auto"
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

          <form onSubmit={onSubmit} className="flex gap-2 mb-8 w-[80%] mx-auto">
            <Input
              placeholder="Nome do jogador"
              {...form.register("name")}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 w-[80%]"
            >
              Voltar ao Jogo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}