import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface BannerUrls {
  [key: string]: string;
}

export function PromotionalBanner() {
  // Fetch active banners
  const { data: banners = {} } = useQuery<BannerUrls>({
    queryKey: ["/api/banners"],
  });

  const bannerUrls = Object.values(banners);

  if (bannerUrls.length === 0) return null;

  return (
    <Carousel className="w-full max-w-screen-xl mx-auto" opts={{ loop: true }}>
      <CarouselContent>
        {bannerUrls.map((url, index) => (
          <CarouselItem key={index}>
            <Card className="border-none">
              <CardContent className="relative aspect-[21/9] p-0">
                <img
                  src={url}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}