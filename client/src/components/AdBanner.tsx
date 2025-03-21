import { useEffect, useState } from 'react';

interface AdBannerProps {
  className?: string;
}

export function AdBanner({ className }: AdBannerProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Verificar se as credenciais do AdMob estão disponíveis
      const appId = import.meta.env.VITE_ADMOB_APP_ID;
      const bannerId = import.meta.env.VITE_ADMOB_BANNER_ID;

      if (!appId || !bannerId) {
        console.warn('Credenciais do AdMob não encontradas');
        return;
      }

      // Carrega o script do AdMob de forma segura
      const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.async = true;
        script.setAttribute('data-ad-client', appId);

        script.onerror = () => {
          console.error('Erro ao carregar script do AdMob');
          setError('Erro ao carregar anúncios');
        };

        script.onload = () => {
          try {
            (window as any).adsbygoogle = (window as any).adsbygoogle || [];
            (window as any).adsbygoogle.push({});
          } catch (err) {
            console.error('Erro ao inicializar AdMob:', err);
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

  if (error) {
    console.warn('AdBanner error:', error);
    return null; // Não mostra nada se houver erro
  }

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={import.meta.env.VITE_ADMOB_APP_ID}
        data-ad-slot={import.meta.env.VITE_ADMOB_BANNER_ID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}