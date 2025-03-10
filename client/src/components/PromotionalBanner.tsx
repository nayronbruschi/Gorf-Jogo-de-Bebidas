import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

const bannerImages = [
  {
    src: "/attached_assets/[99Pay] INAPPS FASE 1 V2-promotion-zone-710x280.jpg",
    alt: "Promoção 99Pay"
  },
  {
    src: "/attached_assets/[99Pay] INAPPS FASE 1 V2-promotion-zone-710x280.jpg",
    alt: "Promoção 99Pay"
  },
  {
    src: "/attached_assets/[99Pay] INAPPS FASE 1 V2-promotion-zone-710x280.jpg",
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
    </Carousel>
  );
}