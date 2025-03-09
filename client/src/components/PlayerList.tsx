import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlayerSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Crown, Beer, Target, UserPlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PlayerList() {
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

  const addPlayer = useMutation({
    mutationFn: async (name: string) => {
      await apiRequest("POST", "/api/players", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      form.reset();
      toast({
        title: "Jogador adicionado",
        description: "O jogador foi adicionado com sucesso!",
      });
    },
  });

  const removePlayer = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/players/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    addPlayer.mutate(data.name);
  });

  // Ordenar jogadores por pontuação
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Jogadores</h3>

      <form onSubmit={onSubmit} className="flex gap-2">
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

      <div className="text-sm text-white/60 mb-2">
        Objetivo: {settings?.maxPoints || 100} pontos
      </div>

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
                {index === 0 && <Crown className="h-4 w-4 text-yellow-400" />}
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
  );
}