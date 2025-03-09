import { GameLayout } from "@/components/GameLayout";
import { GameCard } from "@/components/GameCard";
import { Dices, CircleDot, MessageSquareQuote } from "lucide-react";

export default function Home() {
  return (
    <GameLayout title="Escolha seu modo de jogo" showPlayers={false}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GameCard
          title="Modo Clássico"
          description="Desafios e perguntas para todos os jogadores beberem conforme as regras."
          icon={<Dices className="h-8 w-8" />}
          href="/classic"
        />
        <GameCard
          title="Roleta"
          description="Gire a roleta e descubra seu destino! Quem será o próximo a beber?"
          icon={<CircleDot className="h-8 w-8" />}
          href="/roulette"
        />
        <GameCard
          title="Verdade ou Desafio"
          description="Escolha entre revelar seus segredos ou enfrentar desafios ousados."
          icon={<MessageSquareQuote className="h-8 w-8" />}
          href="/truth-or-dare"
        />
      </div>
    </GameLayout>
  );
}
