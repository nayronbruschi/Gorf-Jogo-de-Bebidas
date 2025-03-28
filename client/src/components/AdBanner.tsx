import { useEffect, useState, useRef } from 'react';

interface AdBannerProps {
  className?: string;
}

export function AdBanner({ className }: AdBannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      // Verificar se as credenciais do AdSense estão disponíveis
      const adClientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
      const adSlotId = import.meta.env.VITE_ADSENSE_SLOT_ID;

      if (!adClientId) {
        console.warn('ID do cliente AdSense não encontrado');
        return;
      }

      // Carrega o script do AdSense de forma segura
      const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        
        // Usar data-ad-client para AdSense
        if (adClientId) {
          script.setAttribute('data-ad-client', adClientId);
        }

        script.onerror = () => {
          console.error('Erro ao carregar script do AdSense');
          setError('Erro ao carregar anúncios');
        };

        script.onload = () => {
          try {
            // Inicializa o AdSense
            (window as any).adsbygoogle = (window as any).adsbygoogle || [];
            (window as any).adsbygoogle.push({});
            setIsLoaded(true);
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
      } else {
        // Se o script já existe, apenas inicialize o anúncio
        try {
          (window as any).adsbygoogle = (window as any).adsbygoogle || [];
          (window as any).adsbygoogle.push({});
          setIsLoaded(true);
        } catch (err) {
          console.error('Erro ao inicializar AdSense existente:', err);
          setError('Erro ao inicializar anúncios');
        }
      }
    } catch (error) {
      console.error('Erro ao configurar anúncios:', error);
      setError('Erro ao configurar anúncios');
    }
  }, []);

  // Para ambiente de desenvolvimento, mostrar um banner de espaço reservado
  if (import.meta.env.DEV && !isLoaded) {
    return (
      <div 
        className={`w-full h-[90px] bg-gradient-to-r from-purple-100 to-purple-200 flex items-center justify-center rounded-lg ${className}`}
      >
        <p className="text-purple-700 text-sm font-medium">Espaço para Anúncio</p>
      </div>
    );
  }

  if (error) {
    console.warn('AdBanner error:', error);
    return null; // Não mostra nada se houver erro
  }

  return (
    <div ref={adContainerRef} className={`w-full overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID}
        data-ad-slot={import.meta.env.VITE_ADSENSE_SLOT_ID || ''}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}