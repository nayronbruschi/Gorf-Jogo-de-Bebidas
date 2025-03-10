import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { motion } from "framer-motion";

interface GameLayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

export function GameLayout({ children, title, className }: GameLayoutProps) {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
      <nav className="p-4 flex items-center relative bg-black/20 backdrop-blur-sm">
        <div className="absolute left-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/game-modes")}
          >
            <Home className="h-6 w-6 text-white" />
          </Button>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <h1 className="text-2xl font-bold text-white">Gorf</h1>
        </div>
        {/* Espaço vazio à direita para manter o logo centralizado */}
        <div className="w-[40px]" />
      </nav>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("container mx-auto p-4", className)}
      >
        {title && <h2 className="text-3xl font-bold text-white text-center mb-8">{title}</h2>}
        {children}
      </motion.main>
    </div>
  );
}