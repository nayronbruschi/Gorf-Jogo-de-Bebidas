import { useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { GameCard } from "@/components/GameCard";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { games } from "@/lib/game-data";
import { motion } from "framer-motion";

export default function GameModes() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Limpar dados ao entrar na página de modos
  useEffect(() => {
    const cleanupData = async () => {
      try {
        // Não limpar localStorage nem dados se estiver vindo da página de vencedor
        const fromWinner = window.location.pathname.includes('winner');
        if (!fromWinner) {
          // Limpar localStorage
          localStorage.clear();

          // Limpar todos os jogadores
          await apiRequest("DELETE", "/api/players/all", {});

          // Invalidar queries para forçar recarregamento dos dados
          await queryClient.invalidateQueries();
        }
      } catch (error) {
        console.error('Erro ao limpar dados:', error);
      }
    };

    cleanupData();
  }, []);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  // Simulação de jogos em destaque - isso seria configurado no painel de admin
  const featuredGames = {
    "eu-nunca": { isFeatured: true, tag: "Em Destaque" },
    "desenha-e-bebe": { isFeatured: true, tag: "Novo!" }
  };

  return (
    <GameLayout title="">
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-700 -mt-8 -mx-4 px-4 pt-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-purple-200 text-xl">Escolha um dos modos de jogo abaixo para começar</p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {games.map((game) => {
              const featured = featuredGames[game.id as keyof typeof featuredGames];
              return (
                <motion.div key={game.id} variants={item}>
                  <GameCard
                    title={game.name}
                    description={game.description}
                    icon={game.icon}
                    href={game.route}
                    isFeatured={featured?.isFeatured}
                    featureTag={featured?.tag}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </GameLayout>
  );
}