import { useEffect, useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { GameCard } from "@/components/GameCard";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { games } from "@/lib/game-data";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { AdBanner } from "@/components/AdBanner";

interface FeaturedGameTags {
  [gameId: string]: {
    isFeatured: boolean;
    tagText?: string;
  };
}

export default function GameModes() {
  // Buscar tags de destaque da API
  const { data: featuredTags = {} as FeaturedGameTags } = useQuery<FeaturedGameTags>({
    queryKey: ['/api/featured-tags'],
  });

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

  return (
    <GameLayout title="Modos de Jogo">
      <div className="min-h-screen bg-white -mx-4 px-4 pt-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-slate-700 text-xl">Escolha um dos modos de jogo abaixo para começar</p>
          </motion.div>
          
          {/* Banner de anúncios */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <AdBanner position="middle" />
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {games.map((game) => {
              const gameTag = featuredTags?.[game.id];
              return (
                <motion.div key={game.id} variants={item}>
                  <GameCard
                    title={game.name}
                    description={game.description}
                    icon={game.icon}
                    href={game.route}
                    isFeatured={gameTag?.isFeatured}
                    featureTag={gameTag?.tagText}
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