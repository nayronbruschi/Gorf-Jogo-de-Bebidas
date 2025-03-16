import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { apiRequest } from "@/lib/queryClient";

interface BannerUrls {
  [key: string]: string;
}

interface BannerInfo {
  url: string;
  title: string;
  description: string;
}

export function PromotionalBanner() {
  const [api, setApi] = useState<any>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    dragFree: false,
    skipSnaps: false,
    containScroll: "keepSnaps",
    align: "center"
  });

  // Fetch active banners and their texts
  const { data: banners = {} } = useQuery<BannerUrls>({
    queryKey: ["/api/banners"],
  });

  const { data: bannerTexts = {} } = useQuery({
    queryKey: ["/api/banner-texts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/banner-texts", undefined);
      return response.json();
    }
  });

  // Combine banners with their texts
  const orderedBanners = ["1", "2"].map(key => ({
    url: banners[key] || "",
    title: bannerTexts[key]?.title || "Bem-vindo ao Gorf",
    description: bannerTexts[key]?.description || "O melhor app para suas festas"
  })).filter(banner => banner.url);

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
    <div className="relative w-full">
      <div className="overflow-hidden rounded-xl">
        <div className="mx-auto" ref={emblaRef}>
          <div className="flex">
            {orderedBanners.map((banner, index) => (
              <div 
                key={index} 
                className="relative flex-[0_0_100%] min-w-0"
              >
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
              </div>
            ))}
          </div>
        </div>
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