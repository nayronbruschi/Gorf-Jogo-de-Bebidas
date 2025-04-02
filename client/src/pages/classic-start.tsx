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
      <div className="container max-w-2xl mx-auto px-4 pt-8 pb-16">
        {/* Header com badge apenas */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Modo Clássico
          </div>
        </header>

        {/* Seleção de baralhos com design moderno */}
        <div className="mb-10">
          <div className="grid grid-cols-1 gap-4">
            {decks.map((deck) => (
              <motion.button
                key={deck.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleDeckToggle(deck.id)}
                className={`p-5 rounded-xl text-left transition-all duration-200 ${
                  selectedDecks.has(deck.id)
                    ? 'bg-gradient-to-r from-purple-50 to-white shadow-md border-l-4 border-purple-600'
                    : 'bg-gray-50 hover:bg-white hover:shadow-sm border border-gray-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`rounded-full p-3 ${
                    selectedDecks.has(deck.id)
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    <deck.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className={`font-semibold text-lg ${
                      selectedDecks.has(deck.id) ? 'text-purple-900' : 'text-gray-700'
                    }`}>
                      {deck.name}
                    </div>
                    <div className={`text-sm ${
                      selectedDecks.has(deck.id) ? 'text-purple-700' : 'text-gray-500'
                    }`}>
                      {deck.description}
                    </div>
                  </div>
                  <div className="ml-auto">
                    {selectedDecks.has(deck.id) && (
                      <div className="rounded-full bg-purple-100 p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Botão de ação com estilo Apple */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleContinue}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xl px-10 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <Play className="mr-2 h-6 w-6" />
            Continuar
          </Button>
        </div>
      </div>
    </GameLayout>
  );
}