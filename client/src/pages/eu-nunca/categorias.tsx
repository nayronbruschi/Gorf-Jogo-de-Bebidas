import { useState, useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { auth, updateGameStats } from "@/lib/firebase";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Eye, Pill, Smile, Flame, Zap } from "lucide-react";

// Definição das categorias
const categorias = [
  {
    id: "comuns",
    nome: "Comuns",
    descricao: "Perguntas leves para todos os públicos",
    icon: Smile,
  },
  {
    id: "pesadas",
    nome: "Pesadas",
    descricao: "Perguntas mais intensas e desafiadoras",
    icon: Flame,
  },
  {
    id: "eroticas",
    nome: "Adulto",
    descricao: "Perguntas com conteúdo +18",
    icon: Eye,
  },
  {
    id: "drogas",
    nome: "Substâncias",
    descricao: "Perguntas sobre bebidas e outras substâncias",
    icon: Pill,
  },
  {
    id: "mistas",
    nome: "Misturadas",
    descricao: "Combinação de todas as categorias",
    icon: Zap,
  },
];

export default function EuNuncaCategorias() {
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("comuns");
  const [mostrarAlertaAdulto, setMostrarAlertaAdulto] = useState(false);
  const [mostrarAlertaDrogas, setMostrarAlertaDrogas] = useState(false);
  
  // Registrar o jogo nas estatísticas do usuário
  useEffect(() => {
    const trackGameOpen = async () => {
      try {
        const userId = localStorage.getItem('dev_session') || auth.currentUser?.uid;
        if (userId) {
          await updateGameStats(userId, "Eu Nunca");
        }
      } catch (error) {
        console.error("[EuNuncaCategorias] Error tracking game:", error);
      }
    };
    
    trackGameOpen();
  }, []);
  
  const handleCategorySelect = (categoryId: string) => {
    // Verificar se a categoria requer confirmação
    if (categoryId === "eroticas" && !localStorage.getItem("euNuncaAdultoConfirmado")) {
      setMostrarAlertaAdulto(true);
      return;
    }
    
    if (categoryId === "drogas" && !localStorage.getItem("euNuncaDrogasConfirmado")) {
      setMostrarAlertaDrogas(true);
      return;
    }
    
    setSelectedCategory(categoryId);
  };
  
  const confirmarCategoriaAdulto = () => {
    localStorage.setItem("euNuncaAdultoConfirmado", "true");
    setSelectedCategory("eroticas");
    setMostrarAlertaAdulto(false);
  };
  
  const confirmarCategoriaDrogas = () => {
    localStorage.setItem("euNuncaDrogasConfirmado", "true");
    setSelectedCategory("drogas");
    setMostrarAlertaDrogas(false);
  };
  
  const handleContinue = () => {
    localStorage.setItem("euNuncaCategoriaAtual", selectedCategory);
    navigate("/eu-nunca/jogadores");
  };

  return (
    <GameLayout title="Eu Nunca">
      <div className="flex flex-col items-center gap-8 bg-purple-900/70 p-6 rounded-xl shadow-lg max-w-lg mx-auto">
        <div className="text-center w-full">
          <h3 className="text-2xl font-bold text-white mb-4">
            Escolha a Categoria
          </h3>
          <p className="text-xl text-white/90">
            Selecione o tipo de perguntas para o jogo "Eu Nunca".
          </p>
        </div>

        <div className="w-full space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {categorias.map((categoria) => {
              const CategoryIcon = categoria.icon;
              return (
                <motion.button
                  key={categoria.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategorySelect(categoria.id)}
                  className={`p-4 rounded-lg text-left transition-colors ${
                    selectedCategory === categoria.id
                      ? 'bg-white text-purple-700'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon className="h-5 w-5" />
                    <div>
                      <div className="font-semibold">{categoria.nome}</div>
                      <div className="text-sm opacity-80">{categoria.descricao}</div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleContinue}
          className="bg-green-700 hover:bg-green-800 text-white text-xl px-8 py-6 flex items-center justify-center w-full md:w-auto"
        >
          <Play className="mr-2 h-6 w-6" />
          Continuar
        </Button>
      </div>
      
      {/* Alerta para categoria adulto */}
      <AlertDialog open={mostrarAlertaAdulto} onOpenChange={setMostrarAlertaAdulto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conteúdo Adulto</AlertDialogTitle>
            <AlertDialogDescription>
              Esta categoria contém perguntas com conteúdo adulto (+18). 
              Certifique-se de que todos os jogadores são maiores de idade.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarCategoriaAdulto}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Alerta para categoria drogas */}
      <AlertDialog open={mostrarAlertaDrogas} onOpenChange={setMostrarAlertaDrogas}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conteúdo Sensível</AlertDialogTitle>
            <AlertDialogDescription>
              Esta categoria contém perguntas sobre consumo de álcool e outras substâncias.
              Tenha responsabilidade e beba com moderação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarCategoriaDrogas}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
    </GameLayout>
  );
}