import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PunishmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerName: string;
  punishment: { text: string; icon: any } | null;
  punishmentDrinks: number;
  drinkText: string;
  drinkTextPlural: string;
  onAcceptPunishment: () => void;
  onGenerateNewPunishment: () => void;
}

export function PunishmentDialog({
  open,
  onOpenChange,
  playerName,
  punishment,
  punishmentDrinks,
  drinkText,
  drinkTextPlural,
  onAcceptPunishment,
  onGenerateNewPunishment
}: PunishmentDialogProps) {
  if (!punishment) return null;

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
            <punishment.icon className="h-12 w-12 mx-auto mb-4 text-purple-700" />
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
              className="bg-purple-900 hover:bg-purple-950 text-white hover:text-white text-xl py-6"
            >
              Fez o desafio
            </Button>
            <Button
              variant="ghost"
              onClick={onGenerateNewPunishment}
              className="text-purple-700 hover:text-purple-900"
            >
              Beba mais um {drinkText} para gerar outro desafio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}