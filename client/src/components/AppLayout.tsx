import { useState } from "react";
import { useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Home, GamepadIcon, BarChart2, LogOut } from "lucide-react";
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
    { icon: BarChart2, label: "Estatísticas", href: "/stats" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-white p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user?.photoURL || ""} />
                      <AvatarFallback>
                        {user?.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.displayName || "Usuário"}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <nav className="flex-1 p-4">
                  <ul className="space-y-2">
                    {menuItems.map((item) => (
                      <li key={item.href}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2"
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

                <div className="p-4 border-t">
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

          <div className="flex-1" />
        </div>
      </header>

      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
