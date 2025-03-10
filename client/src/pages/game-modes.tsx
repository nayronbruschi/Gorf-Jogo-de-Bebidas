import { useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { GameCard } from "@/components/GameCard";
import { Dices, CircleDot, MessageSquareQuote } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function GameModes() {
  // Limpar dados ao entrar na página de modos
  useEffect(() => {
    const cleanupData = async () => {
      try {
        // Limpar localStorage
        localStorage.clear();

        // Limpar todos os jogadores
        await apiRequest("DELETE", "/api/players/all", {});

        // Invalidar queries para forçar recarregamento dos dados
        await queryClient.invalidateQueries();
      } catch (error) {
        console.error('Erro ao limpar dados:', error);
      }
    };

    cleanupData();
  }, []);

  return (
    <GameLayout title="Escolha seu modo de jogo">
      <div className="grid grid-cols-1 gap-6">
        <GameCard
          title="Gorf"
          description="Esse modo é para começar ou terminar o rolê. Quer beber muito? Então clica aqui!"
          icon={<CircleDot className="h-8 w-8 text-purple-500" />}
          href="/roulette"
        />
        <GameCard
          title="Modo Clássico"
          description="Desafios e perguntas para todos os jogadores beberem conforme as regras."
          icon={<Dices className="h-8 w-8 text-purple-500" />}
          href="/classic"
        />
        <GameCard
          title="Verdade ou Desafio"
          description="Escolha entre revelar seus segredos ou enfrentar desafios ousados."
          icon={<MessageSquareQuote className="h-8 w-8 text-purple-500" />}
          href="/truth-or-dare"
        />
      </div>
    </GameLayout>
  );
}