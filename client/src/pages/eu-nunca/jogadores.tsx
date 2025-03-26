import { GameLayout } from "@/components/GameLayout";
import { PlayerList } from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Play } from "lucide-react";

export default function EuNuncaJogadores() {
  const [, navigate] = useLocation();
  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const handleContinue = () => {
    navigate("/eu-nunca/jogo");
  };

  return (
    <GameLayout title="">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Quem vai jogar?
          </h3>
          <p className="text-white/80 mb-6">
            Adicione pelo menos 2 jogadores para começar!
          </p>
        </div>

        <PlayerList />

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={players.length < 2}
            className={`px-8 py-6 flex items-center justify-center text-xl ${
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