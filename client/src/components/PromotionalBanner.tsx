import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

const bannerImages = [
  {
    src: "/banner/banner1.jpg",
    alt: "Promoção 99Pay"
  },
  {
    src: "/banner/banner2.jpg",
    alt: "Promoção 99Pay"
  },
  {
    src: "/banner/banner3.jpg",
    alt: "Promoção 99Pay"
  }
];

export function PromotionalBanner() {
  return (
    <Carousel className="w-full max-w-screen-xl mx-auto" opts={{ loop: true }}>
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