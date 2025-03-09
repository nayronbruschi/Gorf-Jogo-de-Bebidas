import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function ClassicStart() {
  const [, navigate] = useLocation();
  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const handleStartGame = async () => {
    try {
      // Limpar pontuações antes de começar
      await apiRequest("POST", "/api/players/reset", {});

      // Definir o primeiro jogador
      await apiRequest("POST", "/api/players/first", {});

      // Atualizar os dados
      await queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/players/current"] });

      // Iniciar o jogo
      navigate("/classic/play");
    } catch (error) {
      console.error('Erro ao iniciar o jogo:', error);
    }
  };

  return (
    <GameLayout title="Modo Clássico">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center max-w-lg">
          <h3 className="text-2xl font-bold text-white mb-4">
            Pronto para começar?
          </h3>
          <p className="text-xl text-white/80">
            Prepare-se para desafios divertidos! Cada jogador terá sua vez de enfrentar um desafio ou beber.
          </p>
          <div className="mt-4 text-white/80">
            {players.length} jogadores prontos!
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleStartGame}
          className="bg-white/20 hover:bg-white/30 text-white text-xl px-8 py-6"
        >
          <Play className="mr-2 h-6 w-6" />
          Iniciar Jogo
        </Button>
      </div>
    </GameLayout>
  );
}
