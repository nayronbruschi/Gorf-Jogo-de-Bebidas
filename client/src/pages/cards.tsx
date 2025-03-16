import { useState, useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LayoutGrid, UserPlus, CheckSquare } from "lucide-react";
import { cardRules, type Card } from "@/lib/cards-data";
import { auth, updateGameStats } from "@/lib/firebase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

interface SpecialPermission {
  type: "bathroom" | "finger";
  name: string;
  timestamp: string;
}

export default function Cards() {
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [remainingCards, setRemainingCards] = useState([...cardRules]);
  const [showDialog, setShowDialog] = useState(false);
  const [specialPermissions, setSpecialPermissions] = useState<SpecialPermission[]>([]);
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    const trackGameOpen = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          await updateGameStats(userId, "Sueca");
        }
      } catch (error) {
        console.error("[Cards] Error tracking game:", error);
      }
    };

    trackGameOpen();
  }, []);

  const drawCard = () => {
    if (isDrawing || remainingCards.length === 0) return;

    setIsDrawing(true);
    setCurrentCard(null);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * remainingCards.length);
      const drawnCard = remainingCards[randomIndex];
      const newRemainingCards = [...remainingCards];
      newRemainingCards.splice(randomIndex, 1);

      setCurrentCard(drawnCard);
      setRemainingCards(newRemainingCards);
      setIsDrawing(false);
    }, 600);
  };

  const handleCardClick = () => {
    if (!isDrawing && remainingCards.length > 0) {
      drawCard();
    }
  };

  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case "hearts": return "♥";
      case "diamonds": return "♦";
      case "clubs": return "♣";
      case "spades": return "♠";
      default: return "";
    }
  };

  const handleUseCard = () => {
    if (currentCard) {
      const newRemainingCards = remainingCards.filter(
        card => !(card.suit === currentCard.suit && card.value === currentCard.value)
      );
      setRemainingCards(newRemainingCards);
      setCurrentCard(null);
      setShowDialog(false);
      setPlayerName("");
    }
  };

  return (
    <GameLayout title="">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center mb-4">
          <p className="text-white/80">
            Vire uma carta e siga a regra! Restam {remainingCards.length} cartas.
          </p>
        </div>

        {/* Carta com funcionalidade de clique */}
        <div 
          className="relative w-full max-w-md aspect-[3/4] perspective-1000 cursor-pointer mb-4"
          onClick={handleCardClick}
        >
          <AnimatePresence>
            {currentCard ? (
              <motion.div
                key="card"
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -180, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full h-full"
              >
                <div className="w-full h-full bg-white rounded-xl p-6 flex flex-col items-center justify-between relative">
                  <div className="absolute top-4 left-4 text-4xl font-bold" style={{
                    color: currentCard.suit === "hearts" || currentCard.suit === "diamonds" ? "#e11d48" : "#1e293b"
                  }}>
                    {currentCard.value}
                    <span className="ml-1">{getSuitSymbol(currentCard.suit)}</span>
                  </div>

                  <div className="flex-1 flex items-center justify-center text-center p-4">
                    <div className="space-y-4">
                      <currentCard.icon className="w-12 h-12 mx-auto text-purple-600" />
                      <p className="text-xl font-medium text-purple-900">
                        {currentCard.rule}
                      </p>
                      {currentCard.specialAction && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDialog(true);
                          }}
                          variant="outline"
                          className="bg-purple-900 text-white hover:bg-white hover:text-purple-900 hover:border-purple-900 border-2"
                        >
                          <UserPlus className="mr-2 h-5 w-5" />
                          Registrar jogador
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-4 right-4 text-4xl font-bold" style={{
                    color: currentCard.suit === "hearts" || currentCard.suit === "diamonds" ? "#e11d48" : "#1e293b"
                  }}>
                    {currentCard.value}
                    <span className="ml-1">{getSuitSymbol(currentCard.suit)}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ rotateY: -180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 180, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full h-full bg-purple-900 rounded-xl flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-purple-800/50 pattern-grid-lg"></div>
                <LayoutGrid className="w-24 h-24 text-white/50 relative z-10" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Botões movidos para baixo da carta */}
        <div className="flex flex-col gap-4 items-center">
          <Button
            size="lg"
            onClick={drawCard}
            disabled={isDrawing || remainingCards.length === 0}
            className="bg-purple-900 hover:bg-purple-950 text-white px-8 py-6 text-xl"
          >
            <LayoutGrid className="mr-2 h-5 w-5" />
            {isDrawing ? "Virando..." : "Virar uma carta"}
          </Button>

          {remainingCards.length === 0 && (
            <Button
              size="lg"
              onClick={() => setRemainingCards([...cardRules])}
              variant="outline"
              className="border-purple-900 text-purple-900 hover:bg-purple-50 px-8 py-6 text-xl"
            >
              Embaralhar
            </Button>
          )}
        </div>

        {/* Lista de permissões especiais */}
        {specialPermissions.length > 0 && (
          <div className="w-full max-w-md mt-8">
            <h3 className="text-xl font-semibold text-white mb-4">Permissões Especiais:</h3>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-2">
              {specialPermissions.map((permission, index) => (
                <div key={index} className="text-white flex justify-between items-center">
                  <span>
                    {permission.name} - {permission.type === "bathroom" ? "🚽 Banheiro" : "👆 Dedinho"}
                  </span>
                  <span className="text-sm opacity-75">{permission.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dialog para adicionar permissão */}
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {currentCard?.specialAction === "bathroom" ? "Permissão para Banheiro" : "Permissão para Dedinho"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Digite o nome da pessoa que recebeu a permissão:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nome do jogador"
              className="my-4"
            />
            <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
              <AlertDialogCancel
                className="sm:w-full"
                onClick={() => {
                  setShowDialog(false);
                  setPlayerName("");
                }}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                className="sm:w-full bg-purple-900 text-white hover:bg-purple-800"
                onClick={() => {
                  if (!currentCard?.specialAction || !playerName.trim()) return;

                  const newPermission: SpecialPermission = {
                    type: currentCard.specialAction,
                    name: playerName.trim(),
                    timestamp: new Date().toLocaleTimeString()
                  };

                  setSpecialPermissions([...specialPermissions, newPermission]);
                  setShowDialog(false);
                  setPlayerName("");
                }}
              >
                Registrar Permissão
              </AlertDialogAction>
              <AlertDialogAction
                className="sm:w-full bg-green-700 text-white hover:bg-green-600"
                onClick={handleUseCard}
              >
                <CheckSquare className="mr-2 h-5 w-5" />
                Usou a carta
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </GameLayout>
  );
}