import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, Beer, Users } from "lucide-react";
import { PlayerList } from "./PlayerList";
import { motion } from "framer-motion";

interface GameLayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
  showPlayers?: boolean;
}

export function GameLayout({ children, title, className, showPlayers = true }: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
      <nav className="p-4 flex items-center justify-between bg-black/20 backdrop-blur-sm">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <Home className="h-6 w-6 text-white" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Beer className="h-8 w-8 text-white" />
          <h1 className="text-2xl font-bold text-white">Drink Games</h1>
        </div>
        {showPlayers && (
          <Button variant="ghost" size="icon">
            <Users className="h-6 w-6 text-white" />
          </Button>
        )}
      </nav>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("container mx-auto p-4", className)}
      >
        <h2 className="text-3xl font-bold text-white text-center mb-8">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
            {children}
          </div>
          {showPlayers && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <PlayerList />
            </div>
          )}
        </div>
      </motion.main>
    </div>
  );
}
