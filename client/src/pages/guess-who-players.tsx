import { useState } from "react";
import { useLocation } from "wouter";
import { GameLayout } from "@/components/GameLayout";
import { PlayerList } from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function GuessWhoPlayers() {
  const [, setLocation] = useLocation();
  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const handleStartGame = () => {
    if (players.length < 2) return;

    // Salvar os IDs dos jogadores no localStorage
    localStorage.setItem("guessWhoPlayers", JSON.stringify(players.map(p => p.id)));
    setLocation("/guess-who/theme");
  };

  return (
    <GameLayout title="Quem Sou Eu?">
      <div className="flex flex-col items-center gap-8 p-4">
        <div className="text-center mb-4">
          <Users className="w-16 h-16 text-white mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Selecione os Jogadores</h2>
          <p className="text-white/80">
            Escolha pelo menos 2 jogadores para começar
          </p>
        </div>

        <div className="w-full max-w-md">
          <PlayerList /> {/*Retained this line as it's in the edited code and is likely needed despite original code having different implementation*/}
        </div>

        <Button
          className="w-full max-w-md bg-purple-700 hover:bg-purple-800 text-white"
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