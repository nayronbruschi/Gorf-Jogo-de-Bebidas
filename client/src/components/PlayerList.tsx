import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlayerSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PlayerList() {
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

      <AnimatePresence>
        {players.map((player) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between bg-white/10 p-2 rounded"
          >
            <span className="text-white">{player.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removePlayer.mutate(player.id)}
              className="text-white/50 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
