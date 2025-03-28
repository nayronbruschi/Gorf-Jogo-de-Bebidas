import { useEffect, useRef } from 'react';

interface GoogleAdSenseProps {
  client?: string;
  slot: string;
  format?: string;
  responsive?: boolean;
  className?: string;
}

export function GoogleAdSense({
  client = 'ca-pub-2437408673546853',
  slot,
  format = 'auto',
  responsive = true,
  className = ''
}: GoogleAdSenseProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Apenas em produção tentamos carregar anúncios reais
    if (!import.meta.env.DEV) {
      try {
        // Verifica se o script do AdSense já foi carregado
        const existingScript = document.querySelector('script[src*="adsbygoogle"]');
        
        if (!existingScript) {
          // Adiciona o script do Google AdSense se ainda não existir
          const script = document.createElement('script');
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
          script.async = true;
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);
        }

        // Inicializa o anúncio
        // Timeout para garantir que o script do AdSense já foi carregado
        const timer = setTimeout(() => {
          if (window.adsbygoogle) {
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.push({});
          }
        }, 300);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Erro ao configurar anúncios do Google AdSense:', error);
      }
    }
  }, [client, slot]);

  // Em desenvolvimento, mostrar um placeholder
  if (import.meta.env.DEV) {
    return (
      <div 
        className={`w-full bg-gradient-to-r from-purple-100 to-purple-200 flex items-center justify-center rounded-lg ${className}`}
        style={{ minHeight: '100px' }}
      >
        <div className="flex flex-col items-center p-4">
          <p className="text-purple-700 text-sm font-medium mb-1">Anúncio Google AdSense</p>
          <p className="text-purple-600 text-xs">Slot: {slot}</p>
        </div>
      </div>
    );
  }

  // Em produção, inserimos o componente do AdSense exatamente como na documentação
  return (
    <div ref={adContainerRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

// Adicionar o tipo à janela global
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}