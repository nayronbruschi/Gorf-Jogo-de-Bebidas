import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { LucideIcon } from "lucide-react";
import { ArrowRightIcon } from "lucide-react";

interface GameCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  isFeatured?: boolean;
  featureTag?: string;
}

export function GameCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  isFeatured = false, 
  featureTag = "Em Destaque" 
}: GameCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="cursor-pointer h-full"
      >
        <Card className="h-full p-0 bg-white rounded-2xl shadow-lg border-2 border-purple-600 overflow-hidden relative backdrop-blur-sm">
          {/* Efeito de vidro e gradiente no fundo */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-green-50/20 z-0"></div>
          
          {/* Tag de destaque */}
          {isFeatured && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-700 to-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 flex items-center space-x-1.5">
              <span className="block h-2 w-2 rounded-full bg-white animate-pulse"></span>
              <span className="tracking-wide">{featureTag}</span>
            </div>
          )}
          
          <div className="p-6 relative z-1 flex flex-col h-full">
            {/* Ícone destacado */}
            <div className="mb-5 flex items-center gap-4">
              <div className="p-3.5 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl shadow-md flex items-center justify-center">
                <Icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-900">{title}</h3>
            </div>
            
            <p className="text-gray-600 mb-auto text-sm leading-relaxed">{description}</p>
            
            {/* Botão mais elegante */}
            <div className="flex justify-end mt-5 pt-2 border-t border-gray-100">
              <div className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full bg-[#326800] text-white shadow-sm hover:shadow-md transition-all">
                Jogar <ArrowRightIcon className="ml-0.5 h-4 w-4" />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}