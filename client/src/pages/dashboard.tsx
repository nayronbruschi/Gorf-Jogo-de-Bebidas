import { useState } from "react";
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
import { GamepadIcon } from "lucide-react";
import { PromotionalBanner } from "@/components/PromotionalBanner";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { games } from "@/lib/game-data";
import { auth } from "@/lib/firebase";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const userId = auth.currentUser?.uid;

  if (!userId) {
    navigate("/auth");
    return null;
  }

  return (
    <AppLayout>
      <div className="min-h-screen w-full">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <section className="pb-2 overflow-hidden rounded-xl">
            <PromotionalBanner />
          </section>

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