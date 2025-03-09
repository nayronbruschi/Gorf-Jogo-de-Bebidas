import { GameLayout } from "@/components/GameLayout";
import { PlayerList } from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Play } from "lucide-react";

export default function ClassicPlayers() {
  const [, navigate] = useLocation();
  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  return (
    <GameLayout title="Modo Clássico" showPlayers={false}>
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <p className="text-white/80 mb-6">
            Adicione pelo menos 3 jogadores para começar!
          </p>
        </div>

        <PlayerList />

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/classic/start")}
            disabled={players.length < 3}
            className="bg-white/20 hover:bg-white/30 text-white px-8 py-6"
          >
            <Play className="mr-2 h-6 w-6" />
            {players.length < 3 
              ? "Mínimo 3 jogadores"
              : "Vamos começar!"}
          </Button>
        </div>
      </div>
    </GameLayout>
  );
}
