import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { GameLayout } from "@/components/GameLayout";

export default function DesenhaEBebe() {
  const [, navigate] = useLocation();
  
  // Redirecionar para a nova versão do jogo
  useEffect(() => {
    navigate("/desenha-e-bebe/jogadores");
  }, [navigate]);

  // Renderizar uma tela de carregamento enquanto redireciona
  return (
    <GameLayout title="Desenha e Bebe">
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    </GameLayout>
  );
}