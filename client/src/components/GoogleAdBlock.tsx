import { useEffect, useRef } from 'react';

interface GoogleAdBlockProps {
  slot: string;
  className?: string;
}

export function GoogleAdBlock({ slot, className = '' }: GoogleAdBlockProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("[AdSense] Inicializando anúncio com slot:", slot);
    console.log("[AdSense] Ambiente:", import.meta.env.DEV ? "Desenvolvimento" : "Produção");
    
    // Em produção, vamos inicializar o anúncio assim que o componente montar
    if (!import.meta.env.DEV && adContainerRef.current) {
      try {
        console.log("[AdSense] Tentando inicializar anúncio em produção");
        setTimeout(() => {
          if (window.adsbygoogle) {
            console.log("[AdSense] Chamando adsbygoogle.push()");
            window.adsbygoogle.push({});
          } else {
            console.log("[AdSense] adsbygoogle não está disponível");
          }
        }, 300);
      } catch (error) {
        console.error('[AdSense] Erro ao inicializar anúncio Google AdSense:', error);
      }
    }
  }, [slot]);

  // Em desenvolvimento, mostrar um placeholder
  if (import.meta.env.DEV) {
    return (
      <div 
        className={`mx-auto bg-gradient-to-r from-yellow-100 to-yellow-200 flex items-center justify-center rounded-lg border-2 border-dashed border-yellow-400 ${className}`}
        style={{ 
          minHeight: '90px', 
          height: '90px', 
          width: '320px', 
          maxWidth: '100%' 
        }}
      >
        <div className="flex flex-col items-center p-2 text-center">
          <p className="text-yellow-700 text-xs font-bold mb-1">Anúncio Google AdSense</p>
          <p className="text-yellow-800 text-xs">PLACEHOLDER (só em desenvolvimento)</p>
          <p className="text-yellow-800 text-xs">Slot: {slot}</p>
        </div>
      </div>
    );
  }

  // Em produção, inserimos o HTML exato fornecido pelo Google AdSense
  // Usando um anúncio mais responsivo para dispositivos móveis
  const adCode = `
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2437408673546853"
     crossorigin="anonymous"></script>
    <!-- Bloco_Ad_Dashboard -->
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-2437408673546853"
         data-ad-slot="${slot}"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
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