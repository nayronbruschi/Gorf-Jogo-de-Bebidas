import { useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlayerSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
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

  return (
    <div className="space-y-4 w-full">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          placeholder="Nome do jogador"
          {...form.register("name")}
          className="bg-white border border-gray-300 text-purple-900 placeholder:text-purple-400 flex-1 focus-visible:ring-purple-500"
        />
        <Button
          type="submit"
          size="icon"
          disabled={addPlayer.isPending}
          className="bg-gorf-green hover:bg-green-700 min-w-[44px]"
        >
          <UserPlus className="h-4 w-4 text-white" />
        </Button>
      </form>

      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="bg-purple-50 p-3 rounded"
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
          </div>
        ))}
      </div>
    </div>
  );
}