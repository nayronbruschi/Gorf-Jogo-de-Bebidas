import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  width?: number;
  height?: number;
  loadingHeight?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({ 
  src, 
  alt, 
  className = '', 
  placeholderClassName = '',
  width,
  height,
  loadingHeight = '200px',
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Configurar o IntersectionObserver para detectar quando a imagem está na viewport
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '200px', // Carrega a imagem quando estiver a 200px de distância da viewport
      threshold: 0.01
    });
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  // Lidar com o carregamento da imagem
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };
  
  // Lidar com erro no carregamento da imagem
  const handleError = () => {
    setError(true);
    if (onError) onError();
  };

  return (
    <div className={`relative overflow-hidden ${placeholderClassName}`} 
         style={{ minHeight: !isLoaded ? loadingHeight : undefined }} 
         ref={imgRef}>
      {!isLoaded && !error && (
        <Skeleton className={`absolute inset-0 ${placeholderClassName}`} />
      )}
      
      {error && (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800 rounded-md p-4 text-sm text-muted-foreground">
          Falha ao carregar imagem
        </div>
      )}
      
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
}