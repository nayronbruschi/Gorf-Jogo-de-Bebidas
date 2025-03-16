import { GameLayout } from "@/components/GameLayout";
import { PlayerList } from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Play } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function ClassicPlayers() {
  const [, navigate] = useLocation();
  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const startGame = useMutation({
    mutationFn: async () => {
      // Limpar pontuações antes de começar
      await apiRequest("POST", "/api/players/reset", {});
      // Definir o primeiro jogador
      await apiRequest("POST", "/api/players/first", {});
    },
    onSuccess: async () => {
      // Atualizar os dados
      await queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/players/current"] });
      // Iniciar o jogo
      navigate("/classic/play");
    }
  });

  return (
    <GameLayout title="">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <p className="text-white/80 mb-6">
            Adicione pelo menos 2 jogadores para começar!
          </p>
        </div>

        <PlayerList />

        <div className="flex justify-center">
          <Button
              size="lg"
              onClick={() => startGame.mutate()}
              disabled={players.length < 2}
              className={`px-8 py-6 flex items-center justify-center text-2xl ${
                players.length >= 2 
                  ? "bg-purple-900 hover:bg-purple-950 text-white"
                  : "bg-white/20 hover:bg-white/30 text-white"
              }`}
            >
              <Play className="mr-2 h-6 w-6" />
              {players.length < 2 
                ? "Mínimo 2 jogadores"
                : "Vamos começar!"}
            </Button>
        </div>
      </div>
    </GameLayout>
  );
}