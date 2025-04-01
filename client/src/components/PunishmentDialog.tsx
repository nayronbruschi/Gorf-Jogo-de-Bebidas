import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PunishmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerName: string;
  punishment?: any; // Adicionado para compatibilidade com a Roleta
  punishmentDrinks?: number; // Adicionado para compatibilidade com a Roleta
  drinkText?: string; // Adicionado para compatibilidade com a Roleta
  drinkTextPlural?: string; // Adicionado para compatibilidade com a Roleta
  onAcceptPunishment: () => void;
  onGenerateNewPunishment: () => void;
}

const punishmentChallenges = [
  { text: "Faça 10 polichinelos", icon: null },
  { text: "Imite alguém do grupo", icon: null },
  { text: "Dance por 30 segundos", icon: null },
  { text: "Conte uma história engraçada", icon: null },
  { text: "Faça uma mímica", icon: null },
  { text: "Cante uma música", icon: null },
  { text: "Faça 5 flexões", icon: null },
  { text: "Imite um animal por 1 minuto", icon: null },
  { text: "Conte uma piada", icon: null },
  { text: "Faça uma pose de yoga", icon: null },
  { text: "Faça uma imitação de um famoso", icon: null },
  { text: "Invente uma rima com o nome de outro jogador", icon: null },
  { text: "Faça uma dança engraçada", icon: null },
  { text: "Conte um segredo (nada muito pessoal)", icon: null },
  { text: "Faça uma careta engraçada", icon: null },
  { text: "Tire uma selfie engraçada", icon: null },
  { text: "Faça uma declaração dramática", icon: null },
  { text: "Invente um comercial de TV", icon: null },
  { text: "Desenhe algo de olhos fechados", icon: null },
  { text: "Imite um personagem de videogame", icon: null },
  { text: "Faça malabarismo com 3 objetos", icon: null },
  { text: "Crie uma música com objetos da mesa", icon: null },
  { text: "Faça uma dança robótica", icon: null },
  { text: "Conte uma história em 30 segundos", icon: null },
  { text: "Imite três emojis", icon: null },
  { text: "Faça uma pose de super-herói", icon: null },
  { text: "Invente um trocadilho", icon: null },
  { text: "Faça uma imitação de bebê", icon: null },
  { text: "Crie um slogan para um produto imaginário", icon: null },
  { text: "Faça uma mímica de profissão", icon: null },
  { text: "Imite um apresentador de TV", icon: null },
  { text: "Faça uma pose de modelo", icon: null },
  { text: "Crie uma coreografia de 10 segundos", icon: null },
  { text: "Invente um nome para uma banda", icon: null },
  { text: "Faça uma imitação de alienígena", icon: null },
  { text: "Crie um rap sobre o jogador à sua direita", icon: null },
  { text: "Faça uma propaganda de venda", icon: null },
  { text: "Imite um YouTuber famoso", icon: null },
  { text: "Faça uma pose de estátua por 30 segundos", icon: null },
  { text: "Invente um passo de dança", icon: null },
];

export function PunishmentDialog({
  open,
  onOpenChange,
  playerName,
  punishment: externalPunishment,
  punishmentDrinks: externalPunishmentDrinks,
  drinkText: externalDrinkText,
  drinkTextPlural: externalDrinkTextPlural,
  onAcceptPunishment,
  onGenerateNewPunishment,
}: PunishmentDialogProps) {
  const [internalPunishment, setInternalPunishment] = useState(
    punishmentChallenges[Math.floor(Math.random() * punishmentChallenges.length)]
  );
  
  // Use props fornecidas ou valores padrão
  const punishment = externalPunishment || internalPunishment;
  const punishmentDrinks = externalPunishmentDrinks || 1;
  const drinkText = externalDrinkText || "gole";
  const drinkTextPlural = externalDrinkTextPlural || "Goles";


  const handleAcceptPunishment = () => {
    onAcceptPunishment();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl text-purple-900">
            Se recusando a beber, {playerName}?
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-center text-2xl font-bold text-purple-700">
            Que coisa feia!
          </p>
          <p className="text-center text-xl text-purple-900">
            Por isso você deve:
          </p>
          <div className="bg-purple-50 p-6 rounded-lg text-center">
            {/* Placeholder for icon - needs proper implementation */}
            <p className="text-purple-700 text-2xl font-bold">
              {punishment.text}
            </p>
          </div>
          <div className="text-center text-sm text-purple-600">
            {drinkTextPlural} acumulados neste desafio: {punishmentDrinks}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleAcceptPunishment}
              className="bg-gorf-green hover:bg-green-700 text-white hover:text-white text-xl py-6"
            >
              Fez o desafio
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setInternalPunishment(
                  punishmentChallenges[Math.floor(Math.random() * punishmentChallenges.length)]
                );
                onGenerateNewPunishment();
              }}
              className="bg-white text-purple-700 hover:bg-gorf-green hover:text-white border-purple-700"
            >
              Beba mais um {drinkText} para gerar outro desafio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}