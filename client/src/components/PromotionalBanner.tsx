import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";

interface BannerUrls {
  [key: string]: string;
}

interface BannerInfo {
  url: string;
  title: string;
  description: string;
}

const getBannerInfo = (key: string): BannerInfo => {
  const bannerData: Record<string, BannerInfo> = {
    "1": {
      url: "/api/images/freepik__adorable-cartoon-style-a-vibrant-party-scene-with-__16340.jpeg",
      title: "Bem-vindo ao Gorf",
      description: "O melhor app para suas festas"
    },
    "2": {
      url: "/api/images/freepik__adorable-cartoon-style-a-cozy-indoor-setting-with-__16341.jpeg",
      title: "Diversão Garantida",
      description: "Jogos para todos os momentos"
    }
  };
  return bannerData[key] || { url: "", title: "", description: "" };
};

export function PromotionalBanner() {
  const [api, setApi] = useState<any>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    dragFree: false,
    skipSnaps: false,
    containScroll: "trimSnaps"
  });

  // Fetch active banners
  const { data: banners = {} } = useQuery<BannerUrls>({
    queryKey: ["/api/banners"],
  });

  // Garantir que os banners são mostrados em ordem
  const orderedBanners = ["1", "2", "3"]
    .map(key => getBannerInfo(key))
    .filter(banner => banner.url);

  useEffect(() => {
    if (emblaApi) {
      setApi(emblaApi);

      // Auto-rotation every 4 seconds
      const autoplayInterval = setInterval(() => {
        if (emblaApi.canScrollNext()) {
          emblaApi.scrollNext();
        } else {
          emblaApi.scrollTo(0);
        }
      }, 4000);

      // Update selected index on scroll
      emblaApi.on('select', () => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
      });

      return () => {
        clearInterval(autoplayInterval);
        emblaApi.off('select', () => {});
      };
    }
  }, [emblaApi]);

  if (orderedBanners.length === 0) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl">
        <Carousel 
          ref={emblaRef}
          className="w-full max-w-screen-xl mx-auto"
        >
          <CarouselContent>
            {orderedBanners.map((banner, index) => (
              <CarouselItem key={index}>
                <Card className="border-none">
                  <CardContent className="relative aspect-[21/9] p-0">
                    <img
                      src={banner.url}
                      alt={`Banner ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/60 to-transparent w-full rounded-b-lg">
                      <h3 className="text-white text-xl font-bold mb-1">{banner.title}</h3>
                      <p className="text-white/80 text-sm">{banner.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Dots navigation */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        {orderedBanners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === selectedIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}