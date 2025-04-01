import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { GorfLogo } from "@/components/GorfLogo";
import { InstallAppPrompt } from "@/components/InstallAppPrompt";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuthMenu } from "@/hooks/use-auth-menu";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const user = auth.currentUser;
  const isDashboard = location === "/dashboard";
  const { menuItems } = useAuthMenu();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.email?.split('@')[0] || "Usuário");
    }
  }, [user]);

  // Verificar se o popup de instalação deve ser mostrado
  useEffect(() => {
    // Verificar se já está instalado como PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isStandalone) {
      // Se já estiver instalado, não mostrar o popup
      return;
    }

    // Verificar se o popup já foi dispensado hoje
    const lastDismissed = localStorage.getItem('installPromptDismissed');
    if (!lastDismissed) {
      // Se nunca foi dispensado, mostrar após 2 segundos
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Se foi dispensado recentemente, não mostrar
    const lastDate = new Date(lastDismissed);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Por padrão, mostrar a cada 7 dias se a configuração não estiver disponível
    const defaultFrequency = 7;
    
    if (daysDiff >= defaultFrequency) {
      // Se passou o período de frequência, mostrar após 2 segundos
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const HomeIcon = menuItems[0]?.icon;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="fixed top-0 left-0 right-0 z-40 bg-gorf-purple shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {!isDashboard ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-purple-700"
              onClick={() => navigate("/dashboard")}
            >
              {HomeIcon && <HomeIcon size={24} />}
            </Button>
          ) : (
            <GorfLogo size="small" className="flex-shrink-0" />
          )}
          <div className="flex-1 flex justify-end">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Avatar className="h-10 w-10 cursor-pointer hover:opacity-90 transition-opacity border-2 border-gorf-purple">
                  <AvatarImage src={user?.photoURL || ""} />
                  <AvatarFallback className="bg-gorf-purple text-white">
                    {user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white p-0 border-none shadow-xl">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-slate-200 bg-gorf-purple text-white">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-white">
                        <AvatarImage src={user?.photoURL || ""} />
                        <AvatarFallback className="bg-white text-gorf-purple">
                          {user?.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{displayName}</p>
                        <p className="text-sm text-white/80">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                      {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.href}>
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-2 text-slate-800 hover:bg-slate-100"
                              onClick={() => {
                                navigate(item.href);
                                setOpen(false);
                              }}
                            >
                              {Icon && <Icon size={20} className="text-gorf-purple" />}
                              {item.label}
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  <div className="p-4 border-t border-slate-200">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-5 w-5" />
                      Sair
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16 pb-safe">
        {children}
      </main>

      {/* Popup de instalação */}
      <InstallAppPrompt
        open={showInstallPrompt}
        onOpenChange={setShowInstallPrompt}
      />
    </div>
  );
}