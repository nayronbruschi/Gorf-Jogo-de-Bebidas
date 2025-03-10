import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

const bannerImages = [
  {
    src: "/banner/banner1.jpg",
    alt: "Sueca Card Game",
    title: "Sueca Card Game",
    description: "Jogue o clássico jogo de cartas português"
  },
  {
    src: "/banner/banner2.jpg",
    alt: "Roulette Mode",
    title: "Roulette Mode",
    description: "Gire a roleta e descubra seu destino"
  },
  {
    src: "/banner/banner3.jpg",
    alt: "Guess Who Game",
    title: "Guess Who Game",
    description: "Teste sua memória e diversão garantida"
  }
];

export function PromotionalBanner() {
  return (
    <Carousel className="w-full max-w-screen-xl mx-auto">
      <CarouselContent>
        {bannerImages.map((image, index) => (
          <CarouselItem key={index}>
            <Card className="border-none">
              <CardContent className="relative aspect-[21/9] p-0">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white rounded-b-lg">
                  <h3 className="text-xl font-bold">{image.title}</h3>
                  <p className="text-sm text-white/80">{image.description}</p>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
}
