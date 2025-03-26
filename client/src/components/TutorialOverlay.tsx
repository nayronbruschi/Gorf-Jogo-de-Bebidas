import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TutorialOverlayProps {
  onClose: () => void;
  children?: React.ReactNode;
}

export function TutorialOverlay({ onClose, children }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const tutorialSteps = [
    {
      target: "#points-settings",
      title: "Ajuste a Pontuação",
      text: "Configure quantos pontos são necessários para vencer o jogo através do botão 'alterar' abaixo do objetivo.",
      image: (
        <svg className="w-full h-32 mb-4" viewBox="0 0 300 60">
          <rect x="20" y="10" width="260" height="40" rx="8" fill="#F3E8FF" stroke="#7E22CE" strokeWidth="2"/>
          <text x="40" y="35" fill="#581C87" fontSize="14">Objetivo: 100 pontos</text>
          <text x="180" y="35" fill="#7E22CE" fontSize="14" textDecoration="underline">alterar &gt;</text>
        </svg>
      )
    },
    {
      target: "#player-management",
      title: "Gerencie os Jogadores",
      text: "Acesse o ícone de jogadores no canto superior direito do ranking para adicionar, remover ou ver as estatísticas de cada jogador.",
      image: (
        <svg className="w-full h-32 mb-4" viewBox="0 0 300 80">
          <rect x="20" y="10" width="260" height="60" rx="8" fill="#F3E8FF" stroke="#7E22CE" strokeWidth="2"/>
          <text x="40" y="40" fill="#581C87" fontSize="16" fontWeight="bold">Ranking</text>
          <g transform="translate(225, 25)">
            <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z M15.75 4.37a4 4 0 0 1 2.25 3.6v.03a4 4 0 0 1-1.5 3M20.25 10.37a4 4 0 0 1 2.25 3.6v.03c0 2-3 3-4.5 3" 
              stroke="#7E22CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </g>
        </svg>
      )
    },
    {
      target: "#challenge-actions",
      title: "Ações do Jogador",
      text: "Na vez de cada jogador, escolha se ele completou o desafio, bebeu os goles indicados, ou ambos! Os pontos serão somados automaticamente.",
      image: (
        <svg className="w-full h-32 mb-4" viewBox="0 0 300 100">
          <rect x="30" y="10" width="240" height="35" rx="8" fill="#F3E8FF" stroke="#7E22CE" strokeWidth="2"/>
          <text x="50" y="32" fill="#581C87" fontSize="14">Completou o desafio</text>
          <text x="200" y="32" fill="#7E22CE" fontSize="14">+5pts</text>
          <rect x="30" y="55" width="240" height="35" rx="8" fill="#F3E8FF" stroke="#7E22CE" strokeWidth="2"/>
          <text x="50" y="77" fill="#581C87" fontSize="14">Bebeu 5 goles</text>
          <text x="200" y="77" fill="#7E22CE" fontSize="14">+5pts</text>
        </svg>
      )
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
            {children ? (
              <div className="p-4 rounded-lg bg-purple-50 border-2 border-purple-700">
                {children}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 rounded-lg bg-purple-50 border-2 border-purple-700"
                >
                  <div className="bg-white rounded-lg p-2 mb-4 shadow-sm">
                    {tutorialSteps[currentStep].image}
                  </div>
                  <h4 className="font-semibold text-purple-900 mb-2">{tutorialSteps[currentStep].title}</h4>
                  <p className="text-gray-700">{tutorialSteps[currentStep].text}</p>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          <div className="flex justify-between items-center">
            {children ? (
              <Button
                onClick={onClose}
                className="bg-purple-700 hover:bg-purple-800 text-white w-full"
              >
                Entendi, vamos jogar!
              </Button>
            ) : (
              <>
                <span className="text-sm text-gray-500">
                  Passo {currentStep + 1} de {tutorialSteps.length}
                </span>
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="text-white bg-purple-700 hover:bg-purple-800 border-purple-700"
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
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}