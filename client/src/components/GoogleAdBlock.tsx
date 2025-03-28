import { useEffect, useRef } from 'react';

interface GoogleAdBlockProps {
  slot: string;
  className?: string;
}

export function GoogleAdBlock({ slot, className = '' }: GoogleAdBlockProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Em produção, vamos inicializar o anúncio assim que o componente montar
    if (!import.meta.env.DEV && adContainerRef.current) {
      try {
        setTimeout(() => {
          if (window.adsbygoogle) {
            window.adsbygoogle.push({});
          }
        }, 300);
      } catch (error) {
        console.error('Erro ao inicializar anúncio Google AdSense:', error);
      }
    }
  }, [slot]);

  // Em desenvolvimento, mostrar um placeholder
  if (import.meta.env.DEV) {
    return (
      <div 
        className={`w-full bg-gradient-to-r from-purple-100 to-purple-200 flex items-center justify-center rounded-lg ${className}`}
        style={{ minHeight: '90px', height: '90px', width: '728px', maxWidth: '100%' }}
      >
        <div className="flex flex-col items-center p-4">
          <p className="text-purple-700 text-sm font-medium mb-1">Anúncio Google AdSense</p>
          <p className="text-purple-600 text-xs">Slot: {slot}</p>
        </div>
      </div>
    );
  }

  // Em produção, inserimos o HTML exato fornecido pelo Google AdSense
  const adCode = `
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2437408673546853"
     crossorigin="anonymous"></script>
    <!-- Bloco_Ad_Dashboard -->
    <ins class="adsbygoogle"
         style="display:inline-block;width:728px;height:90px"
         data-ad-client="ca-pub-2437408673546853"
         data-ad-slot="${slot}"></ins>
    <script>
         (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
  `;

  return (
    <div 
      ref={adContainerRef} 
      className={className}
      dangerouslySetInnerHTML={{ __html: adCode }}
    />
  );
}

// Adicionar o tipo à janela global
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}