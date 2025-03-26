import { useState, useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, Camera, RefreshCcw } from "lucide-react";
import { auth, updateGameStats } from "@/lib/firebase";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageUploader } from "@/components/ImageUploader";
import { useToast } from "@/hooks/use-toast";

export default function SpinBottle() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [bottleImage, setBottleImage] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Carrega a imagem personalizada ou a padrão
  useEffect(() => {
    const loadBottleImage = async () => {
      try {
        const response = await fetch('/api/bottle-image');
        if (response.ok) {
          const data = await response.json();
          setBottleImage(data.url);
          
          // Pré-carregar a imagem
          const img = new Image();
          img.src = data.url;
          img.onload = () => setImageLoaded(true);
        } else {
          console.error('Erro ao buscar imagem da garrafa');
          // Usar imagem padrão em caso de erro
          setBottleImage("/api/images/default-bottle.webp");
          setImageLoaded(true);
        }
      } catch (error) {
        console.error('Erro ao buscar imagem da garrafa:', error);
        // Usar imagem padrão em caso de erro
        setBottleImage("/api/images/default-bottle.webp");
        setImageLoaded(true);
      }
    };

    const trackGameOpen = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          await updateGameStats(userId, "Girar a Garrafa");
        }
      } catch (error) {
        console.error("[SpinBottle] Error tracking game:", error);
      }
    };

    loadBottleImage();
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
  
  const handleImageUpload = async (imageUrl: string) => {
    setIsUploading(true);
    try {
      // Enviar a imagem para processamento de remoção de fundo
      const response = await fetch('/api/bottle-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: imageUrl }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao salvar imagem da garrafa');
      }
      
      // Atualiza a imagem da garrafa
      setBottleImage(imageUrl);
      setIsDialogOpen(false);
      
      toast({
        title: "Imagem atualizada",
        description: "Sua imagem personalizada foi configurada com sucesso!",
      });
      return true;
    } catch (error) {
      console.error('Erro ao configurar imagem:', error);
      toast({
        title: "Erro ao atualizar imagem",
        description: "Não foi possível configurar sua imagem personalizada.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleUploadWithBgRemoval = async (file: File) => {
    setIsUploading(true);
    try {
      // Criar FormData para envio do arquivo
      const formData = new FormData();
      formData.append('file', file);
      
      // Enviar para processamento com remoção de fundo
      const response = await fetch('/api/upload-bottle-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Falha ao processar imagem');
      }
      
      const data = await response.json();
      
      // Salvar a referência à nova imagem
      const success = await handleImageUpload(data.url);
      
      return success;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar a imagem para remover o fundo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };
  
  const resetBottleImage = async () => {
    try {
      // Definir de volta para a imagem padrão local
      const defaultUrl = "/api/images/default-bottle.webp";
      const success = await handleImageUpload(defaultUrl);
      
      if (success) {
        toast({
          title: "Garrafa restaurada",
          description: "A imagem padrão da garrafa foi restaurada com sucesso."
        });
      }
      
      return success;
    } catch (error) {
      console.error('Erro ao resetar imagem:', error);
      toast({
        title: "Erro ao restaurar",
        description: "Não foi possível restaurar a imagem padrão da garrafa.",
        variant: "destructive"
      });
      return false;
    }
  };

  if (!imageLoaded) {
    return (
      <GameLayout title="Girar a Garrafa">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin" />
          <div className="text-white text-xl animate-pulse">Carregando...</div>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout title="Girar a Garrafa">
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

          {/* Container da garrafa que vai girar */}
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
              src={bottleImage}
              alt="Garrafa"
              className="w-3/4 h-3/4 object-contain"
              draggable="false"
            />
          </motion.div>
        </div>

        <div className="flex w-full max-w-md justify-between gap-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-purple-700 hover:bg-purple-800 text-white hover:text-white"
                disabled={isSpinning || isUploading}
              >
                <Camera className="mr-2 h-5 w-5" />
                Personalizar Garrafa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Personalizar a Garrafa</DialogTitle>
                <DialogDescription>
                  Faça upload de uma imagem sua para usar como garrafa! O fundo será removido automaticamente.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="rounded-lg overflow-hidden bg-gray-50 p-2">
                  <p className="text-sm text-gray-500 mb-2">Sua imagem atual:</p>
                  <div className="flex justify-center">
                    <img 
                      src={bottleImage} 
                      alt="Garrafa atual" 
                      className="h-48 object-contain"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-md font-medium">Enviar nova imagem</h3>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUploadWithBgRemoval(e.target.files[0]);
                      }
                    }}
                    disabled={isUploading}
                  />
                  
                  <p className="text-xs text-gray-500">
                    Dica: Use fotos com fundo uniforme para melhor resultado na remoção automática do fundo.
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={resetBottleImage}
                  disabled={isUploading}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Restaurar garrafa padrão
                </Button>
                
                {isUploading && (
                  <div className="flex justify-center items-center">
                    <div className="w-8 h-8 border-4 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin mr-2" />
                    <span>Processando imagem...</span>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Button
            size="lg"
            onClick={spinBottle}
            disabled={isSpinning}
            className="flex-1 bg-purple-900 hover:bg-purple-950 text-white hover:text-white"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            {isSpinning ? "Girando..." : "Girar Garrafa"}
          </Button>
        </div>

      </div>
    </GameLayout>
  );
}