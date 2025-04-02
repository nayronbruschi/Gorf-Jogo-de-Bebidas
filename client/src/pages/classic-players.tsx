import { GameLayout } from "@/components/GameLayout";
import { PlayerList } from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Play } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function ClassicPlayers() {
  const [, navigate] = useLocation();
  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const startGame = useMutation({
    mutationFn: async () => {
      // Limpar pontuações antes de começar
      await apiRequest("POST", "/api/players/reset", {});
      // Definir o primeiro jogador
      await apiRequest("POST", "/api/players/first", {});
    },
    onSuccess: async () => {
      // Atualizar os dados
      await queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/players/current"] });
      // Iniciar o jogo
      navigate("/classic/play");
    }
  });

  return (
    <GameLayout title="">
      <div className="container max-w-xl mx-auto px-4 pt-8 pb-16">
        {/* Header minimalista com badge apenas */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Jogadores
          </div>
        </header>

        {/* Card principal com lista de jogadores */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-10">
          <PlayerList />
        </div>

        {/* Botão de iniciar jogo com estilo Apple */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => startGame.mutate()}
            disabled={players.length < 2 || startGame.isPending}
            className={`px-10 py-6 flex items-center justify-center text-xl rounded-full shadow-lg transition-all duration-300 ${
              players.length >= 2 
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:shadow-xl hover:scale-[1.02]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {startGame.isPending ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando...
              </div>
            ) : (
              <>
                <Play className="mr-2 h-6 w-6" />
                {players.length < 2 
                  ? "Mínimo 2 jogadores"
                  : "Vamos começar!"}
              </>
            )}
          </Button>
        </div>

        {/* Dica para o usuário */}
        {players.length < 2 && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Adicione mais jogadores para continuar
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}