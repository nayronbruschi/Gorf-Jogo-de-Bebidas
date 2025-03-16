import { useState, useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Play } from "lucide-react";
import { decks } from "@/lib/game-data";
import { motion } from "framer-motion";
import { auth, updateGameStats } from "@/lib/firebase";

export default function ClassicStart() {
  const [, navigate] = useLocation();
  const [selectedDecks, setSelectedDecks] = useState<Set<string>>(new Set(["classic"]));

  // Registrar o jogo assim que entrar na página
  useEffect(() => {
    const trackGameOpen = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          await updateGameStats(userId, "Modo Clássico");
        }
      } catch (error) {
        console.error("[ClassicStart] Error tracking game:", error);
      }
    };

    trackGameOpen();
  }, []);

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

  const handleContinue = () => {
    // Salvar os decks selecionados no localStorage
    localStorage.setItem("selectedDecks", JSON.stringify(Array.from(selectedDecks)));
    // Ir para a página de seleção de jogadores
    navigate("/classic/players");
  };

  return (
    <GameLayout title="">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center max-w-lg">
          <h3 className="text-2xl font-bold text-white mb-4">
            Escolha os baralhos
          </h3>
          <p className="text-xl text-white/80">
            Selecione os tipos de desafios que você quer incluir no jogo.
          </p>
        </div>

        <div className="w-full max-w-lg space-y-4">
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
          onClick={handleContinue}
          className="bg-purple-900 hover:bg-purple-950 text-white text-xl px-8 py-6 flex items-center justify-center"
        >
          <Play className="mr-2 h-6 w-6" />
          Continuar
        </Button>
      </div>
    </GameLayout>
  );
}