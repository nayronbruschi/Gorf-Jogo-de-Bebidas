import { useEffect } from 'react';

interface AdBannerProps {
  className?: string;
}

export function AdBanner({ className }: AdBannerProps) {
  useEffect(() => {
    try {
      // Carrega o script do AdMob
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.setAttribute('data-ad-client', import.meta.env.VITE_ADMOB_APP_ID || 'ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy');
      document.head.appendChild(script);

      // Inicializa o AdMob
      script.onload = () => {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      };

      return () => {
        document.head.removeChild(script);
      };
    } catch (error) {
      console.error('Erro ao carregar anúncios:', error);
    }
  }, []);

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