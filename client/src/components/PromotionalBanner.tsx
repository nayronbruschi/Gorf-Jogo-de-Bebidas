import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { LazyImage } from "@/components/LazyImage";

interface BannerUrls {
  [key: string]: string;
}

interface BannerInfo {
  url: string;
  title: string;
  description: string;
  linkUrl?: string;
  isClickable?: boolean;
}

export function PromotionalBanner() {
  const [, navigate] = useLocation();
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
    description: bannerTexts[key]?.description || "O melhor app para suas festas",
    linkUrl: bannerTexts[key]?.linkUrl || "",
    isClickable: bannerTexts[key]?.isClickable || false
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

  // Função para lidar com cliques no banner
  const handleBannerClick = (banner: BannerInfo) => {
    if (!banner.isClickable || !banner.linkUrl) return;
    
    // Verificar se é uma URL externa (começa com http:// ou https://)
    if (banner.linkUrl.startsWith('http://') || banner.linkUrl.startsWith('https://')) {
      // Abrir em uma nova aba para URLs externas
      window.open(banner.linkUrl, '_blank');
    } else {
      // Para URLs internas
      navigate(banner.linkUrl);
    }
  };

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
                  <CardContent 
                    className={`relative aspect-[21/9] p-0 ${
                      banner.isClickable ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => handleBannerClick(banner)}
                  >
                    <LazyImage
                      src={banner.url}
                      alt={`Banner ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      placeholderClassName="w-full h-full"
                      loadingHeight="160px"
                    />
                    <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent w-full rounded-b-lg">
                      <h3 className="text-white text-xl font-bold mb-1 text-shadow">{banner.title}</h3>
                      <p className="text-white/90 text-sm text-shadow-sm">{banner.description}</p>
                      {banner.isClickable && (
                        <div className="mt-2 inline-flex items-center bg-purple-600/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                          {banner.linkUrl?.startsWith('http') 
                            ? 'Visitar site externo' 
                            : 'Ver mais no aplicativo'}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dots navigation */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10 px-2 py-1 bg-black/20 backdrop-blur-sm rounded-full">
        {orderedBanners.map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === selectedIndex 
                ? 'bg-purple-500 scale-110 shadow-glow' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}