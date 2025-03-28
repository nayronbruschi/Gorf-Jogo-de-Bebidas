import { useState } from 'react';

interface AdBannerProps {
  className?: string;
  position?: 'top' | 'middle' | 'bottom';
}

export function AdBanner({ className, position = 'top' }: AdBannerProps) {
  // Estado para simular cliques (apenas para desenvolvimento)
  const [clicked, setClicked] = useState(false);

  // No ambiente de produção, aqui seria implementado o AdSense
  // Mas por enquanto, mostraremos um banner personalizado

  const handleClick = () => {
    // Em produção, não precisaríamos deste código
    setClicked(true);
    setTimeout(() => setClicked(false), 300);
  };

  // Diferentes tamanhos para diferentes posições
  const getHeight = () => {
    switch (position) {
      case 'top': return 'h-[90px]';
      case 'middle': return 'h-[100px]';
      case 'bottom': return 'h-[120px]';
      default: return 'h-[90px]';
    }
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