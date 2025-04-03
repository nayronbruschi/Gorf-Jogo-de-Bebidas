import { useEffect } from "react";
import { useLocation } from "wouter";
import { GameLayout } from "@/components/GameLayout";
import { PlayerList } from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { auth, updateGameStats } from "@/lib/firebase";

interface Player {
  id: number;
  name: string;
  points?: number;
}

export default function GuessWhoPlayers() {
  const [, setLocation] = useLocation();
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  // Registrar o jogo assim que entrar na página
  useEffect(() => {
    const trackGameOpen = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          await updateGameStats(userId, "Quem sou eu?");
        }
      } catch (error) {
        console.error("[GuessWhoPlayers] Error tracking game:", error);
      }
    };

    trackGameOpen();
  }, []);

  const handleStartGame = () => {
    if (players.length < 2) return;

    try {
      // Salvar os IDs dos jogadores como números
      const playerIds = players.map(p => p.id);
      localStorage.setItem("guessWhoPlayers", JSON.stringify(playerIds));
      setLocation("/guess-who/theme");
    } catch (error) {
      console.error('Erro ao salvar jogadores:', error);
    }
  };

  return (
    <GameLayout title="Quem Sou Eu?">
      <div className="flex flex-col items-center gap-8 p-4">
        <div className="text-center mb-4">
          <div className="bg-purple-950/60 p-4 rounded-full inline-block mb-4">
            <Users className="w-16 h-16 text-white mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 bg-purple-950/60 px-6 py-2 rounded-lg inline-block">Selecione os Jogadores</h2>
          <p className="text-white bg-purple-950/60 px-6 py-2 rounded-lg mt-2 inline-block">
            Escolha pelo menos 2 jogadores para começar
          </p>
        </div>

        <div className="w-full max-w-md">
          <PlayerList />
        </div>

        <Button
          className="w-full max-w-md bg-gorf-green hover:bg-green-700 text-white"
          size="lg"
          onClick={handleStartGame}
          disabled={players.length < 2}
        >
          {players.length < 2 ? "Mínimo 2 jogadores" : "Continuar"}
        </Button>
      </div>
    </GameLayout>
  );
}