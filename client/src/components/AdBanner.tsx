import { useEffect, useState, useRef } from 'react';

interface AdBannerProps {
  className?: string;
  position?: 'top' | 'middle' | 'bottom';
  slot?: string; // Slot ID específico para a inserção do anúncio
}

export function AdBanner({ className, position = 'top', slot }: AdBannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);
  const adContainerRef = useRef<HTMLDivElement>(null);

  // Usar diferentes tamanhos de acordo com a posição
  const getHeight = () => {
    switch (position) {
      case 'top': return 'h-[90px]';
      case 'middle': return 'h-[100px]';
      case 'bottom': return 'h-[120px]';
      default: return 'h-[90px]';
    }
  };

  useEffect(() => {
    try {
      // Verificar se estamos em produção e se temos o ID do AdSense
      const adClientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
      const isProduction = !import.meta.env.DEV;

      // Se estivermos em ambiente de produção, tente carregar o AdSense
      if (isProduction && adClientId) {
        // Carregar o script do AdSense
        const script = document.createElement('script');
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClientId}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        
        script.onerror = () => {
          console.error('Erro ao carregar script do AdSense');
          setError('Erro ao carregar anúncios');
        };

        script.onload = () => {
          try {
            // Inicializa o AdSense
            (window as any).adsbygoogle = (window as any).adsbygoogle || [];
            (window as any).adsbygoogle.push({});
            setIsAdLoaded(true);
          } catch (err) {
            console.error('Erro ao inicializar AdSense:', err);
            setError('Erro ao inicializar anúncios');
          }
        };

        document.head.appendChild(script);

        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      }
    } catch (error) {
      console.error('Erro ao configurar anúncios:', error);
      setError('Erro ao configurar anúncios');
    }
  }, []);

  // Para quando estamos em desenvolvimento ou quando ocorre um erro,
  // mostrar um banner personalizado
  if (import.meta.env.DEV || error) {
    const handleClick = () => {
      setClicked(true);
      setTimeout(() => setClicked(false), 300);
    };

    return (
      <div 
        className={`w-full ${getHeight()} bg-gradient-to-r from-purple-100 to-purple-200 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 ${clicked ? 'opacity-80' : ''} ${className}`}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center">
          <p className="text-purple-700 text-sm font-medium mb-1">Espaço para Anúncio</p>
          <p className="text-purple-600 text-xs">Gorf Premium</p>
        </div>
      </div>
    );
  }

  // Em produção, mostrar o componente do AdSense real
  return (
    <div 
      ref={adContainerRef} 
      className={`w-full overflow-hidden ${getHeight()} ${className}`}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client="ca-pub-2437408673546853"
        data-ad-slot={slot || import.meta.env.VITE_ADSENSE_SLOT_ID || ''}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}