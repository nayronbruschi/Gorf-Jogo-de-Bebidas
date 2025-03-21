import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { GorfLogo } from "@/components/GorfLogo";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuthMenu } from "@/hooks/use-auth-menu";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const user = auth.currentUser;
  const isDashboard = location === "/dashboard";
  const { menuItems } = useAuthMenu();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.email?.split('@')[0] || "Usuário");
    }
  }, [user]);

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-950 to-black">
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-lg border-b border-white/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {!isDashboard ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
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
                        <p className="font-medium text-white">{displayName}</p>
                        <p className="text-sm text-white/60">{user?.email}</p>
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
                              className="w-full justify-start gap-2 text-white hover:bg-white/10"
                              onClick={() => {
                                navigate(item.href);
                                setOpen(false);
                              }}
                            >
                              {Icon && <Icon size={20} />}
                              {item.label}
                            </Button>
                          </li>
                        );
                      })}
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

      <main className="flex-1 pt-16 pb-safe">
        {children}
      </main>
    </div>
  );
}