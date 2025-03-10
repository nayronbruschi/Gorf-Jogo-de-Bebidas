import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LayoutGrid, UserPlus } from "lucide-react";
import { cardRules, type Card } from "@/lib/cards-data";
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
    }, 1000);
  };

  const resetDeck = () => {
    setRemainingCards([...cardRules]);
    setCurrentCard(null);
  };

  const handleOpenDialog = () => {
    setShowDialog(true);
  };

  const handleAddPermission = () => {
    if (!currentCard?.specialAction || !playerName.trim()) return;

    const newPermission: SpecialPermission = {
      type: currentCard.specialAction,
      name: playerName.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setSpecialPermissions([...specialPermissions, newPermission]);
    setShowDialog(false);
    setPlayerName("");
  };

  return (
    <GameLayout title="Sueca">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center mb-4">
          <p className="text-white/80">
            Vire uma carta e siga a regra! Restam {remainingCards.length} cartas.
          </p>
        </div>

        <div className="relative w-full max-w-md aspect-[3/4] perspective-1000">
          <AnimatePresence mode="wait">
            {currentCard ? (
              <motion.div
                key="card"
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -180, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full h-full"
              >
                <div className="w-full h-full bg-white rounded-xl p-6 flex flex-col items-center justify-between">
                  <div className="text-4xl font-bold" style={{
                    color: currentCard.suit === "hearts" || currentCard.suit === "diamonds" ? "#e11d48" : "#1e293b"
                  }}>
                    {currentCard.value}
                  </div>

                  <div className="flex-1 flex items-center justify-center text-center p-4">
                    <div className="space-y-4">
                      <currentCard.icon className="w-12 h-12 mx-auto text-purple-600" />
                      <p className="text-xl font-medium text-purple-900">
                        {currentCard.rule}
                      </p>
                    </div>
                  </div>

                  <div className="text-4xl font-bold" style={{
                    color: currentCard.suit === "hearts" || currentCard.suit === "diamonds" ? "#e11d48" : "#1e293b"
                  }}>
                    {currentCard.value}
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
                className="w-full h-full bg-purple-700 rounded-xl flex items-center justify-center"
              >
                <LayoutGrid className="w-24 h-24 text-white/50" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <Button
            size="lg"
            onClick={drawCard}
            disabled={isDrawing || remainingCards.length === 0}
            className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-6 text-xl"
          >
            <LayoutGrid className="mr-2 h-5 w-5" />
            {isDrawing ? "Virando..." : "Virar uma carta"}
          </Button>

          {currentCard?.specialAction && (
            <Button
              size="lg"
              onClick={handleOpenDialog}
              variant="outline"
              className="border-purple-700 text-purple-700 hover:bg-purple-50 px-8 py-6"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Registrar jogador que ganhou a carta
            </Button>
          )}

          {remainingCards.length === 0 && (
            <Button
              size="lg"
              onClick={resetDeck}
              variant="outline"
              className="border-purple-700 text-purple-700 hover:bg-purple-50 px-8 py-6 text-xl"
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
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDialog(false)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleAddPermission}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </GameLayout>
  );
}