import { useEffect } from 'react';

interface AdBannerProps {
  className?: string;
}

export function AdBanner({ className }: AdBannerProps) {
  useEffect(() => {
    // Initialize AdMob
    try {
      // Load Google AdSense script
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);

      // Initialize ads
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('Error loading ads:', error);
    }
  }, []);

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID" // Replace with your AdSense publisher ID
        data-ad-slot="YOUR_AD_SLOT_ID" // Replace with your ad slot ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
