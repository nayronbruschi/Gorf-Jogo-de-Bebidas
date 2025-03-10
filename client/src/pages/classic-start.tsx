import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { decks } from "@/lib/game-data";
import { motion } from "framer-motion";

export default function ClassicStart() {
  const [, navigate] = useLocation();
  const [selectedDecks, setSelectedDecks] = useState<Set<string>>(new Set(["classic"]));

  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const handleDeckToggle = (deckId: string) => {
    const newSelected = new Set(selectedDecks);
    if (newSelected.has(deckId)) {
      if (newSelected.size > 1) { // Garantir que pelo menos um deck esteja selecionado
        newSelected.delete(deckId);
      }
    } else {
      newSelected.add(deckId);
    }
    setSelectedDecks(newSelected);
  };

  const handleStartGame = async () => {
    try {
      // Limpar pontuações antes de começar
      await apiRequest("POST", "/api/players/reset", {});

      // Definir o primeiro jogador
      await apiRequest("POST", "/api/players/first", {});

      // Atualizar os dados
      await queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/players/current"] });

      // Salvar os decks selecionados no localStorage
      localStorage.setItem("selectedDecks", JSON.stringify(Array.from(selectedDecks)));

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

        <div className="w-full max-w-lg space-y-4">
          <h4 className="text-lg font-semibold text-white text-center">
            Escolha os baralhos de desafios:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {decks.map((deck) => (
              <motion.button
                key={deck.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDeckToggle(deck.id)}
                className={`p-4 rounded-lg text-left transition-colors ${
                  selectedDecks.has(deck.id)
                    ? 'bg-white text-purple-700'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <deck.icon className="h-5 w-5" />
                  <div>
                    <div className="font-semibold">{deck.name}</div>
                    <div className="text-sm opacity-80">{deck.description}</div>
                  </div>
                </div>
              </motion.button>
            ))}
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