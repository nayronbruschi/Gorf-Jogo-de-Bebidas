import { useState, useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { auth, updateGameStats } from "@/lib/firebase";

export default function SpinBottle() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);

  // Registrar o jogo assim que entrar na página
  useEffect(() => {
    const trackGameOpen = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          await updateGameStats(userId, "Garrafa Giratória");
        }
      } catch (error) {
        console.error("[SpinBottle] Error tracking game:", error);
      }
    };

    trackGameOpen();
  }, []);

  const spinBottle = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    const spins = 5 + Math.random() * 5; // Entre 5 e 10 voltas completas
    const newRotation = rotation + (spins * 360) + Math.random() * 360;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
    }, 3000);
  };

  // Funções para interação touch/mouse
  const handleDragStart = (event: React.MouseEvent | React.TouchEvent) => {
    if (isSpinning) return;

    setIsDragging(true);
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    setStartAngle(Math.atan2(clientY - window.innerHeight/2, clientX - window.innerWidth/2));
  };

  const handleDragMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || isSpinning) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const currentAngle = Math.atan2(clientY - window.innerHeight/2, clientX - window.innerWidth/2);
    const angleDiff = (currentAngle - startAngle) * (180/Math.PI);
    setRotation(prev => prev + angleDiff);
    setStartAngle(currentAngle);
  };

  const handleDragEnd = () => {
    if (isSpinning) return;

    setIsDragging(false);
    if (Math.abs(rotation % 360) > 50) {
      spinBottle();
    }
  };

  return (
    <GameLayout title="Garrafa Giratória">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center mb-4">
          <p className="text-white/80">
            Gire a garrafa e veja quem será o escolhido!
          </p>
        </div>

        <div 
          className="relative w-full max-w-md aspect-square"
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {/* Container estático com o círculo roxo */}
          <div className="absolute inset-0 rounded-full bg-purple-900/90" />

          {/* Container da seta que vai girar */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            animate={{ rotate: rotation }}
            transition={{
              type: "spring",
              duration: isSpinning ? 3 : 0.2,
              bounce: isSpinning ? 0.2 : 0
            }}
          >
            <img
              src="https://firebasestorage.googleapis.com/v0/b/gorf-o-jogo.firebasestorage.apps/o/icone-fleche-droite-violet-2.png?alt=media&token=82a5ffce-35ee-4eca-a9b9-48b22aa77799"
              alt="Seta"
              className="w-3/4 h-3/4 object-contain"
              draggable="false"
            />
          </motion.div>
        </div>

        <Button
          size="lg"
          onClick={spinBottle}
          disabled={isSpinning}
          className="bg-purple-900 hover:bg-purple-950 text-white hover:text-white px-8 py-6 text-xl"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          {isSpinning ? "Girando..." : "Girar Garrafa"}
        </Button>
      </div>
    </GameLayout>
  );
}