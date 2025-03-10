import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TutorialOverlay {
  onClose: () => void;
}

export function TutorialOverlay({ onClose }: TutorialOverlay) {
  const [currentStep, setCurrentStep] = useState(0);
  const tutorialSteps = [
    {
      target: "#points-settings",
      text: "Clique aqui para ajustar a pontuação máxima do jogo"
    },
    {
      target: "#player-management",
      text: "Clique aqui para gerenciar os jogadores"
    },
    {
      target: "#challenge-actions",
      text: "Escolha se o jogador completou o desafio, bebeu, ou ambos"
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-auto"
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Como jogar</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:text-white/80"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6 mb-8">
            {tutorialSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: currentStep === index ? 1 : 0.5,
                  y: 0
                }}
                className={`p-4 rounded-lg ${
                  currentStep === index
                    ? 'bg-white/20'
                    : 'bg-white/5'
                }`}
              >
                <p className="text-lg">{step.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-white/60">
              Passo {currentStep + 1} de {tutorialSteps.length}
            </span>
            <Button
              onClick={handleNext}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Começar' : 'Próximo'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
