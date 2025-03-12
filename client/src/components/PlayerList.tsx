import { useCallback } from "react";
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

interface Player {
  id: number;
  name: string;
  points?: number;
}

interface PlayerListProps {
  selectedPlayers?: string[];
  onSelectedPlayersChange?: (players: string[]) => void;
}

export function PlayerList({ selectedPlayers, onSelectedPlayersChange }: PlayerListProps) {
  const { data: players = [] } = useQuery<Player[]>({
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
      await apiRequest("DELETE", `/api/players/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
    },
  });

  const onSubmit = useCallback(form.handleSubmit((data) => {
    addPlayer.mutate(data.name);
  }), [addPlayer, form]);

  const springAnimation = {
    type: "spring",
    stiffness: 500,
    damping: 30,
    mass: 0.8
  };

  return (
    <div className="space-y-4 w-full">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          placeholder="Nome do jogador"
          {...form.register("name")}
          className="bg-white border-0 text-purple-900 placeholder:text-purple-400 flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={addPlayer.isPending}
          className="bg-purple-700 hover:bg-purple-800 min-w-[44px]"
        >
          <UserPlus className="h-4 w-4 text-white" />
        </Button>
      </form>

      <AnimatePresence mode="popLayout">
        {players.map((player) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={springAnimation}
            className="bg-purple-50 p-3 rounded space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-purple-900">{player.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removePlayer.mutate(player.id)}
                className="text-purple-700 hover:text-purple-900"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}