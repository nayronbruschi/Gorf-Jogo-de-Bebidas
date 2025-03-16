import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GamepadIcon, History, Trophy, Clock } from "lucide-react";
import { PromotionalBanner } from "@/components/PromotionalBanner";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { games } from "@/lib/game-data";
import { auth, getUserProfile } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [userProfile, setUserProfile] = useState<any>(null);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const loadUserProfile = async () => {
      if (userId) {
        const profile = await getUserProfile(userId);
        setUserProfile(profile);
      }
    };

    loadUserProfile();
  }, [userId]);

  if (!userId) {
    navigate("/auth");
    return null;
  }

  const lastGame = userProfile?.gameStats?.recentGames?.[0];
  const recentGames = userProfile?.gameStats?.recentGames?.slice(0, 3) || [];

  return (
    <AppLayout>
      <div className="min-h-screen w-full">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <section className="pb-2 overflow-hidden rounded-xl">
            <PromotionalBanner />
          </section>

          {/* Último Jogo */}
          {lastGame && (
            <Card className="bg-white/10 backdrop-blur-lg border-none">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Último Jogo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white/90">
                  <p className="text-lg font-semibold">{lastGame.name}</p>
                  <p className="text-sm text-white/60">
                    {formatDistanceToNow(new Date(lastGame.playedAt), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/10 backdrop-blur-lg border-none">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Total de Jogos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  {userProfile?.gameStats?.totalGamesPlayed || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-none">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tempo Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  {Math.round((userProfile?.gameStats?.totalPlayTime || 0) / 60)}h
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Jogos Recentes */}
          {recentGames.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-lg border-none">
              <CardHeader>
                <CardTitle className="text-white">Jogos Recentes</CardTitle>
                <CardDescription className="text-white/60">
                  Seus últimos jogos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentGames.map((game: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    >
                      <div>
                        <p className="text-white font-medium">{game.name}</p>
                        <p className="text-sm text-white/60">
                          {formatDistanceToNow(new Date(game.playedAt), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <section className="pb-2">
            <h2 className="text-white text-lg font-medium mb-2">Todos os Jogos</h2>
            <Carousel 
              className="w-full"
              opts={{
                align: "start",
                dragFree: true,
                skipSnaps: true,
                inViewThreshold: 0.5,
              }}
            >
              <CarouselContent className="-ml-4">
                {games.map((game) => (
                  <CarouselItem key={game.id} className="pl-4 basis-[22%]">
                    <div 
                      className="flex flex-col items-center gap-1 p-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(game.route)}
                    >
                      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                        <game.icon className="h-7 w-7 text-white" />
                      </div>
                      <span className="text-xs text-white text-center mt-1 px-12">{game.name}</span>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </section>

          <Card className="bg-white/10 backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle className="text-white">Bem-vindo ao Gorf!</CardTitle>
              <CardDescription className="text-white/60">
                Escolha um jogo para começar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                onClick={() => navigate("/game-modes")}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white"
              >
                <GamepadIcon className="mr-2 h-5 w-5" />
                Ver Todos os Jogos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}