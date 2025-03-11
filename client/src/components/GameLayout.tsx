import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, UserCircle, GamepadIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/firebase";
import { GorfLogo } from "./GorfLogo";

interface GameLayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
  showPlayers?: boolean;
}

export function GameLayout({ children, title, className, showPlayers = true }: GameLayoutProps) {
  const [, navigate] = useLocation();
  const user = auth.currentUser;

  const menuItems = [
    { icon: Home, label: "Início", href: "/dashboard" },
    { icon: UserCircle, label: "Perfil e Estatísticas", href: "/profile" },
    { icon: GamepadIcon, label: "Todos os Jogos", href: "/game-modes" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800">
      <nav className="p-4 flex items-center justify-between relative bg-black/20 backdrop-blur-sm">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="text-white hover:bg-white/10"
        >
          <Home className="h-6 w-6" />
        </Button>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <GorfLogo size="small" />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Avatar className="h-10 w-10 cursor-pointer hover:opacity-90 transition-opacity">
              <AvatarImage src={user?.photoURL || ""} />
              <AvatarFallback>
                {user?.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-gray-900 p-0 border-none">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.photoURL || ""} />
                    <AvatarFallback>
                      {user?.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">{user?.displayName || "Usuário"}</p>
                    <p className="text-sm text-white/60">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-4">
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <Button
                      key={item.href}
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10"
                      onClick={() => navigate(item.href)}
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
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