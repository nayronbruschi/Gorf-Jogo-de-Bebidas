import { useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { GameCard } from "@/components/GameCard";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { games } from "@/lib/game-data";

export default function GameModes() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Limpar dados ao entrar na página de modos
  useEffect(() => {
    const cleanupData = async () => {
      try {
        // Não limpar localStorage nem dados se estiver vindo da página de vencedor
        const fromWinner = window.location.pathname.includes('winner');
        if (!fromWinner) {
          // Limpar localStorage
          localStorage.clear();

          // Limpar todos os jogadores
          await apiRequest("DELETE", "/api/players/all", {});

          // Invalidar queries para forçar recarregamento dos dados
          await queryClient.invalidateQueries();
        }
      } catch (error) {
        console.error('Erro ao limpar dados:', error);
      }
    };

    cleanupData();
  }, []);

  return (
    <GameLayout title="Escolha seu modo de jogo">
      <div className="grid grid-cols-1 gap-6">
        {games.map((game) => (
          <GameCard
            key={game.id}
            title={game.name}
            description={game.description}
            icon={game.icon}
            href={game.route}
          />
        ))}
      </div>
    </GameLayout>
  );
}