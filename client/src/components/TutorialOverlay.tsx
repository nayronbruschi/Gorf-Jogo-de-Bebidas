import { useState } from "react";
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
      title: "Ajuste a Pontuação",
      text: "Configure quantos pontos são necessários para vencer o jogo através do botão 'alterar' abaixo do objetivo."
    },
    {
      target: "#player-management",
      title: "Gerencie os Jogadores",
      text: "Acesse o ícone de jogadores no canto superior direito do ranking para adicionar, remover ou ver as estatísticas de cada jogador."
    },
    {
      target: "#challenge-actions",
      title: "Ações do Jogador",
      text: "Na vez de cada jogador, escolha se ele completou o desafio, bebeu os goles indicados, ou ambos! Os pontos serão somados automaticamente."
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
        <div className="max-w-lg w-full bg-white rounded-xl p-6">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-purple-900">Como jogar</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-purple-700 hover:text-purple-800"
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
                    ? 'bg-purple-50 border-2 border-purple-700'
                    : 'bg-gray-50'
                }`}
              >
                <h4 className="font-semibold text-purple-900 mb-2">{step.title}</h4>
                <p className="text-gray-700">{step.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Passo {currentStep + 1} de {tutorialSteps.length}
            </span>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="text-purple-700 border-purple-700 hover:bg-purple-50"
                >
                  Voltar
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-purple-700 hover:bg-purple-800 text-white"
              >
                {currentStep === tutorialSteps.length - 1 ? 'Começar' : 'Próximo'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}