import { useState, useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Play } from "lucide-react";
import { Beer, Flame } from "lucide-react";
import { auth, updateGameStats } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";

type GameMode = "goles" | "shots";

const modes: Record<GameMode, {
  name: string;
  description: string;
  icon: any;
}> = {
  goles: {
    name: "Goles",
    description: "Se você vai jogar bebendo um drink, uma cerveja ou algo mais tranquilo essa é a opção para você.",
    icon: Beer,
  },
  shots: {
    name: "Shots!",
    description: "Se você é hardcore e vai jogar com shots (vodka, tequila, entre outros), essa é a opção a se escolher.",
    icon: Flame,
  }
};

export default function RouletteStart() {
  const [, navigate] = useLocation();
  const [selectedMode, setSelectedMode] = useState<GameMode>("goles");

  // Registrar o jogo assim que entrar na página
  useEffect(() => {
    const trackGameOpen = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          await updateGameStats(userId, "Gorf");
        }
      } catch (error) {
        console.error("[RouletteStart] Error tracking game:", error);
      }
    };

    trackGameOpen();

    // Limpar jogadores ao entrar na página
    const cleanupPlayers = async () => {
      try {
        await apiRequest("DELETE", "/api/players/all", {});
      } catch (error) {
        console.error('Erro ao limpar jogadores:', error);
      }
    };

    cleanupPlayers();
  }, []);

  const handleStartGame = () => {
    // Salvar o modo selecionado no localStorage
    localStorage.setItem("rouletteMode", selectedMode);
    // Ir para a página de configuração de jogadores
    navigate("/roulette/players");
  };

  return (
    <GameLayout title="">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Cabeçalho minimalista */}
        <header className="text-center mb-2">
        </header>
        
        {/* Seção de Modos de Jogo com estilo Apple */}
        <section className="mx-auto max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.entries(modes) as [GameMode, typeof modes[GameMode]][]).map(([key, mode]) => (
              <div
                key={key}
                onClick={() => setSelectedMode(key)}
                className={`relative rounded-2xl backdrop-blur-sm transition-all duration-300 overflow-hidden cursor-pointer h-64 group ${
                  selectedMode === key
                    ? "ring-4 ring-purple-500 shadow-xl scale-[1.02]"
                    : "ring-2 ring-purple-300/50 shadow-md hover:shadow-lg"
                }`}
              >
                {/* Efeito de glassmorphism */}
                <div className={`absolute inset-0 ${
                  selectedMode === key
                    ? "bg-gradient-to-br from-purple-100/80 to-white"
                    : "bg-white/70 group-hover:bg-white/80"
                }`}></div>
                
                {/* Círculo decorativo */}
                <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full ${
                  selectedMode === key
                    ? key === "goles" ? "bg-blue-100/60" : "bg-orange-100/60"
                    : "bg-gray-100/60" 
                }`}></div>
                
                {/* Conteúdo */}
                <div className="relative h-full p-6 flex flex-col items-center justify-between z-10">
                  <div className="flex flex-col items-center text-center">
                    {/* Ícone em círculo com gradiente */}
                    <div className={`p-4 rounded-full mb-4 ${
                      selectedMode === key
                        ? "bg-gradient-to-br from-[#326800] to-green-700" 
                        : "bg-gradient-to-br from-purple-600 to-purple-800"
                    }`}>
                      <mode.icon className="h-10 w-10 text-white" />
                    </div>
                    
                    <h3 className={`text-2xl font-bold mb-2 ${
                      selectedMode === key ? "text-[#326800]" : "text-purple-800"
                    }`}>
                      {mode.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed">{mode.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Botão de Iniciar estilo Apple */}
        <div className="flex justify-center mt-10">
          <Button
            size="lg"
            onClick={handleStartGame}
            className="bg-[#326800] hover:bg-green-700 text-white text-xl px-10 py-6 rounded-full shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
          >
            <Play className="mr-2 h-6 w-6" />
            Continuar
          </Button>
        </div>
      </div>
    </GameLayout>
  );
}