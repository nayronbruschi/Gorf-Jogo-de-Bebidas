import { useState } from 'react';
import { Share2, X, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { FaWhatsapp, FaTwitter, FaFacebook, FaTelegram, FaInstagram } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';

interface SocialShareMenuProps {
  gameTitle: string;
  gameDescription?: string;
  className?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function SocialShareMenu({
  gameTitle,
  gameDescription = "Venha jogar comigo no Gorf!",
  className = '',
  buttonVariant = 'default',
  buttonSize = 'icon',
  showLabel = false
}: SocialShareMenuProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  // URL atual ou URL base do app
  const currentUrl = typeof window !== 'undefined' 
    ? window.location.href 
    : 'https://gorf.app';
  
  // Texto de compartilhamento
  const shareText = `${gameTitle} - ${gameDescription}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(currentUrl);
  
  // URLs para compartilhamento
  const shareUrls = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    instagram: `https://www.instagram.com/?url=${encodedUrl}`
  };

  // Função para compartilhar via API Web Share se disponível
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: gameTitle,
          text: gameDescription,
          url: currentUrl
        });
        toast({
          title: "Compartilhado com sucesso!",
          description: "O link do jogo foi compartilhado.",
        });
        setOpen(false);
      } catch (error) {
        console.error("Erro ao compartilhar:", error);
      }
    } else {
      // Fallback para copiar URL para clipboard
      handleCopyLink();
    }
  };

  // Função para copiar o link para a área de transferência
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      toast({
        title: "Link copiado!",
        description: "O link do jogo foi copiado para a área de transferência.",
      });
      setOpen(false);
    }).catch(err => {
      console.error('Erro ao copiar link:', err);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive"
      });
    });
  };

  // Função para abrir link de compartilhamento em um popup
  const openShareUrl = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size={buttonSize} 
          className={className}
          aria-label="Compartilhar"
        >
          <Share2 className="h-4 w-4" />
          {showLabel && <span className="ml-2">Compartilhar</span>}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl px-0">
        <SheetHeader className="px-4">
          <SheetTitle className="text-center">Compartilhar {gameTitle}</SheetTitle>
          <SheetClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </SheetClose>
        </SheetHeader>

        <div className="flex flex-col space-y-3 p-4">
          {/* Botão de compartilhamento nativo */}
          <Button
            variant="default"
            size="lg"
            className="w-full bg-purple-700 hover:bg-purple-800"
            onClick={handleNativeShare}
          >
            <Share2 className="mr-2 h-5 w-5" />
            Compartilhar agora
          </Button>

          {/* Grid de opções de compartilhamento */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <Button
              variant="outline"
              className="flex flex-col items-center h-auto py-3"
              onClick={() => openShareUrl(shareUrls.whatsapp)}
            >
              <FaWhatsapp className="h-6 w-6 text-green-500 mb-1" />
              <span className="text-xs">WhatsApp</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center h-auto py-3"
              onClick={() => openShareUrl(shareUrls.twitter)}
            >
              <FaTwitter className="h-6 w-6 text-blue-400 mb-1" />
              <span className="text-xs">Twitter</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center h-auto py-3"
              onClick={() => openShareUrl(shareUrls.facebook)}
            >
              <FaFacebook className="h-6 w-6 text-blue-600 mb-1" />
              <span className="text-xs">Facebook</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center h-auto py-3"
              onClick={() => openShareUrl(shareUrls.telegram)}
            >
              <FaTelegram className="h-6 w-6 text-blue-500 mb-1" />
              <span className="text-xs">Telegram</span>
            </Button>
          </div>

          {/* Botão de copiar link */}
          <Button
            variant="secondary"
            size="lg"
            className="w-full mt-2"
            onClick={handleCopyLink}
          >
            <Copy className="mr-2 h-5 w-5" />
            Copiar link
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}