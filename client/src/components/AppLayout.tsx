import { useState } from "react";
import { useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, GamepadIcon, BarChart2, LogOut, UserCircle } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const user = auth.currentUser;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const menuItems = [
    { icon: Home, label: "Início", href: "/dashboard" },
    { icon: GamepadIcon, label: "Jogos", href: "/game-modes" },
    { icon: UserCircle, label: "Perfil e Estatísticas", href: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex-1" />
          <h1 className="text-3xl font-bold text-white text-center">Gorf</h1>
          <div className="flex-1 flex justify-end">
            <Sheet open={open} onOpenChange={setOpen}>
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

                  <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                      {menuItems.map((item) => (
                        <li key={item.href}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 text-white hover:bg-white/10"
                            onClick={() => {
                              navigate(item.href);
                              setOpen(false);
                            }}
                          >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  <div className="p-4 border-t border-white/10">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10"
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

      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}