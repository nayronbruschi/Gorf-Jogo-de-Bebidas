import { useState } from "react";
import { useLocation } from "wouter";
import { GameLayout } from "@/components/GameLayout";
import { PlayerList } from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { PlayerManagementDialog } from "@/components/PlayerManagementDialog";
import { Users } from "lucide-react";

export default function GuessWhoPlayers() {
  const [, setLocation] = useLocation();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const handleStartGame = () => {
    if (selectedPlayers.length < 2) {
      return;
    }
    // Salvar jogadores selecionados no localStorage
    localStorage.setItem("guessWhoPlayers", JSON.stringify(selectedPlayers));
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

        <PlayerList
          selectedPlayers={selectedPlayers}
          onSelectedPlayersChange={setSelectedPlayers}
        />

        <div className="space-y-4 w-full max-w-md">
          <Button
            className="w-full bg-purple-700 hover:bg-purple-800"
            size="lg"
            onClick={() => setShowDialog(true)}
          >
            Gerenciar Jogadores
          </Button>

          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
            onClick={handleStartGame}
            disabled={selectedPlayers.length < 2}
          >
            Continuar
          </Button>
        </div>

        <PlayerManagementDialog
          open={showDialog}
          onOpenChange={setShowDialog}
        />
      </div>
    </GameLayout>
  );
}
