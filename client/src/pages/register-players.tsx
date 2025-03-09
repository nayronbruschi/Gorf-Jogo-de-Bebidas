import { GameLayout } from "@/components/GameLayout";
import { PlayerList } from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function RegisterPlayers() {
  const [, navigate] = useLocation();
  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  return (
    <GameLayout title="Cadastro de Jogadores" showPlayers={false}>
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <p className="text-white/80 mb-6">
            Adicione os jogadores que vão participar da brincadeira!
          </p>
        </div>

        <PlayerList />

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/game-modes")}
            disabled={players.length < 2}
            className="bg-white/20 hover:bg-white/30 text-white px-8"
          >
            {players.length < 2 
              ? "Mínimo 2 jogadores"
              : "Começar o Jogo!"}
          </Button>
        </div>
      </div>
    </GameLayout>
  );
}
