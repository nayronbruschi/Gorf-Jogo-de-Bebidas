import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { motion } from "framer-motion";

interface GameLayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
  showPlayers?: boolean;
}

export function GameLayout({ children, title, className, showPlayers = true }: GameLayoutProps) {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
      <nav className="p-4 flex items-center justify-between relative bg-black/20 backdrop-blur-sm">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/game-modes")}
          className="text-white"
        >
          <Home className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          Gorf
        </h1>
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