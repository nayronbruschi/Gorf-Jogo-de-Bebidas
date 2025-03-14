import { useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { GameCard } from "@/components/GameCard";
import { CircleDot, Brain, Hand, Wine, Coins, LayoutGrid, GamepadIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

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
        <GameCard
          title="Gorf"
          description="Esse modo é para começar ou terminar o rolê. Quer beber muito? Então clica aqui!"
          icon={CircleDot}
          href="/roulette"
        />
        <GameCard
          title="Modo Clássico"
          description="Desafios e perguntas para todos os jogadores beberem conforme as regras."
          icon={GamepadIcon}
          href="/classic"
        />
        <GameCard
          title="Quem Sou Eu?"
          description="Descubra qual personagem, animal ou objeto você é fazendo perguntas!"
          icon={Brain}
          href="/guess-who/players"
        />
        <GameCard
          title="Toque na Sorte"
          description="Toque na tela e veja quem será o escolhido pelo destino!"
          icon={Hand}
          href="/touch-game"
        />
        <GameCard
          title="Garrafa Giratória"
          description="Gire a garrafa e descubra quem será o próximo a beber!"
          icon={Wine}
          href="/spin-bottle"
        />
        <GameCard
          title="Cara ou Coroa"
          description="Deixe a sorte decidir quem vai beber!"
          icon={Coins}
          href="/coin-flip"
        />
        <GameCard
          title="Sueca"
          description="Cada carta tem sua regra. Quem será o próximo a beber?"
          icon={LayoutGrid}
          href="/cards"
        />
      </div>
    </GameLayout>
  );
}